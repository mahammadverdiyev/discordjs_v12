const fetch = require('node-fetch');
const URL = 'https://api.thecatapi.com/v1/images/search';
const { MessageEmbed, MessageMentions } = require('discord.js');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'cat',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    description: 'Generates random cat image.',
    guildOnly: true,
    async execute(message, args, commandName) {
        const response = await fetch(URL);
        const json = await response.json();
        const embed = new MessageEmbed()
            .setImage(json[0].url)
            .setColor('RANDOM');

        message.channel.send(embed);
    }
}