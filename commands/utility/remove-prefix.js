const Settings = require('../../database/models/settings-schema');

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;



module.exports = {
    name: 'removeprefix',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    aliases: ['rprefix', 'deleteprefix', 'dprefix', 'detachprefix'],
    description: 'Deletes the given prefix from database.',
    guildOnly: true,
    usage: "<prefix>",
    args: true,
    permissions: "ADMINISTRATOR",
    async execute(message, args, commandName) {
        const { client, guild } = message;
        const guildId = guild.id;

        const prefix = args.join(' ');

        let defaultPrefix = client.defaultPrefixes.get(guildId);

        console.log(defaultPrefix);


        if (!defaultPrefix) {
            console.log("Default prefix is undefined");
            defaultPrefix = '[]';
        }
        console.log(`PREFIX ${prefix}`);

        if (prefix === defaultPrefix) {
            message.reply(`You can't remove default prefix :pouting_cat:, but you can change it with setup command`);
            return;
        }

        let prefixes = client.prefixes.get(message.guild.id);

        if (!prefixes) {
            message.reply(`Such a prefix has not yet been defined`);
            return;
        }

        if (!prefixes.includes(prefix)) {
            message.reply(`Such a prefix has not yet been defined`);
            return;
        }

        let oldPrefixes = [];

        prefixes.forEach(prefix => {
            oldPrefixes.push(prefix);
        });

        let index = oldPrefixes.indexOf(prefix);

        if (index > -1) {
            oldPrefixes.splice(index, 1);
        }

        try {
            await Settings.findOneAndUpdate({
                guildId
            }, {
                prefixes: oldPrefixes,
            });
            client.prefixes.set(guildId, oldPrefixes);
            message.channel.send(`Done :white_check_mark:`);
        } catch (e) {
            message.channel.send("Error occurred during removing the prefix");
            console.log(e);
        }

    },
};
