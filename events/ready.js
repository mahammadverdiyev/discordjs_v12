const MEMBERS_COUNT_CHANNEL_ID = '880702387751383061'
const OUR_GUILD_ID = '816271846185500683'
const Settings = require('../database/models/settings-schema');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('User joined to the server');
        setTimeout(async () => {
            await initializeSettings(client);
            await checkBumpDates(client);
        }, 2000);
    },
};


function updateMembersCount(guild, memberCounterSetting) {
    const channel = guild.channels.cache.get(memberCounterSetting.channelId);
    channel.setName(`Members: ${guild.memberCount.toLocaleString()}`);
}


async function initializeSettings(client) {
    const allSettings = await Settings.find();
    if (!allSettings) return;
    if (!allSettings.length) return;

    await allSettings.forEach(async setting => {
        client.settings.set(setting.guildId, setting.settings);
        client.features.set(setting.guildId, setting.features);
        client.defaultPrefixes.set(setting.guildId, setting.defaultPrefix);
        client.ignoredChannels.set(setting.guildId, setting.ignoredChannels);
        client.prefixes.set(setting.guildId, setting.prefixes);
        if (setting.settings && setting.settings['memberCounter'] && setting.settings['memberCounter'].active) {
            const guild = client.guilds.cache.get(setting.guildId);
            const memberCounterSetting = setting.settings['memberCounter'];
            let interval = setInterval(() => {
                console.log("INTERVAL WORKED");
                updateMembersCount(guild, memberCounterSetting);
            }, 600000);
            client.memberCounterIntervals.set(setting.guildId, interval);
        }
    });

}

async function checkBumpDates(client) {
    const allSettings = client.settings;
    if (!allSettings.size) return;

    allSettings.forEach((setting, guildId) => {
        if (!setting) return;
        const bumpReminder = setting['bumpReminder'];

        if (!bumpReminder) return;

        const guild = client.guilds.cache.get(guildId);

        const channelId = bumpReminder.channelId;
        const bumpChannel = guild.channels.cache.get(channelId);

        const pingRoleId = bumpReminder.roleId;
        const pingRole = guild.roles.cache.get(pingRoleId);

        try {
            console.log(bumpReminder);
            const lastBumpDate = bumpReminder.lastBumped;

            if (!lastBumpDate) return;

            const differenceInMs = Math.abs(Date.now() - lastBumpDate);
            const notifyAfter = 7200000 - differenceInMs;

            if (differenceInMs >= 7200000) {
                bumpChannel.send(`${pingRole} It's time to bump! 😃`);
            } else {
                setTimeout(async () => await bumpChannel.send(`${pingRole} It's time to bump! 😃`), notifyAfter);
            }
        } catch (e) { console.log(e); }
    });

}


