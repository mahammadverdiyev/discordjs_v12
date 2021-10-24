const timeToMilliseconds = {
    day: 86400000,
    hour: 3600000,
    minute: 60000,
    second: 1000,
}

const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'remindme',
    botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
    description: 'Reminds a user about something.[DEPRECATED]',
    usage: "[day=int] [hour=int] [minute=int] [second=int]",
    guildOnly: true,
    args: true,
    execute(message, args, commandName) {
        let totalTimeInMilliseconds = 0;

        for (let arg of args) {
            if (arg.includes('=')) {
                const splitted = arg.split('=');
                const type = splitted[0];
                const amount = splitted[1];

                if (timeToMilliseconds[type]) {
                    let amountInt = parseInt(amount);
                    if (!amountInt) {
                        message.reply(`Wrong syntax ${type}=${amount}, please specify integer.`);
                        return;
                    }
                    else {
                        totalTimeInMilliseconds += timeToMilliseconds[type] * amountInt;
                    }
                }
                else {
                    message.reply(`Wrong syntax ${type}=${amount}, please specify correct time type.`);
                    return;
                }
            }
        }

        if (totalTimeInMilliseconds > 7 * timeToMilliseconds.day) {
            message.reply('Total time can not be longer than 7 days, please specify valid timespan.');
            return;
        }

        const waitForRespond = 60 * timeToMilliseconds.second;

        const filter = response => {
            return message.author.id === response.author.id;
        }
        console.log(message.createdAt.getTimezoneOffset());

        message.channel.send(`Now, please specify message to remind. (I'll wait for 1 minute)`)
            .then(() => {
                message.channel.awaitMessages(filter, { max: 1, time: waitForRespond, errors: ['time'] })
                    .then(collected => {
                        const messageToRemind = collected.first();

                        if (messageToRemind.content === 'cancel') {
                            message.reply('Operation is cancelled.');
                            return;
                        }

                        message.reply(`I will remind you "${messageToRemind.content}"`);

                        setTimeout(() => {
                            message.channel.send(`${messageToRemind.author}, **REMİNDİNG!!**\nMessage: "${messageToRemind.content}"`)
                        }, totalTimeInMilliseconds);

                    }).catch(collected => {
                        message.channel.send(`Looks like you don't want me to remind you `);
                    });
            });
    }
}
