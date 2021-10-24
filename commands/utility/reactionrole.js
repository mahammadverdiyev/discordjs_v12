
const ReactionRole = require('../../database/models/reaction-roles');

const { Client, Message, MessageEmbed, Util, MessageManager } = require('discord.js');

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'reactionrole',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_CHANNELS, FLAGS.ADD_REACTIONS, FLAGS.MANAGE_ROLES],
    permissions: 'ADMINISTRATOR',
    async execute(message, args) {
        const defaultDescription = "React to give yourself a role";

        // const guideMessage = `Parameters defined in '{}' are necessary and '()' are optional\n` +
        //     `In order to add reaction role you must follow this syntax like so:\n` +
        //     `\`{ TITLE }\n{ DESCRIPTION or type 'default' }\n{ TARGET CHANNEL }\n{ EMOJI } { ROLE }  ( NAME )\n...\`` +
        //     `\ntype 'cancel' to cancel`;


        const guideMessage = `Parameters defined in '{}' are necessary and '()' are optional\n` +
            `In order to add reaction role you must follow this syntax like so:\n` +
            "```{ TITLE }\n{ DESCRIPTION or type 'default' }\n{ TARGET CHANNEL }\n{ EMOJI } { ROLE }  ( NAME )\n...```" +
            `\ntype 'cancel' to cancel`;

        // const guideMessage = "``` TEST ```";


        // const guideMessageEmbed = new MessageEmbed().setDescription(guideMessage);
        // message.channel.send(guideMessageEmbed);
        message.channel.send(guideMessage);



        const filter = response => {
            return message.author.id === response.author.id;
        }

        await message.channel.awaitMessages(filter, { max: 1, time: 180 * 1000, errors: ['time'] })
            .then(async collected => {
                const msg = collected.first();
                const { content } = msg;

                if (content.toLowerCase().trim() === 'cancel') {
                    message.channel.send("Process is finished.");
                    return;
                }

                const lines = content.split('\n');


                if (lines.length < 4) {
                    msg.channel.send("You didn't provide full arguments.");
                    return;
                }

                const title = lines.shift();
                let description = lines.shift();

                if (description.trim().toLowerCase() === 'default') {
                    description = defaultDescription;
                }

                const reactionRolesData = {};



                const targetChannel = msg.mentions.channels.first();
                lines.shift();

                if (!(msg.mentions.roles.size == lines.length)) {
                    message.channel.send(`You didn't provde enough arguments`);
                    return;
                }

                if (message.guild.partial)
                    message.guild.fetch();
                if (message.guild.roles.partial)
                    message.guild.roles.fetch();


                lines.forEach(line => {
                    const splitted = line.split(/ +/);

                    if (splitted.length < 2) {
                        message.channel.send(`You must provide at least 2 arguments in line ${line}`);
                        return;
                    }


                    const emoji = splitted.shift().trim();
                    const parsedEmoji = Util.parseEmoji(emoji);


                    const roleLine = splitted.shift();
                    const roleId = roleLine.substring(3, roleLine.length - 1);

                    const role = message.guild.roles.cache.get(roleId);


                    let roleDisplayName = null;

                    if (splitted.length) {
                        roleDisplayName = splitted.join(' ').trim();
                        if (roleDisplayName.trim().length == 0)
                            roleDisplayName = null;
                    }

                    reactionRolesData[parsedEmoji.name] = {
                        "role": role,
                        "roleId": role.id,
                        "emoji": emoji,
                        "name": roleDisplayName,
                    }
                });

                const emojis = [];

                Object.keys(reactionRolesData).forEach(key => {
                    emojis.push(reactionRolesData[key].emoji);
                });

                const embedMessageContent = Object.keys(reactionRolesData).map((key, index) => {
                    return `${reactionRolesData[key].emoji} - ${reactionRolesData[key].name ?? reactionRolesData[key].role}`;
                }).join('\n\n');


                const messageEmbed = new MessageEmbed().setTitle(title).setDescription(`${description}.\n\n${embedMessageContent}`).setColor("RANDOM");
                let allowToSend = null;

                const testMessage = await msg.channel.send(messageEmbed);

                emojis.forEach(emoji => {
                    testMessage.react(emoji);
                })

                msg.channel.send("Message will look like this. Want to complete process? (yes/no)");

                await message.channel.awaitMessages(filter, { max: 1, time: 60 * 1000, errors: ['time'] })
                    .then(async collected => {

                        const repliedMsg = collected.first();

                        if (repliedMsg.content.toLowerCase() === "yes") {
                            allowToSend = true;
                            return;
                        } else if (repliedMsg.content.toLowerCase() === "no") {
                            allowToSend = false;
                            repliedMsg.channel.send("Operation cancelled.");
                            return;
                        }
                    }).catch(e => console.log(e));


                if (!allowToSend) {
                    return;
                }


                Object.keys(reactionRolesData).forEach(key => {
                    delete reactionRolesData[key]['role'];
                });


                const completedMessage = await targetChannel.send(messageEmbed)


                ReactionRole.findOne({ guildId: message.guild.id }, async (err, data) => {
                    if (data) {
                        data.reactionRoles[completedMessage.id] = reactionRolesData;

                        await ReactionRole.findOneAndUpdate({ guildId: message.guild.id }, data);
                    } else {
                        new ReactionRole({
                            guildId: message.guild.id,
                            messageId: completedMessage.id,
                            reactionRoles: {
                                [completedMessage.id]: reactionRolesData,
                            }
                        }).save();

                    }

                    emojis.forEach(emoji => {
                        completedMessage.react(emoji);
                    });
                    message.channel.send(`Operation successfully completed, you can check message in the ${targetChannel} if you wish`);
                });

            }).catch(e => console.log(e));

    }
}

