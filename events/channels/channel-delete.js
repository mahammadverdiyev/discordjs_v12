const Settings = require('../../database/models/settings-schema');


module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        if (channel.type === 'dm') return;

        const guild = channel.guild;
        const guildId = guild.id;
        const client = guild.client;

        if (!client.settings.get(guildId)) return; ``

        const guildSettings = client.settings.get(guildId);

        const bumpReminderSetting = guildSettings['bumpReminder'];
        const welcomeSetting = guildSettings['welcome'];
        const chatBotSetting = guildSettings['chatBot'];
        const memberCounterSetting = guildSettings['memberCounter'];

        if (memberCounterSetting) {
            let interval = client.memberCounterIntervals.get(guildId);

            if (interval) {
                console.log("INTERVAL IS DELETED");
                clearInterval(interval);
                client.memberCounterIntervals.delete(guildId);
            }

            const memberCounterChannelId = memberCounterSetting.channelId;
            if (memberCounterChannelId === channel.id) {
                delete client.settings.get(guildId)['memberCounter'];
                await Settings.findOneAndUpdate({ guildId }, {
                    settings: client.settings.get(guildId)
                })
            }
        }

        if (bumpReminderSetting) {
            const bumpChannelId = bumpReminderSetting.channelId;
            if (bumpChannelId === channel.id) {
                delete client.settings.get(guildId)['bumpReminder'];
                await Settings.findOneAndUpdate({ guildId }, {
                    settings: client.settings.get(guildId)
                })
            }
        }

        if (welcomeSetting) {
            const welcomeChannelId = welcomeSetting.channelId;
            if (welcomeChannelId === channel.id) {
                delete client.settings.get(guildId)['welcome'];
                await Settings.findOneAndUpdate({ guildId }, {
                    settings: client.settings.get(guildId)
                })
            }
        }

        if (chatBotSetting) {
            const chatBotChannelId = chatBotSetting.channelId;
            if (chatBotChannelId === channel.id) {
                delete client.settings.get(guildId)['chatBot'];
                const modifiedIgnoredChannels =
                    client.ignoredChannels.get(guildId).filter(id => id !== chatBotChannelId);

                await Settings.findOneAndUpdate({ guildId }, {
                    ignoredChannels: modifiedIgnoredChannels,
                    settings: client.settings.get(guildId)
                })
            }
        }



    },
};
