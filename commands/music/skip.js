const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: "skip",
    inVoiceChannel: true,
    async execute(message, args, commandName) {
        if (!message.member.permissions.has("ADMINISTRATOR")) return;

        const { client } = message;
        const queue = client.distube.getQueue(message)
        if (!queue) return message.channel.send(`${client.emotes.error} | There is nothing in the queue right now!`)
        try {
            client.distube.skip(message)
            message.channel.send(`${client.emotes.success} | Skipped! Now playing:\n${queue.songs[0].name}`)
        } catch (e) {
            message.channel.send(`${client.emotes.error} | ${e}`)
        }
    }
}