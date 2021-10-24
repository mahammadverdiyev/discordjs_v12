const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'createchannel',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_CHANNELS],
    description: 'This command creates a new channel in the current category.',
    aliases: ['newchannel'],
    usage: '[channel name]',
    permissions: 'MANAGE_CHANNELS',
    guildOnly: true,
    execute(message, args, commandName) {
        if (args.length < 1) {
            message.channel.send('Please specify a channel name');
            return;
        }

        let channelName = args.join(' ');

        let categories = message.guild.channels.cache.filter(channel => channel.type === 'category');
        currentCategory = categories.find(category => category.children.some(channel => channel.name === message.channel.name));

        if (!message.guild.channels.cache.some(channel => channel.name === channelName)) {
            message.guild.channels.create(channelName, { type: 'text' }).then(channel => {
                channel.setParent(currentCategory);
            }).catch(error => {
                message.channel.send(`Error: ${error}`);
            });
        } else {
            message.channel.send(`Channel ${channelName} already exists`);
        }
    }
}