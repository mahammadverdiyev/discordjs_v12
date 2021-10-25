module.exports = {
    name: "resume",
    aliases: ["unpause"],
    inVoiceChannel: true,
    async execute(message, args, commandName) {
        const{client} = message;
        
        const queue = client.distube.getQueue(message)
        if (!queue) return message.channel.send(`${client.emotes.error} | There is nothing in the queue right now!`)
        queue.resume();
        message.channel.send("Resumed the song for you :)");
    }
}