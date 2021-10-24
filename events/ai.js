const fetch = require('node-fetch');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'message',
    async execute(message) {
        if (message.channel.type === 'dm') return;
        if (message.author.bot) return;

        const { client, guild } = message;
        const guildId = guild.id;

        const bot = guild.me;

        if (!bot.hasPermission(FLAGS.VIEW_CHANNEL) || !bot.hasPermission(FLAGS.SEND_MESSAGES))
            return;

        const guildSettings = client.settings.get(guildId);

        if (!guildSettings || !Object.values(guildSettings).length || !guildSettings['chatBot'])
            return;

        const targetChannelId = guildSettings['chatBot'].channelId;
        if (message.channel.id === targetChannelId) {
            const { content, author } = message;
            fetch(`https://api.monkedev.com/fun/chat?msg=${content}&uid=${author.id}`)
                .then(response => response.json())
                .then(data => {
                    message.reply(data.response);
                }).catch(error => {
                    console.log(error);
                });
        }
    }
}