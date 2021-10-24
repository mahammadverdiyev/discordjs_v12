const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'create',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_CHANNELS],
    description: 'With this command, you can create different types of channels, types are text, voice, category',
    aliases: ['make', 'build', 'generate'],
    args: true,
    usage: '<type> <name>',
    permissions: 'MANAGE_CHANNELS',
    guildOnly: true,
    execute(message, args, commandName) {
        if (args.length < 2) {
            message.channel.send('Please specify a channel name');
            return;
        }

        const channelTypes = ['text', 'voice', 'category'];
        const type = args.shift().toLowerCase();
        const channelName = args.join(' ');

        if (!channelTypes.includes(type)) {
            message.channel.send('Please specify a valid channel type');
            message.channel.send(`Valid types are ${channelTypes.join(', ')}`);
            return;
        }

        const categories = message.guild.channels.cache.filter(channel => channel.type === 'category');
        const currentCategory = categories.find(category => category.children.some(channel => channel.name === message.channel.name));

        if (!message.guild.channels.cache.some(channel => channel.name === channelName)) {
            message.guild.channels.create(channelName, { type: `${type}` }).then(channel => {
                channel.setParent(currentCategory);
                message.channel.send(`'${channelName}' ${type} channel  succesfully created!`);
            });
        }

        else {
            message.channel.send(`Channel ${channelName} already exists`);
        }

    }
}

