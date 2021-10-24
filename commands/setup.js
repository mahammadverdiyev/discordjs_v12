const Settings = require('../database/models/settings-schema');
const { MessageEmbed } = require('discord.js');
const discord = require('discord.js');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'setup',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.BAN_MEMBERS, FLAGS.KICK_MEMBERS, FLAGS.MANAGE_CHANNELS, FLAGS.MANAGE_ROLES, FLAGS.MANAGE_MESSAGES],
    description: "Use it to add/change settings for current server(not completed)",
    permissions: 'ADMINISTRATOR',
    usage: '[option]',
    async execute(message, args, commandName) {
        try {
            await handleSetup(message, args);
        } catch (e) {
            console.log("ERROR OCCURRED DURING ADDING SETUP");
            console.log(e);
        }
    }
}


const handleSetup = async (message, args) => {
    const filter = response => {
        return message.author.id === response.author.id;
    }
    const { client, guild } = message;
    const guildId = guild.id;

    if (!args.length) {

        let guildSettings = client.settings.get(message.guild.id);
        let features = client.features.get(message.guild.id);

        let guildGlobalSettings = await Settings.findOne({ guildId });

        if (!guildGlobalSettings) {
            const settings = await new Settings({
                guildId
            });
            await settings.save().catch(e => console.log(e));
            client.settings.set(guildId, settings.settings);
            client.features.set(guildId, settings.features);
            guildSettings = client.settings.get(guildId);
            features = client.features.get(guildId);
        }

        let statuses = {};

        const handleSettingStatus = (settingName) => {
            let givenSetting = guildSettings[settingName];
            if (givenSetting && givenSetting.active)
                statuses[settingName] = "✅";
            else
                statuses[settingName] = "";
        }

        const handleFeatureStatus = (featureName) => {
            let givenFeature = features[featureName];
            if (givenFeature && givenFeature.active)
                statuses[featureName] = ":green_circle: (ON)";
            else
                statuses[featureName] = ":red_circle: (OFF)";
        }

        Object.keys(guildSettings).forEach(settingName => {
            handleSettingStatus(settingName);
        });

        Object.keys(features).forEach(featureName => {
            handleFeatureStatus(featureName);
        });

        const configEmbed = new MessageEmbed()
            .setColor("BLUE")
            .setTitle(`${message.guild.name}'s Server Configuration`)
            .addField('Usage', "[]setup <setupName>\n[]disable <setupName>")
            .addField('Info', "All setup names are case sensitive")
            .addField('\u200B', '__General__')
            .addField(`👋 Welcome Channel ${statuses.welcome || ""}`, 'setup name: \`welcome\`')
            .addField('🚶 Goodbye Channel', 'COMING SOON')
            .addField(`✍️ Autorole ${statuses.autoRole || ""}`, 'setup name: \`autoRole\`')
            .addField(`🔔 Bump Reminder ${statuses.bumpReminder || ""}`, 'setup name: \`bumpReminder\`')
            .addField(`🤖 ChatBot ${statuses.chatBot || ""}`, 'setup name: \`chatBot\`')
            .addField(`❕ Default prefix ${client.defaultPrefixes.get(guildId) || ""}`, 'setup name: \`defaultPrefix\`')
            .addField(`Member counter ${statuses.memberCounter || ""}`, `setup name: \`memberCounter\``)
            .addField('\u200B', '__Moderations__')
            .addField('📃 Logs Channel', 'COMING SOON')
            .addField(`👤 Member Role ${statuses.memberRole || ""}`, `setup name: \`memberRole\``)
            .addField(`:zipper_mouth: Mute Role ${statuses.muteRole || ""}`, 'setup name: \`muteRole\`')
            .addField(`😧 Jail Role ${statuses.jailRole || ""}`, 'setup name: \`jailRole\`')
            .addField('\u200B', '__Features__')
            .addField(`👊 Anti Spam \t\t\t\t\t\t\t ${statuses['spamDetection'] || ":red_circle: (OFF)"}`, `setup name: \`spamDetection\``)
            .addField(`🤬 Anti Swear \t\t\t\t\t\t\t${statuses['swearDetection'] || ":red_circle: (OFF)"}`, `setup name: \`swearDetection\``)
            .addField(`📰 Anti Advertisement \t\t   ${statuses['antiAd'] || ":red_circle: (OFF)"}`, `setup name: \`antiAd\``)
        message.channel.send(configEmbed);

    } else {
        const setupName = args[0];
        const setupFunction = ALL_SETUP[setupName];

        if (!setupFunction) {
            message.channel.send(`There is no ${setupName} setup!`);
            return;
        }
        else {
            await setupFunction(message, filter, args);
        }
    }

}

const setupMuteRole = async (message, filter, args) => {
    const guideMessage = "We will create new Mute role, what would you like to call it?";
    const setupName = "muteRole";
    const setupType = "settings";

    const validate = async (repliedMsg) => {

        const roleName = repliedMsg.content;

        if (!roleName.length) {
            repliedMsg.channel.send("Operation cancelled, you didn't specify a role name.");
            return false;
        }

        const { client, guild } = repliedMsg;
        const guildId = guild.id;


        let maxPos = guild.roles.cache.size;

        guild.roles.cache.forEach(role => {
            if (role.permissions.has('ADMINISTRATOR')) {
                if (parseInt(role.position) < maxPos) {
                    maxPos = parseInt(role.position);
                }
            }
        })

        const muteRole = await guild.roles.create({
            data: {
                name: roleName,
                position: maxPos,
                permissions: discord.Permissions.DEFAULT,
            }
        });

        repliedMsg.channel.send(`The ${roleName} mute Role has been created, please never change  permissions and position of this role!`)

        guild.channels.cache.forEach(async (channel) => {
            await channel.createOverwrite(muteRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            });
        });

        const jsonObject = {
            date: Date.now(),
            roleId: muteRole.id,
            name: roleName,
            authorId: message.author.id,
            active: true,
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}

const setupMemberRole = async (message, filter, args) => {
    const guideMessage = "Enter role name or mention role that you want to specify as a member role.";
    const setupName = "memberRole";
    const setupType = "settings";
    const { guild } = message;

    const validate = async (msg) => {
        let role = msg.mentions.roles.first();

        let roleName;

        if (!role) {
            roleName = msg.content.trim();
            role = guild.roles.cache.find(role => role.name === roleName);
            if (!role) {
                msg.channel.send(`Couldn't find a role with name ${roleName}`);
                return false;
            }
        }

        const jsonObject = {
            date: Date.now(),
            roleId: role.id,
            authorId: message.author.id,
            active: true
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}

const setupMemberCounter = async (message, filter, args) => {
    const guideMessage = "What type of channel would you like to use as a member counter?\nYou have 60 seconds, respond with 'text' or 'voice'";
    const setupName = "memberCounter";
    const setupType = "settings";
    const { client, guild } = message;

    const validate = async (msg) => {
        let targetChannel;

        const everyone = message.guild.roles.cache.find(role => role.name === "@everyone");

        if (msg.content.trim() === 'text') {
            targetChannel = await guild.channels.create(`Members: ${guild.memberCount.toLocaleString()}`, {
                type: 'text',
            });

            await targetChannel.createOverwrite(everyone, {
                SEND_MESSAGES: false,
            });
        } else if (msg.content.trim() === 'voice') {
            targetChannel = await guild.channels.create(`Members: ${guild.memberCount.toLocaleString()}`, {
                type: 'voice',
            });

            await targetChannel.createOverwrite(everyone, {
                CONNECT: false,
            });

        } else {
            msg.channel.send("Process is stopped due to wrong respond!");
            return false;
        }

        const jsonObject = {
            date: Date.now(),
            channelId: targetChannel.id,
            authorId: message.author.id,
            active: true
        };

        let interval = setInterval(() => {
            console.log("INTERVAL WORKED");
            targetChannel.setName(`Members: ${guild.memberCount.toLocaleString()}`);
        }, 600000);

        client.memberCounterIntervals.set(guild.id, interval);

        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}
const setupJailRole = async (message, filter, args) => {
    const guideMessage = "We will create new Jail role, what would you like to call it?";
    const setupName = "jailRole";
    const setupType = "settings";

    const validate = async (repliedMsg) => {
        const roleName = repliedMsg.content;

        if (!roleName.length) {
            repliedMsg.channel.send("Operation cancelled, you didn't specify a role name.");
            return false;
        }

        const { client, guild } = repliedMsg;
        const guildId = guild.id;

        const jailRole = await guild.roles.create({
            data: {
                name: roleName,
                permissions: discord.Permissions.DEFAULT,
            }
        });

        repliedMsg.channel.send(`The ${roleName} jail Role has been created, please never change  permissions and position of this role!`)

        message.guild.channels.cache.forEach(async (channel) => {
            await channel.createOverwrite(jailRole, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            });
        });

        const jsonObject = {
            date: Date.now(),
            roleId: jailRole.id,
            name: roleName,
            authorId: message.author.id,
            active: true
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}
const setupSwearDetection = async (message, filter, args) => {
    const { client, guild } = message;
    const guildId = guild.id;

    const setupType = 'features';
    const setupName = 'swearDetection';

    let guideMessage = `Would you like it to be sent to the logs channel? (needs logs channel configuration)\nRespond with 'yes' or 'no'`;


    const validate = async (repliedMsg) => {
        const msg = repliedMsg;

        const content = msg.content.trim();
        if (content === 'yes') {
            const guildFeatures = client.features.get(guildId);

            const cancelOperation = async () => {
                msg.channel.send("Operation is cancelled, configure logs channel first!");
                return false;
            }

            if (!guildFeatures || !Object.values(guildFeatures).length) {
                return cancelOperation();
            }

            const logsChannelSetting = guildFeatures['logsChannel'];

            if (!logsChannelSetting) {
                return cancelOperation();
            }

            const jsonObject = {
                date: Date.now(),
                logMessage: true,
                authorId: message.author.id,
                active: true,
            };

            return jsonObject;

        } else if (content === 'no') {
            const jsonObject = {
                date: Date.now(),
                logMessage: false,
                authorId: message.author.id,
                active: true,
            };

            return jsonObject;
        } else {
            msg.channel.send("Operation is cancelled due to wrong respond.")
            return false;
        }
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}
const setupSpamDetection = async (message, filter, args) => {
    const { client, guild } = message;
    const guildId = guild.id;
    const guildSettings = client.settings.get(guildId);

    if (!guildSettings) {
        message.channel.send("Configure mute role before this feature.");
        return;
    }

    const muteRoleSetting = guildSettings['muteRole'];

    if (!muteRoleSetting) {
        message.channel.send("Configure mute role before this feature.");
        return;
    }

    const setupName = "spamDetection";
    const setupType = "features";

    let guideMessage = `Spammers will be muted for three times, after that they will be:
1. Banned
2. Kicked
3. Jailed (Needs Jail role configuration)
You have 60 seconds, choose line number of one of the options`;

    const validate = async (repliedMsg) => {
        const msg = repliedMsg;
        let option;

        // if (toggle) {
        if (msg.content === '1') {
            option = "ban";
        } else if (msg.content === '2') {
            option = "kick";
        } else if (msg.content === '3') {
            if (!guildSettings['jailRole']) {
                message.channel.send("You have not configured Jail Role setup yet");
                return false;
            }
            option = 'jail';
        } else {
            message.channel.send('Wrong selection ❌');
            return false;
        }
        const jsonObject = {
            date: Date.now(),
            action: option,
            authorId: message.author.id,
            active: true,
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);

}

const setupWelcome = async (message, filter, args) => {
    const guideMessage = "Specify a channel to welcome new users.";
    const setupName = "welcome";
    const setupType = "settings";

    const validate = async (repliedMsg) => {
        const targetChannel = repliedMsg.mentions.channels.first();

        if (!targetChannel) {
            repliedMsg.channel.send("You didn't specify a channel.");
            return false;
        }

        const jsonObject = {
            date: Date.now(),
            authorId: message.author.id,
            active: true,
            channelId: targetChannel.id,
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}



const setupBumpReminder = async (message, filter, args) => {
    const guideMessage = "You need to specify a channel where Bump Reminder works, and a role to notify.";
    const setupName = "bumpReminder";
    const setupType = "settings";

    const validate = async (repliedMsg) => {
        const targetChannel = repliedMsg.mentions.channels.first();
        const targetRole = repliedMsg.mentions.roles.first();

        if (!targetChannel) {
            repliedMsg.channel.send("You didn't specify a channel.");
            return false;
        }
        if (!targetRole) {
            repliedMsg.channel.send("You didn't specify a role");
            return false;
        }

        const jsonObject = {
            date: Date.now(),
            authorId: message.author.id,
            roleId: targetRole.id,
            active: true,
            channelId: targetChannel.id,
            lastBumped: null
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}

const setupAntiAd = async (message, filter, args) => {
    const guideMessage = "Anti Advertisement feature is enabled, if you want to add any channel(s) to the exceptions, mention that/those channels now\nOr just say 'skip'";
    const setupName = "antiAd";
    const setupType = "features";

    const validate = async (msg) => {
        const exceptionChannels = msg.mentions.channels;

        const exceptionChannelsId = [];

        if (exceptionChannels && exceptionChannels.size > 0) {
            exceptionChannels.forEach(excChannel => {
                exceptionChannelsId.push(excChannel.id);
            })
        }

        const jsonObject = {
            date: Date.now(),
            authorId: message.author.id,
            exceptions: exceptionChannelsId,
            active: true
        };

        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}

const setupChatBot = async (message, filter, args) => {
    const guideMessage = "Please specify channel where the Chat Bot will work.";
    const setupName = "chatBot";
    const setupType = "settings";
    const { client } = message;
    const validate = async (msg) => {
        const targetChannel = msg.mentions.channels.first();

        if (!targetChannel) {
            msg.channel.send("Operation is cancelled! you didn't specify channel.");
            return false;
        }

        await Settings.findOneAndUpdate({ guildId: message.guild.id }, {
            $push: {
                ignoredChannels: targetChannel.id
            }
        }, {
            upsert: true
        })
        if (!client.ignoredChannels.get(message.guild.id)) {
            client.ignoredChannels.set(message.guild.id, [targetChannel.id]);
        } else {
            client.ignoredChannels.get(message.guild.id).push(targetChannel.id);
        }

        const jsonObject = {
            date: Date.now(),
            authorId: message.author.id,
            channelId: targetChannel.id,
            active: true
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}
const setupDefaultPrefix = async (message, filter, args) => {
    const guideMessage = "Now specify a prefix, and keep in mind that prefix size can not be larger than 2 characters.\nRespond within 60 seconds, type 'cancel' to cancel.";
    const setupName = 'defaultPrefix';
    const setupType = 'settings';

    const { client, guild } = message;
    const guildId = guild.id;
    const validate = async (repliedMsg) => {
        const msg = repliedMsg;

        if (msg.content.trim() === 'cancel') {
            msg.channel.send("Operation is cancelled!");
            return false;
        } else if (msg.content.trim().length > 2) {
            msg.channel.send("Operation is cancelled! As I said, prefix size can not be larger than two characters!");
            return false;
        } else if (!msg.content.trim().length) {
            msg.channel.send("Operation is cancelled due to wrong respond!");
            return false;
        }

        const prefix = msg.content.trim();

        try {
            Settings.findOne({}, async (err, data) => {
                if (!data) {
                    const newSettings = await new Settings({
                        guildId,
                        defaultPrefix: prefix
                    });
                    await newSettings.save().catch(e => console.log(e));
                } else {
                    data.defaultPrefix = prefix;
                    await Settings.findOneAndUpdate({ guildId }, data);
                }
            })
            client.defaultPrefixes.set(guildId, prefix);
            return false;
        } catch (e) {
            msg.channel.send("Error occured during saving prefix to the db");
        }
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}

const setupAutoRole = async (message, filter, args) => {
    const guideMessage = "Specify a role which will be assigned to the new user";
    const setupName = "autoRole";
    const setupType = 'settings';

    const validate = async (repliedMsg) => {
        const targetRole = repliedMsg.mentions.roles.first();

        if (!targetRole) {
            repliedMsg.channel.send("You didn't specify a role");
            return false;
        }
        const jsonObject = {
            date: Date.now(),
            authorId: message.author.id,
            roleId: targetRole.id,
            active: true,
        };
        return jsonObject;
    }
    await setupSetting(message, filter, guideMessage, validate, setupName, setupType);
}


const setupSetting = async (message, filter, guideMessage, validate, setupName, setupType) => {
    const guildId = message.guild.id;
    const { client } = message;

    if (guideMessage)
        message.channel.send(guideMessage);

    let result;
    await message.channel.awaitMessages(filter, { max: 1, time: 60 * 1000, errors: ['time'] })
        .then(async collected => {

            const repliedMsg = collected.first();
            const jsonObject = await validate(repliedMsg);

            if (!jsonObject) {
                result = false;
                return;
            };

            const updateClientData = (settings) => {
                if (setupType === 'settings')
                    client.settings.set(guildId, settings.settings);
                else
                    client.features.set(guildId, settings.features);
            }

            Settings.findOne({ guildId }, async (err, data) => {
                if (!data) {
                    const settings = await new Settings({
                        guildId,
                        [setupType]: {
                            [setupName]: jsonObject
                        }
                    });
                    await settings.save().catch(e => console.log(e));
                    updateClientData(settings);
                }
                else {
                    data[setupType][setupName] = jsonObject;
                    await Settings.findOneAndUpdate({ guildId }, data);
                    updateClientData(data);
                }

            });

            result = true;

        }).catch(e => {
            result = false;
            console.log(e);
        });

    return result;
}


const ALL_SETUP = {
    bumpReminder: setupBumpReminder,
    welcome: setupWelcome,
    autoRole: setupAutoRole,
    muteRole: setupMuteRole,
    jailRole: setupJailRole,
    spamDetection: setupSpamDetection,
    swearDetection: setupSwearDetection,
    defaultPrefix: setupDefaultPrefix,
    chatBot: setupChatBot,
    antiAd: setupAntiAd,
    memberRole: setupMemberRole,
    memberCounter: setupMemberCounter
};


