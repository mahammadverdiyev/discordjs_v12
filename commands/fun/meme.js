
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
// api documentation  (do not delete)  https://github.com/D3vd/Meme_Api

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'meme',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    description: 'Generates meme.',
    guildOnly: true,
    async execute(message, args, commandName) {
        let URL = 'https://meme-api.herokuapp.com/gimme';
        if (args.length) {
            const subreddit = args.join(' ');
            URL = `${URL}/${subreddit}/50`;
        } else {
            URL = `${URL}/50`;
        }
        try {
            fetch(URL)
                .then(res => res.json())
                .then(async result => {
                    const index = Math.floor(Math.random() * result.memes.length);
                    const json = result.memes[index];
                    const memeEmbed = new MessageEmbed()
                        .setTitle(json.title)
                        .setImage(json.url)
                        .setFooter(`${json.subreddit} ${json.postLink}`);

                    let msg = await message.channel.send('Fetching you a meme ...');
                    msg.edit(memeEmbed);
                });
        } catch (error) {
            message.reply('Seems like could not find a meme...');
            console.log(error);
        }
    }
}
