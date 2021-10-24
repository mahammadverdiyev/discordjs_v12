const warnSchema = require('../../../database/models/warn-schema');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'warn',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    description: 'Warns a user',
    guildOnly: true,
    usage: '<member> [reason]',
    args: true,
    permissions: 'ADMINISTRATOR',
    async execute(message, args, commandName) {
        const target = message.mentions.users.first();

        if (!target) {
            message.reply("Please specify someone to warn.");
            return;
        }
        args.shift();

        const guildId = message.guild.id;
        const userId = target.id;
        const reason = args.join(' ');

        const warning = {
            author: message.member.user.tag,
            timestamp: new Date().getTime(),
            reason
        };

        await warnSchema.findOneAndUpdate({
            guildId, userId
        }, {
            guildId,
            userId,
            $push: {
                warnings: warning
            }
        }, {
            upsert: true
        });
    }
}