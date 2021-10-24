const Settings = require('../../database/models/settings-schema');

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'prefixes',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    aliases: ['showallprefixes', 'showprefixes', 'allprefixes'],
    description: 'Shows all the prefixes',
    guildOnly: true,
    async execute(message, args, commandName) {
        const { client, guild } = message;
        const guildId = guild.id;
        let defaultPrefix = client.defaultPrefixes.get(guildId);

        if (!defaultPrefix) defaultPrefix = '[]';

        let prefixes = client.prefixes.get(guildId);


        if (!prefixes) {
            message.channel.send(`Guild only has \`${defaultPrefix}\` default prefix, to add more prefixes use ${defaultPrefix}addprefix {prefix} command.`);
            return;
        }

        if (prefixes.includes(defaultPrefix)) {
            prefixes = prefixes.filter(prefix => prefix !== defaultPrefix);
            client.prefixes.set(guildId, prefixes);
            try {
                await Settings.findOneAndUpdate({ guildId }, {
                    prefixes
                })
            } catch (e) {
                console.log(e);
            }
        }

        let combined = prefixes.length ? [defaultPrefix, ...prefixes] : [defaultPrefix];

        message.channel.send(combined.map(prefix => `\`${prefix}\``).join(', '));
    },
};
