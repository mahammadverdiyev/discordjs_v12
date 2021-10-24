const memberCounter = require('../util/member-count-updater');
const canvacord = require("canvacord");
const Discord = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    execute(member) {
        const { guild } = member;
        const { client } = member;

        if (!client.settings.has(guild.id)) return;
        if (!client.settings.get(guild.id)['welcome']) return;

        giveMemberRole(client, member);

        const welcomeSetting = client.settings.get(guild.id)['welcome'];
        const welcomeChannelId = welcomeSetting.channelId;

        const welcomeChannel = guild.channels.cache.get(welcomeChannelId);

        if (!welcomeChannel) {
            console.log(`ERROR! GUILD ID = ${guild.id}
            WELCOME CHANNEL DOES NOT EXIST`);
            return;
        }

        try {
            const welcomeMessage = new canvacord.Welcomer()
                .setUsername(member.user.username)
                .setDiscriminator(member.user.discriminator)
                .setAvatar(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
                // .setColor('title', '#b4a1eb')
                .setColor('background', '#151417')
                .setColor('username-box', 'TRANSPARENT')
                .setColor('title-border', 'TRANSPARENT')
                .setColor('title', '#ffffff')
                .setColor('username', '#03a9fc')  //a487fa
                .setColor('discriminator-box', 'TRANSPARENT')
                .setColor('border', 'TRANSPARENT')
                .setColor('avatar', 'TRANSPARENT')
                // .setBackground('https://www.sciencefriday.com/wp-content/uploads/2018/05/stargazing.jpg')
                .setMemberCount(member.guild.memberCount)

            welcomeMessage.build()
                .then(data => {
                    const attachment = new Discord.MessageAttachment(data, 'welcome.png');
                    welcomeChannel.send(attachment);
                });

        } catch (error) {
            console.log(error);
        }

    },
};

async function giveMemberRole(client, member) {
    const autoRoleSetting = client.settings.get(member.guild.id)['autoRole'];
    if (!autoRoleSetting) return;
    const MEMBER_ROLE_ID = autoRoleSetting.roleId;

    try {
        const MEMBER_ROLE = member.guild.roles.cache.get(MEMBER_ROLE_ID);
        if (MEMBER_ROLE) {
            member.roles.add(MEMBER_ROLE);
        } else {
            console.log("ERROR ADDING ROLE...");
        }
    }
    catch (e) {
        console.log(e);
    }
}