module.exports = {
    name: "pause",
    aliases: ["pause", "hold"],
    inVoiceChannel: true,
    async execute(message, args, commandName) {
        const { client } = message;
        try {
            const queue = client.distube.getQueue(message);
            if (!queue) return message.channel.send(`${client.emotes.error} | There is nothing in the queue right now!`)
            // if (queue.pause) {
            //     queue.resume()
            //     return message.channel.send("Resumed the song for you :)")
            // }
            queue.pause()
            message.channel.send("Paused the song for you :)")
        }catch(e){
                // console.log(e);
        }
    }
}