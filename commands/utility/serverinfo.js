const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'serverinfo',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.EMBED_LINKS],
    description: 'Gives info about server.',
    guildOnly: true,
    execute(message, args, commandName) {
        const { guild } = message;

        const { name, region, memberCount, createdAt } = guild;
        const channelsCount = guild.channels.cache.size;

        const icon = guild.iconURL();

        const embed = new MessageEmbed()
            .setColor('#b4a1eb')
            .setTitle(`Server info for ${name}`)
            .setThumbnail(icon)
            .addFields({
                name: 'Region',
                value: region,
            }, {
                name: 'Members',
                value: memberCount,
            }, {
                name: 'Channels',
                value: channelsCount,
            }, {
                name: 'Created at',
                value: createdAt.toDateString(),
            })

        message.channel.send(embed);
    }
}