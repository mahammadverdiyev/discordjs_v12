const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;
const pop = require("popcat-wrapper")

module.exports = {
    name: 'joke',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    guildOnly: true,
    async execute(message, args, commandName) {
        const joke = await pop.joke();
        message.channel.send(joke);

    }
}