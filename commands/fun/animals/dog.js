const fetch = require('node-fetch');
const URL = 'https://dog.ceo/api/breeds/image/random';
const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'dog',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    description: 'Generates random dog image.',
    guildOnly: true,
    async execute(message, args, commandName) {
        const response = await fetch(URL);
        const json = await response.json();
        const embed = new MessageEmbed()
            .setImage(json.message)
            .setColor('RANDOM');

        message.channel.send(embed);
    }
}