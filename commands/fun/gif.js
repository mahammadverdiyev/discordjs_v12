const fetch = require('node-fetch');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;
module.exports = {
    name: 'gif',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    cooldown: 5,
    description: 'Sends random gif related to the argument name.(default is \'animals\' if left empty)',
    usage: '<gif name>',
    guildOnly: true,
    async execute(message, args, commandName) {
        let keyword = ''

        if (args.length == 0) {
            keyword = 'animals';
        } else {
            keyword = args.join(' ');
        }

        const URL = `https://g.tenor.com/v1/search?q=${keyword}&key=${process.env.TENORKEY}&contentfilter=high`;

        try {
            let response = await fetch(URL);
            let json = await response.json();
            let index = Math.floor((Math.random() * json.results.length));
            message.reply(json.results[index].url);
        } catch (error) {
            message.reply(`Please specify a valid gif name.`);
        }

    },
};