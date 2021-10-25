module.exports = {
    name: "repeat",
    inVoiceChannel: true,
    args: true,
    usage: "off | song | queue",
    async execute(message, args, commandName) {
        const{client} = message;
        
        const queue = client.distube.getQueue(message)
        if (!queue) return message.channel.send(`${client.emotes.error} | There is nothing playing!`)
        
        let mode = "song";

        switch (args[0]) {
            case "off":
                mode = 0
                break
            case "song":
                mode = 1
                break
            case "queue":
                mode = 2
                break
        }
        mode = queue.setRepeatMode(mode)
        mode = mode ? mode === 2 ? "Repeat queue" : "Repeat song" : "Off"
        message.channel.send(`${client.emotes.repeat} | Set repeat mode to \`${mode}\``)
    }
}