const fetch = require('node-fetch');
const axios = require('axios');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'docs',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    description: 'Displays Discord.JS documentation',
    usage: '<search>',
    args: true,
    async execute(message, args, commandName) {
        const searchText = args.join(' ');
        const uri = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${searchText}`;

        axios.get(uri)
            .then(embed => {
                const { data } = embed;
                if (data && !data.error) {
                    message.channel.send({ embed: data });
                } else {
                    message.reply('Could not find that documentation.');
                }
            }).catch(error => {
                console.error(error);
            })
    }
}