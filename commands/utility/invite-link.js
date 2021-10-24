const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'invitelink',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.CREATE_INSTANT_INVITE],
    cooldown: 5,
    description: 'Returns one of the invite links of the server.',
    guildOnly: true,
    permissions: "CREATE_INSTANT_INVITE",
    execute(message) {
        const { guild } = message;

        guild.fetchInvites().then(invites => {
            const invite = invites.random();

            const inviteCode = invite.code;

            message.channel.send(`discord.gg/${inviteCode}`);
        })
    },
};