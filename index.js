const Levels = require('discord-xp');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const {DisTube} = require("distube");
const mongoose = require('./database/mongoose');
const {SpotifyPlugin} = require("@distube/spotify");



require('dotenv').config();



const client = new Discord.Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
	ws: { intents: Discord.Intents.ALL }
});

client.config = require("./config.json");
// client.distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true, leaveOnFinish: true })



client.distube = new DisTube(client, {
    emitNewSongOnly: true,
    plugins: [new SpotifyPlugin()]
})

client.allPermissions = config.allPermissions;
client.commands = new Discord.Collection();
client.prefixes = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.settings = new Discord.Collection();
client.features = new Discord.Collection();
client.defaultPrefixes = new Discord.Collection();
client.ignoredChannels = new Discord.Collection();
client.memberCounterIntervals = new Discord.Collection();
client.emotes = config.emoji


Levels.setURL(`mongodb+srv://discordbot:${process.env.MONGOPAS}@discordbot.hrcdy.mongodb.net/StarGazersBot?retryWrites=true&w=majority`);
mongoose.init();

const readEvents = dir => {
	const files = fs.readdirSync(path.join(__dirname, dir));
	for (const file of files) {
		const stat = fs.lstatSync(path.join(__dirname, dir, file));
		if (stat.isDirectory()) {
			readEvents(path.join(dir, file));
		} else {
			const event = require(path.join(__dirname, dir, file));
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args, client));
			} else {
				client.on(event.name, (...args) => event.execute(...args, client));
			}
		}
	}
}


readEvents('events');



const readCommands = dir => {
	const files = fs.readdirSync(path.join(__dirname, dir));
	for (const file of files) {
		const stat = fs.lstatSync(path.join(__dirname, dir, file));
		if (stat.isDirectory()) {
			readCommands(path.join(dir, file));
		} else {
			const command = require(path.join(__dirname, dir, file));
			client.commands.set(command.name, command);
		}
	}
}

setTimeout(() => {
	readCommands('commands');
}, 2000);


const status = queue => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(", ") || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``
client.distube
    .on("playSong", (queue, song) => queue.textChannel.send(
        `${client.emotes.play} | Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
    ))
    .on("addSong", (queue, song) => queue.textChannel.send(
        `${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("addList", (queue, playlist) => queue.textChannel.send(
        `${client.emotes.success} | Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`)
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", message => message.channel.send(`${client.emotes.error} | Searching canceled`))
    .on("error", (channel, e) => {
        channel.send(`${client.emotes.error} | An error encountered: ${e}`)
        console.error(e)
    })
    .on("empty", channel => channel.send("Voice channel is empty! Leaving the channel..."))
    .on("searchNoResult", message => message.channel.send(`${client.emotes.error} | No result found!`))
    .on("finish", queue => queue.textChannel.send("Finished!"))

client.login(process.env.TOKEN);