const Settings = require('../../database/models/settings-schema');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;



module.exports = {
    name: 'addprefix',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    description: 'Adds new prefix to the database.',
    guildOnly: true,
    usage: '<prefix>',
    args: true,
    permissions: 'MANAGE_CHANNELS',
    async execute(message, args, commandName) {
        const { client, guild } = message;
        const guildId = guild.id;
        const prefix = args.join(' ').trim();
        let defaultPrefix = client.defaultPrefixes.get(guildId);
        if (!defaultPrefix) defaultPrefix = "[]";

        if (prefix === defaultPrefix) return;

        let prefixes = client.prefixes.get(guildId);

        if (prefix.length > 2) {
            message.reply("Prefix size can not be larger than two characters.");
            return;
        }

        if (!prefixes) {
            client.prefixes.set(message.guild.id, []);
            prefixes = client.prefixes.get(guildId);
        }

        if (prefixes && prefixes.includes(prefix)) {
            message.reply(`Prefix ${prefix} has already been defined`);
            return;
        }
        try {
            Settings.findOne({ guildId }, async (err, data) => {
                if (!data) {
                    const settings = await new Settings({
                        guildId,
                        prefixes: [prefix],
                    });
                    await settings.save().catch(e => console.log(e));
                    client.settings.set(guildId, settings.settings);
                    client.features.set(guildId, settings.features);
                } else {
                    data.prefixes.push(prefix);
                    await Settings.findOneAndUpdate({ guildId }, data);
                }
            });

            message.reply(`It's on me :sunglasses:`);
            prefixes.push(prefix);
        } catch (e) {
            message.channel.send("Error occurred during saving prefix to the database.");
            console.log(e);
        }

    },
};