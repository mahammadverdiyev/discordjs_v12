const warnSchema = require('../../../database/models/warn-schema');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'listwarnings',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    aliases: ['lw'],
    description: 'Show a list of warnings of member.',
    guildOnly: true,
    usage: '<member>',
    args: true,
    permissions: 'ADMINISTRATOR',
    async execute(message, args, commandName) {
        const target = message.mentions.users.first();

        if (!target) {
            message.reply("Please specify a user to get warnings for.");
            return;
        }
        args.shift();

        const guildId = message.guild.id;
        const userId = target.id;

        const results = await warnSchema.findOne({
            guildId,
            userId
        });

        if (!results) {
            message.reply("No one has been warned yet.");
            return;
        }

        let reply = `Previous warnings for <@${results.userId}>:\n\n`

        for (const warning of results.warnings) {
            const { author, timestamp, reason } = warning;
            reply += `By ${author} on  ${new Date(timestamp).toLocaleDateString()} for "${reason}\n\n"`;
        }
        message.reply(reply);
    }
}