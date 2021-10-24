const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;
const { Client, Message, Util } = require("discord.js")

module.exports = {
    name: 'addemoji',
    aliases: ['emojilink'],
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.BAN_MEMBERS],
    description: 'Steals an emoji',
    guildOnly: true,
    usage: '<emoji(s)> | <link> <emoji_name>',
    args: true,
    permissions: 'ADMINISTRATOR',
    async execute(message, args, commandName) {
        if (!args.length) return message.reply('Please Specify Some Emojis!');

        if (commandName == "addemoji") {
            for (const rawEmoji of args) {
                const parsedEmoji = Util.parseEmoji(rawEmoji);

                if (parsedEmoji.id) {
                    const extension = parsedEmoji.animated ? ".gif" : ".png";
                    const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`;
                    message.guild.emojis.create(url, parsedEmoji.name)
                        .then((emoji) => message.channel.send(`Added: \`${emoji.url}\``));
                }
            }
        }

        else {
            const url = args.shift();
            const emojiName = args.shift();
            if (!emojiName) {
                return message.channel.send("You should give an emoji name");
            }
            message.guild.emojis.create(url, emojiName)
                .then((emoji) => message.channel.send(`Added: \`${url}\``));
        }
    }
}