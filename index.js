const Levels = require('discord-xp');
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const DisTube = require("distube");
const mongoose = require('./database/mongoose');

require('dotenv').config();



const client = new Discord.Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
	ws: { intents: Discord.Intents.ALL }
});

client.config = require("./config.json");
client.distube = new DisTube(client, { searchSongs: true, emitNewSongOnly: true, leaveOnFinish: true })
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


const status = queue => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``
client.distube
	.on("playSong", (message, queue, song) => message.channel.send(
		`${client.emotes.play} | Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
	))
	.on("addSong", (message, queue, song) => message.channel.send(
		`${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
	))
	.on("playList", (message, queue, playlist, song) => message.channel.send(
		`${client.emotes.play} | Play \`${playlist.title}\` playlist (${playlist.total_items} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
	))
	.on("addList", (message, queue, playlist) => message.channel.send(
		`${client.emotes.success} | Added \`${playlist.title}\` playlist (${playlist.total_items} songs) to queue\n${status(queue)}`
	))
	// DisTubeOptions.searchSongs = true
	.on("searchResult", (message, result) => {
		let i = 0
		message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`)
	})
	// DisTubeOptions.searchSongs = true
	.on("searchCancel", message => message.channel.send(`${client.emotes.error} | Searching canceled`))
	.on("error", (message, err) => message.channel.send(`${client.emotes.error} | An error encountered: ${err}`))


client.login(process.env.TOKEN);