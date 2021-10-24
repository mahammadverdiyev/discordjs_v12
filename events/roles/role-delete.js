const Settings = require('../../database/models/settings-schema');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        const guild = role.guild;
        const guildId = guild.id;
        const client = guild.client;

        if (!client.settings.get(guildId)) return;

        const guildSettings = client.settings.get(guildId);

        const muteRoleSetting = guildSettings['muteRole'];
        const jailRoleSetting = guildSettings['jailRole'];
        const memberRoleSetting = guildSettings['memberRole'];
        const autoRoleSetting = guildSettings['autoRole'];

        if (autoRoleSetting) {
            const autoRoleId = autoRoleSetting.roleId;
            if (autoRoleId === role.id) {
                delete client.settings.get(guildId)['autoRole'];
                await Settings.findOneAndUpdate({ guildId }, {
                    settings: client.settings.get(guildId)
                })
            }
        }

        if (memberRoleSetting) {
            const memberRoleId = memberRoleSetting.roleId;
            if (memberRoleId === role.id) {
                delete client.settings.get(guildId)['memberRole'];
                await Settings.findOneAndUpdate({ guildId }, {
                    settings: client.settings.get(guildId)
                })
            }
        }

        if (muteRoleSetting) {
            const muteRoleId = muteRoleSetting.roleId;
            if (muteRoleId === role.id) {
                delete client.settings.get(guildId)['muteRole'];
                await Settings.findOneAndUpdate({ guildId }, {
                    settings: client.settings.get(guildId)
                })
            }
        }

        if (jailRoleSetting) {
            const jailRoleId = jailRoleSetting.roleId;
            if (jailRoleId === role.id) {
                delete client.settings.get(guildId)['jailRole'];
                await Settings.findOneAndUpdate({ guildId }, {
                    settings: client.settings.get(guildId)
                })
            }
        }
        // Settings.findOne({ guildID }, async (err, data) => {
        //     delete data.settings['muteRole'];
        //     await Settings.findOneAndUpdate({ guildId }, data);
        //     client.settings.set(guildId, data.settings);
        // });
    }
}
