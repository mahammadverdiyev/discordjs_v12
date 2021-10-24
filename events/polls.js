const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'message',
    args: true,
    execute(message) {
        return;
        if (message.channel.id != 866002551252844585) return;

        if (message.author.bot) return;

        const { content } = message;

        const lines = content.split('\n');
        const emojis = [];
        const title = lines[0];

        for (let line of lines) {
            if (line.includes('=')) {
                const splitted = line.split('=');
                const emoji = splitted[0].trim();
                emojis.push(emoji);
            }
        }

        const embed = new MessageEmbed()
            .setTitle(title)
            .setColor(0xff0000)
            .setDescription(`React to give yourself a role.\n${message.content}`)
        message.channel.send(embed).then(message => {
            for (const emoji of emojis) {
                message.react(emoji);
            }
        });
        message.delete();

    }
}

