const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'avatar',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    aliases: ['icon', 'pfp'],
    guildOnly: true,
    execute(message, args, commandName) {
        if (message.mentions.users.size == 0) {
            const user = message.author;
            message.channel.send(`${user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })}`)
            return;
        }

        const avatarList = message.mentions.users.map(user => {
            return user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });
        });

        message.channel.send(avatarList);
    }
}