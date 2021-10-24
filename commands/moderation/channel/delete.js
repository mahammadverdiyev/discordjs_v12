const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'delete',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_CHANNELS],
    description: 'Deletes channel(s) by tag. Use \'current\' argument to delete current channel.',
    aliases: ['remove'],
    args: true,
    usage: '<channel tag(s)>',
    permissions: 'MANAGE_CHANNELS',
    guildOnly: true,
    execute(message, args, commandName) {
        if (!message.mentions.channels.size && args[0] !== 'current') {
            message.channel.send('Tag channel(s) or use \'current\' argument.');
            return;
        }

        if (message.mentions.channels.size > 0) {
            const mentionedChannelCount = message.mentions.channels.size;
            const mentionedChannels = message.mentions.channels;
            mentionedChannels.each(channel => channel.delete());
            message.channel.send(`Mentioned ${mentionedChannelCount} channel(s) have been deleted succesfully`);

        }
        else {
            message.channel.delete();
        }

    }
}

