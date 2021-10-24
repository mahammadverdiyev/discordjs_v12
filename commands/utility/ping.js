const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
	name: 'ping',
	botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES],
	cooldown: 5,
	description: 'Calculates Bot and API latency',
	guildOnly: true,
	execute(message) {
		message.reply('Calculating ping...').then(resultMessage => {
			const ping = resultMessage.createdTimestamp - message.createdTimestamp;
			const { client } = message;
			resultMessage.edit(`Bot latency: ${ping}, API Latency: ${client.ws.ping}`);
		});
	},
};