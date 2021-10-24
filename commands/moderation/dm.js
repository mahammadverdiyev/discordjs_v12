const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'dm',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.BAN_MEMBERS, FLAGS.MANAGE_MESSAGES],
    description: 'DM a user in the guild',
    usage: '<user || user_id> <message>',
    args: true,
    permissions: 'ADMINISTRATOR',
    async execute(message, args, commandName) {
        let user =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);

        if (!user)
            return message.reply(
                `You did not mention a user, or you gave an invalid id`
            );

        args.shift();

        if (!args.join(" "))
            return message.reply("You did not specify your message");

        user.user
            .send(args.join(" "))
            .then(() => message.reply(`Sent a message to ${user.user.tag}`))
            .catch(() => message.reply("That user could not be DMed!"));
    }
}



