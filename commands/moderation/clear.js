const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'clear',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_MESSAGES],
    description: 'Clears messages',
    args: true,
    usage: '<amount>',
    permissions: 'MANAGE_CHANNELS',
    guildOnly: true,
    execute(message, args, commandName) {
        const amount = Number.parseInt(args[0]) + 1;

        if (Number.isNaN(amount)) {
            message.reply('that doesn\'t seem to be a valid number.');
            return;
        } else if (amount < 2 || amount > 100) {
            message.reply('you need to input a number between 2 and 100');
            return;
        } else {
            message.channel.bulkDelete(amount, true).catch(err => {
                console.error(err);
                message.channel.send('there was an error trying to prune messages in this channel!');
            });
        }
    },
};