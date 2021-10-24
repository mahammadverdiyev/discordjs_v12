const discord = require('discord.js');
const ReactionRole = require('../../database/models/reaction-roles');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'messageReactionRemove',
    async execute(reaction, user) {
        const bot = reaction.message.guild.me;


        if (!bot.hasPermission(FLAGS.VIEW_CHANNEL) || !bot.hasPermission(FLAGS.SEND_MESSAGES)
            || !bot.hasPermission(FLAGS.MANAGE_ROLES)) return;


        if (reaction.message.partial) await reaction.message.fetch();
        if (reaction.partial) await reaction.fetch();
        if (user.bot) return;

        ReactionRole.findOne({ guildId: reaction.message.guild.id }, async (err, data) => {
            if (!data) return;
            if (!Object.keys(data.reactionRoles).includes(reaction.message.id)) return;


            const roleId = data.reactionRoles[reaction.message.id][reaction.emoji.name].roleId;

            const roleName = data.reactionRoles[reaction.message.id][reaction.emoji.name].name;


            reaction.message.guild.members.cache.get(user.id).roles.remove(roleId);


            if (roleName) {
                user.send(`You have lost **${roleName}** role`);
            } else {
                user.send("You have lost a role");
            }
        });
    }
}
