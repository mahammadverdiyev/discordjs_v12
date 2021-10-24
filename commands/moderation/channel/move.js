const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'move',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_CHANNELS],
    args: true,
    description: 'This is advanced version of \'moveto\' command.',
    usage: '<channel tag(s)> <category name>',
    permissions: 'MANAGE_CHANNELS',
    guildOnly: true,
    execute(message, args, commandName) {

        if (!message.mentions.channels.size) {
            message.channel.send('You need to tag a channel(s) in order to move them.');
            return;
        }

        let categoryNameArr = args.filter(arg => !arg.includes('#'));

        const targetCategoryName = categoryNameArr.join(' ').toLowerCase();

        const categories = message.guild.channels.cache.filter(channel => channel.type === 'category');
        const targetCategory = categories.find(category => category.name.toLowerCase() === targetCategoryName);

        if (targetCategory) {
            const mentionedChannels = message.mentions.channels;
            mentionedChannels.each(channel => {
                channel.setParent(targetCategory);
            });
            message.channel.send(`Mentioned channel(s) moved to ${targetCategory.name} category.`);
        }

        else {
            message.channel.send(`There is no category with the name of '${targetCategoryName}'`);
        }
    }
}

