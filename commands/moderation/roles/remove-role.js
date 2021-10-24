const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'removerole',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_ROLES],
    args: true,
    aliases: ['deleterole', 'takerole'],
    permissions: 'ADMINISTRATOR',
    usage: "target user's @> <role name>",
    guildOnly: true,
    execute(message, args, commandName) {
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            message.reply('Please mention someone to give a role.');
            return;
        }

        // remove mention argument
        args.shift();

        const roleName = args.join(' ');
        const { guild } = message;

        const role = guild.roles.cache.find(role => role.name === roleName);

        if (!role) {
            message.reply(`There is no role with the name "${roleName}"`);
            return;
        }

        const member = guild.members.cache.get(targetUser.id);
        const roleExist = member.roles.cache.find(role => role.name === roleName);

        if (!roleExist) {
            message.reply(`${targetUser} does not have "${roleName}" role.`);
        }
        else {
            member.roles.remove(role);
            message.reply(`"${roleName}" role has been removed from ${targetUser}`);
        }
    }
}