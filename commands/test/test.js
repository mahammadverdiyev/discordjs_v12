module.exports = {
    name: 'test',
    permissions: 'ADMINISTRATOR',
    async execute(message, args, commandName) {
        const { client, guild } = message;


        // console.log(client.defaultPrefixes.get(guild.id));
        console.log(client.ignoredChannels.get(guild.id));

        const guildSettings = client.settings.get(guild.id);
        const guildFeatures = client.features.get(guild.id);

        // console.log(client.settings.get('816271846185500683'));

        // console.log(client.features.get('816271846185500683'));


        //        console.log(client.settings.get(message.guild.id));
    }
}
