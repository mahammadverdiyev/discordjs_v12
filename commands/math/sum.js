const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'sum',
    args: true,
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    description: 'Calculates sum of given numbers as an argument.',
    usage: '<number arguments>',
    execute(message, args, commandName) {
        let sum = 0;

        args.forEach(argument => {
            const number = parseInt(argument);
            if (number) {
                sum += number;
            }
        });
        message.reply(`Sum = ${sum}`);
    }
}