const { MessageEmbed } = require('discord.js')
const axios = require('axios')
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;



module.exports = {
    name: 'binary',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    description: 'Shows your text in Binary Format',
    usage: "<text>",
    args: true,
    guildOnly: true,
    async execute(message, args, commandName) {
        const url = `http://some-random-api.ml/binary?text=${args.join(" ")}`;

        let response, data;

        try {
            response = await axios.get(url);
            data = response.data;
        } catch (e) {
            return message.channel.send(`An error occured, please try again!`);
        }

        const embed = new MessageEmbed()
            .setTitle("Text to Binary")
            .setThumbnail(
                "https://png.pngtree.com/png-clipart/20200225/original/pngtree-binary-code-and-magnifying-glass-isometric-icon-png-image_5252004.jpg"
            )

            .setDescription("**Binary Code** - `" + data.binary + "`")
            .setTimestamp()

        await message.channel.send(embed);

    }
}
