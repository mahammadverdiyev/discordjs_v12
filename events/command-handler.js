const config = require("../config.json");
const Discord = require('discord.js');
const Levels = require('discord-xp');
const Settings = require('../database/models/settings-schema');
const mongoose = require('mongoose');

// channels where all commands do not work

module.exports = {
    name: 'message',
    async execute(message) {

        if (message.author.bot) return;

        const client = message.client;
        let defaultPrefix = client.defaultPrefixes.get(message.guild.id);

        if (!defaultPrefix) defaultPrefix = '[]';

        const ignoredChannels = client.ignoredChannels.get(message.guild.id);

        const isDm = () => {
            return message.channel.type === 'dm';
        }
        const usedDefaultPrefix = () => {
            return message.content.startsWith(defaultPrefix);
        }


        const handleCommand = (usedPrefix) => {
            const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.commands.get(commandName)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return;
            if (command.inVoiceChannel && !message.member.voice.channel) return message.channel.send(`${client.emotes.error} | You must be in a voice channel!`)

            if (command.guildOnly && isDm()) {
                message.reply('I can\'t execute that command inside DMs!');
                return;
            }

            if (command.botPermissions) {
                const bot = message.guild.me;
                const neededPermissions = [];

                for (const permission of command.botPermissions) {
                    if (!bot.hasPermission(permission)) {
                        neededPermissions.push(permission);
                    }
                }
                if (neededPermissions.length) {
                    const answer = "I must have " + neededPermissions.map(permission => `\`${permission.split("_", " ").join(" ")}\``)
                        .join(", ") + neededPermissions.length == 1 ? "permission to run that command" : "permissions to run that command";
                    message.reply(answer);
                    return;
                }
            }

            if (command.permissions) {
                const authorPerms = message.channel.permissionsFor(message.author);
                if (!authorPerms || !authorPerms.has(command.permissions)) {
                    message.reply(`You must have \`${command.permissions.split("_").join(" ")}\` permission to do that!`);
                    return;
                    // return message.reply('You can not do this!');
                }
            }

            if (command.args && args.length == 0) {
                let reply = `You didn't provide any arguments, ${message.author}`;

                if (command.usage) {
                    reply += `\nThe proper usage would be: \`${usedPrefix}${command.name} ${command.usage}\``;
                }

                message.channel.send(reply);
                return;
            }

            const { cooldowns } = client;

            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Discord.Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown || 3) * 1000;

            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\``);
                    return;
                }
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            try {
                command.execute(message, args, commandName);
            } catch (exception) {
                console.error(exception);
                message.reply('there was an error trying to execute that command.');
            }
            return;
        };

        const giveXp = async () => {
            const randomXP = Math.floor(Math.random() * 29) + 1;

            const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomXP);
            if (hasLeveledUp) {
                const user = await Levels.fetch(message.author.id, message.guild.id);
                message.channel.send(`${message.member}, you have proceeded to level ${user.level}. Continue your work within the server.`);
            }
        };


        const isIgnoredChannel = () => {
            if (!ignoredChannels)
                return false;
            return ignoredChannels.includes(message.channel.id);
        };

        if (isDm() && usedDefaultPrefix()) {
            handleCommand(defaultPrefix);
        } else if (!isDm()) {
            let prefixes = client.prefixes.get(message.guild.id);
            // if (!prefixes) {
            //     let guildSettings = await Settings.findOne({ guildId: message.guild.id });

            //     if (!guildSettings) {
            //         guildSettings = await new Settings({
            //             _id: mongoose.Types.ObjectId(),
            //             guildId: message.guild.id,
            //         });
            //         await guildSettings.save().catch(err => console.log(err));
            //     }
            //     client.prefixes.set(message.guild.id, guildSettings.prefixes);
            //     prefixes = client.prefixes.get(message.guild.id);
            // }
            let usedPrefix;

            if (usedDefaultPrefix() && !isIgnoredChannel()) {
                handleCommand(defaultPrefix);
            } else {
                if (prefixes) {
                    usedPrefix = prefixes.find(prefix => {
                        if (message.content.startsWith(prefix)) {
                            return prefix;
                        }
                    });
                }

                if (!usedPrefix) {
                    giveXp();
                    return;
                } else if (!isIgnoredChannel()) {
                    handleCommand(usedPrefix);
                }
            }
        }


    }
}
