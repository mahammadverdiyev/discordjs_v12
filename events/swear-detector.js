const badWords = require('../util/bad-words');

module.exports = {
    name: 'message',
    args: true,
    execute(message) {
        if (message.author.bot) return;
        const { client, guild, member } = message;

        if (member.permissions.has('ADMINISTRATOR')) return;

        const features = client.features.get(guild.id);

        if (!features) return;

        if (!Object.values(features).length) return;

        const swearDetection = features['swearDetection'];

        if (!swearDetection) return;

        let content = message.content.toLowerCase();
        let usedBadWords = [];
        let badWordExist = false;
        const targetChannel = message.channel;
        const author = message.author;

        // line.split(/ +/);

        let splittedSentence = content.split(/ +/);

        for (const word of badWords) {
            for (let sWord of splittedSentence) {
                if (sWord === word) {
                    badWordExist = true;
                    message.delete();
                    usedBadWords.push(word);
                }
            }
            // if (content.includes(word)) {
            //     badWordExist = true;
            //     message.delete();
            //     usedBadWords.push(word);
            // }
        }

        if (badWordExist) {
            let modifiedContent = content;
            for (const badWord of usedBadWords) {
                modifiedContent = modifiedContent.replace(badWord, "#".repeat(badWord.length));
            }

            targetChannel.send(`${author}, Don't use bad words!\nYour message: ${modifiedContent}`);
        }
    }
}

