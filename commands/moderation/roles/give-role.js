const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'giverole',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_ROLES],
    args: true,
    aliases: ['assignrole', 'giftrole'],
    permissions: 'ADMINISTRATOR',
    usage: "target user's @> <role name>",
    guildOnly: true,
    execute(message, args, commandName) {

        const { guild } = message;
        const taggedUsers = message.mentions.users;
        const authorMember = guild.members.cache.get(message.author.id);
        if (!taggedUsers) {
            message.reply('Please mention someone to give a role.');
            return;
        }

        let taggedUsersList = [];
        taggedUsers.forEach(taggedUser => {
            taggedUsersList.push(taggedUser);
            // removing mention arguments
            args.shift();
        });

        const roleName = args.join(' ');


        const role = guild.roles.cache.find(role => role.name === roleName);
        if (!role) {
            message.reply(`There is no role with the name "${roleName}"`);
            return;
        }

        const assignRoles = (usersList) => {
            usersList.forEach(user => {
                const member = guild.members.cache.get(user.id);
                member.roles.add(role);
                user.send(`${message.author.username ?? authorMember.nickname} has given you **${role.name}** role, congrats.`)
            });
        }

        assignRoles(taggedUsersList);
        message.reply("Done!");
    }
}