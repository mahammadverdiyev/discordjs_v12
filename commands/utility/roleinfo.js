const { MessageEmbed } = require('discord.js');

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'roleinfo',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    description: 'Shows info about role within Embed Message',
    args: true,
    guildOnly: true,
    usage: '<role mention | role name | role id>',
    async execute(message, args, commandName) {

        const { guild } = message;

        const mentionedRole = message.mentions.roles.first();
        let targetRole = undefined;

        if (mentionedRole) {
            targetRole = mentionedRole;
        }


        else if (parseInt(args[0])) {
            const roleID = args[0];
            let role = guild.roles.cache.get(roleID);
            if (role) {
                targetRole = role;
            }
            else {
                message.reply(`There is no role with id ${roleID}`);
                return;
            }
        }
        else {
            const roleName = args.join(' ');
            let role = guild.roles.cache.find(role => role.name === roleName);
            if (role) {
                targetRole = role;
            }
            else {
                message.reply(`There is no role with name ${roleName}`);
                return;
            }
        }

        if (!targetRole) {
            message.reply(`Could not find role you want...`);
            return;
        }


        if (!targetRole.members) {
            return;
        }

        let peopleWithThatRole;
        console.log(targetRole.members.size);
        if (targetRole.members.size > 5) {
            peopleWithThatRole = targetRole.members.map(member => `<@${member.id}>`)
                .slice(0, 5).join(', ') + ` and ${targetRole.members.size - 5} more members...`;
        }
        else if (targetRole.members.size <= 5) {
            peopleWithThatRole = targetRole.members.map(member => `<@${member.id}>`).join(', ');
        }


        let embed = new MessageEmbed()
            .setColor(targetRole.color)
            .setAuthor(guild.name, guild.iconURL())
            .setDescription(`**Role Name:** ${targetRole.name}
            
            **Role ID:** **\`${targetRole.id}\`**

            **Role Mentionable:** ${targetRole.mentionable.toString().replace('true', 'Yes').replace('false', 'No')}

            **Role Members Count:** ${targetRole.members.size || 0}`)

            .addField('Role Members:', peopleWithThatRole ? peopleWithThatRole : "No one have this role")

        message.channel.send(embed);
    }
}