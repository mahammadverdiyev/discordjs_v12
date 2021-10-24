const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;
const pop = require("popcat-wrapper")
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'reverse',
    aliases: ["rvrs", "rvs"],
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    guildOnly: true,
    usage: "<text>",
    args: true,
    async execute(message, args, commandName) {
        const text = args.join(" ")
        if (!text) return message.reply("Please give something to reverse!")
        let Rarray = text.split("")
        let reverseArray = Rarray.reverse()
        let result = reverseArray.join("")
        message.channel.send(result)
    }
}