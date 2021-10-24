const { MessageEmbed } = require('discord.js');
const usersMap = new Map();
const LIMIT = 5;
const TIME = 60000;
const DIFF = 3000;
const discord = require('discord.js');
const spamSchema = require('../database/models/spam-schema');
const SPAM_LIMIT = 3;
const Settings = require('../database/models/settings-schema');


module.exports = {
    name: 'message',
    args: true,
    async execute(message) {
        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        if (message.member.permissions.has('ADMINISTRATOR')) return;

        const { client, guild } = message;
        const guildId = guild.id;
        const guildFeatures = client.features.get(guildId);
        const guildSettings = client.settings.get(guildId);
        if (!guildFeatures) return;
        const spamDetectionSetting = guildFeatures['spamDetection'];

        if (!spamDetectionSetting) return;
        if (!spamDetectionSetting.active) return;


        if (usersMap.has(message.author.id)) {
            const userData = usersMap.get(message.author.id);
            const { lastMessage, timer } = userData;
            const difference = message.createdTimestamp - lastMessage.createdTimestamp;
            let msgCount = userData.msgCount;
            if (difference > DIFF) {
                clearTimeout(timer);
                userData.msgCount = 1;
                userData.lastMessage = message;
                userData.timer = setTimeout(() => {
                    usersMap.delete(message.author.id);
                }, TIME);
                usersMap.set(message.author.id, userData);
            } else {
                ++msgCount;
                if (parseInt(msgCount) === LIMIT) {
                    const muteRoleSetting = guildSettings['muteRole'];

                    if (!muteRoleSetting) {
                        console.log("ERROR. Mute Role could have been created.");
                        return;
                    }

                    let muteRole;

                    const createRoleAndSave = async () => {
                        let maxPos = message.guild.roles.cache.size;

                        message.guild.roles.cache.forEach(role => {
                            if (role.permissions.has('ADMINISTRATOR')) {
                                if (parseInt(role.position) < maxPos) {
                                    maxPos = parseInt(role.position);
                                }
                            }
                        })
                        const muteRoleName = muteRoleSetting.name;
                        const muteRoleAuthorId = muteRoleSetting.authorId;
                        const date = muteRoleSetting.date;

                        try {
                            muteRole = await message.guild.roles.create({
                                data: {
                                    name: muteRoleName,
                                    position: maxPos,
                                    permissions: discord.Permissions.DEFAULT,
                                }
                            });
                            message.guild.channels.cache.forEach(async (channel) => {
                                await channel.createOverwrite(muteRole, {
                                    SEND_MESSAGES: false,
                                    ADD_REACTIONS: false
                                });
                            });
                        } catch (e) {
                            console.log(e);
                        }

                        guildSettings['muteRole'] = {
                            name: muteRoleName,
                            date: date,
                            roleId: muteRole.id,
                            authorId: muteRoleAuthorId,
                        };

                        await Settings.findOneAndUpdate({ guildId }, {
                            settings: guildSettings
                        })
                    }

                    let muteRoleId = muteRoleSetting.roleId;

                    muteRole = message.guild.roles.cache.get(muteRoleId);

                    if (!muteRole) {
                        await createRoleAndSave();
                    }

                    message.member.roles.add(muteRole);
                    const deservePunish = await isSuitableForPunish(message);
                    if (!deservePunish) {
                        message.reply("You have been muted, If you continue, you will be blacklisted.");
                        setTimeout(() => {
                            message.member.roles.remove(muteRole);
                            message.reply("You have been unmuted!");
                        }, TIME);
                    }
                } else {
                    userData.msgCount = msgCount;
                    usersMap.set(message.author.id, userData);
                }
            }
        }
        else {
            let fn = setTimeout(() => {
                usersMap.delete(message.author.id);
            }, TIME);
            usersMap.set(message.author.id, {
                msgCount: 1,
                lastMessage: message,
                timer: fn
            });
        }
    }
}


async function isSuitableForPunish(message) {
    const guildId = message.guild.id;
    const userId = message.author.id;

    let answer = false;

    await spamSchema.findOne({ guildId: guildId }, async (err, data) => {
        if (!data) {
            const newSpamObject = await new spamSchema({
                guildId,
                spammers: {
                    [userId]: {
                        spamCount: 1
                    }
                }
            });
            await newSpamObject.save().catch(err => console.log(err));
            answer = false;
            return;
        }


        const spammers = data.spammers;
        const spammer = spammers[userId];
        if (!spammer) {
            spammers[userId] = { spamCount: 1 };
            await spamSchema.findOneAndUpdate({ guildId: guildId }, data);
            return false;
        }

        const spamCount = spammer.spamCount;

        if (spamCount == SPAM_LIMIT) {
            message.reply("You have been blacklisted because of spamming!");
            handlePunishment(message);
            answer = true;
            return;
        }
        answer = false;
        spammer.spamCount = (spamCount + 1);
        await spamSchema.findOneAndUpdate({ guildId: guildId }, data);
    });


    return answer;
}

async function handlePunishment(message) {
    const { client, guild } = message;
    const guildId = guild.id;

    const guildFeatures = client.features.get(guildId);
    const spamDetectionSetting = guildFeatures['spamDetection'];

    const action = spamDetectionSetting.action;

    if (action === 'ban') {
        handleKickOrBan(message, 'ban');
    } else if (action === 'kick') {
        handleKickOrBan(message, 'kick');
    } else if (action === 'jail') {
        handleJailCondition(message);
    }
}


async function handleKickOrBan(message, kickOrBan) {
    const { member } = message;
    const reason = "Spamming the server";
    if (kickOrBan === 'ban') {
        member.ban(reason).catch(error => {
            console.log(error);
        });
    } else {
        member.kick(reason).catch(error => {
            console.log(error);
        });
    }
}

async function handleJailCondition(message) {
    const { client, guild } = message;
    const guildId = guild.id;

    const guildSettings = client.settings.get(guildId);

    const jailRoleSetting = guildSettings['jailRole'];

    const jailRoleId = jailRoleSetting.roleId;

    let jailRole = message.guild.roles.cache.get(jailRoleId);

    if (!jailRole) {
        const jailRoleName = jailRoleSetting.name;
        const jailRoleAuthorId = jailRoleSetting.authorId;
        const date = jailRoleSetting.date;

        try {
            jailRole = await message.guild.roles.create({
                data: {
                    name: jailRoleName,
                    permissions: [],
                }
            });
            message.guild.channels.cache.forEach(async (channel) => {
                await channel.createOverwrite(jailRole, {
                    VIEW_CHANNEL: false,
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            });
        } catch (e) {
            console.log(e);
        }

        guildSettings['jailRole'] = {
            name: jailRoleName,
            date: date,
            roleId: jailRole.id,
            authorId: jailRoleAuthorId,
        };

        await Settings.findOneAndUpdate({ guildId }, {
            settings: guildSettings
        })
    }

    let jailChannel = message.guild.channels.cache.find(channel => channel.name === 'jail');

    if (!jailChannel) {
        jailChannel = await message.guild.channels.create(`jail`, {
            type: 'text',
            topic: 'A channel for Prisoners',
        });
        const everyone = message.guild.roles.cache.find(role => role.name === "@everyone");
        await jailChannel.createOverwrite(everyone, {
            VIEW_CHANNEL: false,
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
        });

        jailChannel.createOverwrite(jailRole, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
        })
    }

    const { member } = message;
    await member.roles.remove(member.roles.cache);
    await member.roles.add(jailRole);

    // I already made it in a short way

    // message.guild.roles.cache.forEach(role => {
    //     if (!role.permissions.has('ADMINISTRATOR') && !(role.name === 'Jail')) {
    //         await jailChannel.createOverwrite(role, {
    //             VIEW_CHANNEL: false,
    //             SEND_MESSAGES: false,
    //             ADD_REACTIONS: false
    //         });
    //     }
    // });

}