const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;
const pop = require("popcat-wrapper")
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: 'color',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    guildOnly: true,
    async execute(message, args, commandName) {

        let color = args[0]
        if (!color) return message.channel.send('Please provide a hex code!')
        if (color.includes("#")) {
            color = color.split("#")[1]
        }
        try {
            const info = await pop.colorinfo(color)

            const embed = new MessageEmbed()
                .setTitle("Color Info")
                .addField('Name', info.name, true)
                .addField('Hex', info.hex, true)
                .addField('RGB', info.rgb, true)
                .addField('Brighter Shade', info.brightened, true)
                .setImage(info.color_image)
            message.channel.send(embed)
        } catch (error) {
            return message.channel.send("Invalid Color!")
        }

    }
}