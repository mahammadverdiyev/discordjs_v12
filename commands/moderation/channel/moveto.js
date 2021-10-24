const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'moveto',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_CHANNELS],
    description: 'This command moves current channel to given category.',
    args: true,
    usage: '<category name>',
    permissions: 'MANAGE_CHANNELS',
    guildOnly: true,
    execute(message, args, commandName) {
        const targetCategoryName = args.join(' ').toLowerCase();
        const categories = message.guild.channels.cache.filter(channel => channel.type === 'category');
        const targetCategory = categories.find(category => category.name.toLowerCase() === targetCategoryName);

        if (targetCategory) {
            message.channel.setParent(targetCategory);
            message.channel.send(`current channel succesffully moved to ${targetCategory.name} category!`);
        }
        else {
            message.channel.send(`There is no category with the name of '${targetCategoryName}'`);
        }
    }
}

