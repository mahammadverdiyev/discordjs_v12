const Settings = require('../database/models/settings-schema');

module.exports = {
    name: 'message',
    async execute(message) {
        if (message.channel.type === 'dm') return;
        if (message.author.bot) return;

        const filter = response => {
            return true;
        }


        if (message.content.toLowerCase() === '!d bump') {
            const dateBumped = Date.now();
            const guildId = message.guild.id;
            const { client } = message;
            if (client.settings.has(guildId)) {
                console.log("HAS GUILD");
                if (!client.settings.get(guildId)['bumpReminder']) {
                    console.log("BUMP REMINDER DOES NOT EXIST");
                    return;
                }

                const bumpReminderSettings = client.settings.get(guildId)['bumpReminder'];

                const notifyChannelId = bumpReminderSettings['channelId'];

                // if (!(notifyChannelId === message.channel.id)) {
                //     console.log("ID IS NOT IDENTICAL");
                //     return;
                // }

                const notifyChannel = message.guild.channels.cache.get(notifyChannelId);

                if (!notifyChannel) {
                    console.log(`ERROR! GUILD ID = ${guildId}
                    Notify channel does not exist`);
                    return;
                }


                await message.channel.awaitMessages(filter, { max: 5, time: 3 * 1000 })
                    .then(async collected => {
                        let msg = collected.find(msg => msg.embeds[0] && msg.content === ""
                            && msg.author && msg.author.username === 'DISBOARD');

                        let embed;

                        if (msg)
                            embed = msg.embeds[0];

                        // console.log(embed);
                        if (!embed) return;

                        if (!embed.description) return;

                        if (embed.description.includes('Bump done')) {//7200000
                            const pingRoleId = bumpReminderSettings.roleId;

                            const pingRole = message.guild.roles.cache.get(pingRoleId);

                            if (!pingRole) {
                                console.log(`ERROR! GUILD ID = ${guildId}
                                            Ping role does not exist`);
                                return;
                            }

                            if (message.channel.id === notifyChannelId) {
                                message.channel.send('Thank you for bumping the server. Please check back two hours later to bump the server again.')
                            }
                            else {
                                notifyChannel.send(`The server has bumped by ${message.author} from another channel.`);
                                message.channel.send(`Thank you for bumping the server. You'll be notified in ${notifyChannel}  two hours later to bump the server again.`);
                            }

                            setTimeout(async () => await notifyChannel.send(`${pingRole} It's time to bump! 😃`), 7200000);
                            bumpReminderSettings['lastBumped'] = dateBumped;
                            // console.log(client.settings.get(guildId));

                            try {
                                await Settings.findOneAndUpdate({
                                    guildId
                                }, {
                                    settings: client.settings.get(guildId),
                                });
                            } catch (e) {
                                console.log(e);
                            }
                        } else {
                            console.log("BUMP DONE FAILURE");
                        }

                    }).catch(e => console.log(e));

            }
        }
    }
}