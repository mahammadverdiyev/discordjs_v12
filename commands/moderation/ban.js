const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'ban',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.BAN_MEMBERS],
    description: 'Ban a user from the server.',
    guildOnly: true,
    usage: '<member> [reason]',
    args: true,
    permissions: 'BAN_MEMBERS',
    async execute(message, args, commandName) {
        const taggedUser = message.mentions.members.first();
        const taggedMemberUsername = taggedUser.user.username;

        if (!taggedUser) {
            message.reply(`You should mention a member in order to kick(use @).`);
            return;
        }

        args.shift();
        let reason = 'Not defined';
        if (args.length) {
            reason = args.join(' ');
        }

        taggedUser.ban(reason).catch(error => {
            console.log(error);
        });
        message.channel.send(`You banned ${taggedMemberUsername}!`);
    }
}