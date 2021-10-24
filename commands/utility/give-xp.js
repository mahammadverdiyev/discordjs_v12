const Levels = require('discord-xp');
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;


module.exports = {
    name: 'givexp',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    description: 'Gives random value xp to mentioned user(s) if value not specified',
    permissions: "ADMINISTRATOR",
    usage: "<user(s)> [value|max=500]",
    args: true,
    guildOnly: true,
    async execute(message, args, commandName) {

        console.log("GIRDI");
        const mentionedUsers = message.mentions.users;

        if (!mentionedUsers.size) {
            message.reply(`You must mention user(s) to give xp`);
            return;
        }


        let xpValue;
        const randomXP = Math.floor(Math.random() * 29) + 1;

        let resultText;

        let resultMessage;

        if (mentionedUsers.size == args.length) {
            xpValue = randomXP;
            resultText = "You didn't specify value, so I generated random xp value between 1 and 30"
            resultMessage = await message.channel.send(`Generating random value...`);
        }


        else {
            xpValue = findValue(args);
            if (!xpValue) {
                resultText = "You specified wrong value format, so I generated random xp value between 1 and 30";
                resultMessage = await message.channel.send(`Generating random value...`);
                xpValue = randomXP;
            }
            else {
                if (xpValue > 500) {
                    message.reply(`You can not give more than 500 xp`);
                    return;
                }
            }
        }



        console.log(xpValue);

        mentionedUsers.forEach(async user => {
            const hasLeveledUp = await Levels.appendXp(user.id, message.guild.id, xpValue);
            if (hasLeveledUp) {
                const xpSystemUser = await Levels.fetch(user.id, message.guild.id);
                message.channel.send(`${user}, you have proceeded to level ${xpSystemUser.level}. Congrats! :partying_face:`);
            }
        });

        let infoText;
        if (mentionedUsers.size > 1) {
            infoText = `Done! each of the mentioned users got ${xpValue} XP`;
        } else {
            infoText = `Done! mentioned user got ${xpValue} XP`;
        }
        resultText = !resultText ? infoText : `${infoText}\nPs: ${resultText}`;

        if (resultMessage) {
            resultMessage.edit(resultText);
        }
        else {
            message.channel.send(resultText);
        }

    }
}

function findValue(args) {
    for (let arg of args) {
        if (!isNaN(arg.trim())) {
            return parseInt(arg.trim());
        }
    }
    return null;
}