const { prefix } = require('../../config.json');
const { MessageEmbed } = require('discord.js');

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'help',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    description: 'List all of my commands or info about a specific command',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args, commandName) {
        const { guild } = message;
        const { commands } = message.client;
        const memberPermissions = message.member.permissions;

        if (args.length == 0) {
            // const commandNames = commands.map(command => `\`${command.name}\``).join(' ');

            const commandNames = commands.filter(command => {
                return memberPermissions.has('ADMINISTRATOR') ||
                    !command.permissions ||
                    memberPermissions.has(command.permissions);
            }).map(command => `\`${command.name}\``).join(' ');


            const embed = new MessageEmbed()
                .setTitle(`Command list of Star Gazers`)
                .setAuthor(`${guild.name}`, guild.iconURL())
                .setDescription(commandNames)
                .setFooter(`You can send \`[]help <command name>\` to get info on a specific command!`)
                .setColor('RANDOM')


            return message.author.send(embed)
                .then(() => {
                    if (message.channel.type == 'dm') return;
                    message.reply('I\'ve sent you a DM with all my commands!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
        }
        // info about a specific command
        const name = args[0].toLowerCase();
        const command = commands.get(name)
            || commands.find((command) => command.aliases && command.aliases.includes(name));

        if (!command) {
            return message.reply('that is not a valid command.');
        }

        const embed = new MessageEmbed()
            .setTitle(`\`${command.name}\` command.`)
            .setColor('RANDOM');



        if (command.aliases) embed.addField(`Aliases`, command.aliases.join(', '));
        if (command.description) embed.addField(`Description`, command.description);
        if (command.usage) embed.addField('Usage', `\`${prefix}${command.name} ${command.usage}\``);

        embed.addField(`Cooldown`, `${command.cooldown || 3} second(s)`);
        embed.setThumbnail(guild.iconURL({ dynamic: true }));

        // message.channel.send(data, { split: true });
        message.channel.send(embed);
    }
}