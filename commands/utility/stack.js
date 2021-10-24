const stacksearch = require('@mahammadv/stackoverflow_search');

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'stack',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    aliases: ['stackoverflow'],
    description: 'Command for querying stackoverflow questions.',
    usage: '<query>',
    guildOnly: true,
    args: true,
    async execute(message, args, commandName) {
        let question = args.join(' ').replace('#', 'sharp');

        const embed = await stacksearch.search(question);
        message.channel.send(embed);
    },
};
