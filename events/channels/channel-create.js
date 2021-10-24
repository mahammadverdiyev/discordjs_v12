module.exports = {
    name: 'channelCreate',
    async execute(channel) {
        if (channel.type === 'dm') return;

        const guild = channel.guild;
        const guildId = guild.id;
        const client = guild.client;
        const guildSettings = client.settings.get(guildId);

        if (guildSettings && guildSettings['jailRole']) {
            const jailRoleSetting = guildSettings['jailRole'];
            const jailRoleId = jailRoleSetting.roleId;
            const jailRole = channel.guild.roles.cache.get(jailRoleId);

            if (jailRole) {
                await channel.createOverwrite(jailRole, {
                    VIEW_CHANNEL: false,
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            }

            const muteRoleSetting = guildSettings['muteRole'];
            const muteRoleId = muteRoleSetting.roleId;
            const muteRole = channel.guild.roles.cache.get(muteRoleId);

            if (muteRole) {
                await channel.createOverwrite(muteRole, {
                    SEND_MESSAGES: false
                });
            }
        }



    },
};
