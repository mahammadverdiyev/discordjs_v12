const Levels = require('discord-xp');
const { MessageEmbed } = require('discord.js');
const canvacord = require("canvacord");
const Discord = require('discord.js');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'level',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    cooldown: 5,
    description: 'Returns a level of the member.',
    guildOnly: true,
    async execute(message, args, commandName) {
        let mentionedMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!mentionedMember) mentionedMember = message.member;

        const target = await Levels.fetch(mentionedMember.user.id, message.guild.id);

        if (!target) {
            message.channel.send(`The member does not have any levels within the server.`);
            return;
        }

        try {
            const rank = new canvacord.Rank()
                .setAvatar(mentionedMember.user.displayAvatarURL({ format: 'png', dynamic: true }))
                .setCurrentXP(target.xp)
                .setRequiredXP(Levels.xpFor(target.level + 1))
                .setLevel(target.level)
                .setRank(1, 'RANK', false)
                .setStatus(mentionedMember.user.presence.status)
                .setProgressBar("#FFFFFF", "COLOR")
                // .setOverlay("#000000")
                .setUsername(mentionedMember.nickname || mentionedMember.user.username)
                .setDiscriminator(mentionedMember.user.discriminator);
            // .setBackground("IMAGE",'link/')

            rank.build()
                .then(data => {
                    const attachment = new Discord.MessageAttachment(data, 'rank.png');
                    message.channel.send(attachment);
                });
        } catch (error) {
            console.log(error);
        }
    },
};