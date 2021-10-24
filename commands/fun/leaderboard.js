const Levels = require('discord-xp');
const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'leaderboard',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    cooldown: 5,
    description: 'Displays the server\'s top 5 leveled users.',
    guildOnly: true,
    async execute(message, args, commandName) {
        const { client } = message;
        try {
            const rawLeaderboard = await Levels.fetchLeaderboard(message.guild.id, 5); // We grab top 10 users with most xp in the current server.

            if (rawLeaderboard.length < 1) return reply("Nobody's in leaderboard yet.");

            const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard, true).catch(error => {
                console.log(error);
            }); // We process the leaderboard.

            let userNames = '';
            let levels = '';
            let xp = '';
            let i = 0;

            leaderboard.forEach(user => {
                userNames += `\`${i + 1}\` ${user.username}\n`;
                i += 1;
                levels += `\`${user.level}\`\n`;
                xp += `\`${user.xp}\`\n`;
            });



            const embed = new MessageEmbed()
                .setAuthor(`Leaderboard for ${message.guild.name}`, message.guild.iconURL({ dynamic: true }))
                .setColor('RANDOM')
                .addFields({ name: 'Top 5', value: userNames, inline: true },
                    { name: 'Level', value: levels, inline: true },
                    { name: 'XP', value: xp, inline: true });

            message.channel.send(embed);

        } catch (error) {
            console.log(error);
        }



    },
};