const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'lockdown',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_CHANNELS, FLAGS.MANAGE_ROLES],
    description: 'Locks the current channel',
    permissions: 'ADMINISTRATOR',
    usage: '<lock:bool>',
    guildOnly: true,
    execute(message, args, commandName) {
        const { client, guild, channel } = message;
        const guildId = guild.id;

        const guildSettings = client.settings.get(guildId);

        if (!guildSettings || !Object.values(guildSettings).length || !guildSettings['memberRole']) {
            message.channel.send(`In order to use this command you should add Member Role with '{prefix}setup memberRole' command`);
            return;
        }

        const roleId = guildSettings['memberRole'].roleId;
        const memberRole = guild.roles.cache.get(roleId);

        if (!memberRole) {
            message.channel.send(`I couldn't find a Member role, please run '{prefix}setup memberRole' command to configure it again.`);
            return;
        }


        let allowToSendMessage = false;

        if (args.length) {
            allowToSendMessage = true;
        }

        try {
            channel.updateOverwrite(memberRole, {
                SEND_MESSAGES: allowToSendMessage
            })
        } catch (error) {
            console.log(error);
            message.reply(`I couldn't lock ${channel}`)
        }

        if (!allowToSendMessage)
            message.channel.send("Successfully locked current channel.");
        else
            message.channel.send("Current channel is unlocked.");
    }
}