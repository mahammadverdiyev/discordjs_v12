const { create, all } = require('mathjs');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'calculate',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    aliases: ['calc', 'compute', 'evaluate'],
    args: true,
    description: 'Advanced expression calculator.',
    usage: '<expression>',
    execute(message, args, commandName) {
        const config = {};
        const math = create(all, config);

        const expression = args.join(' ');

        try {
            const result = math.evaluate(expression);
            message.reply(`Result: ${result}`);
        } catch (error) {
            message.channel.send(error);
        }

    }
}