const ADMIN_ID = '701501101190414357';

const{ MessageEmbed } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
    if (!message.guild) return;
    let isPartial = (message) => {
            return message.partial;
    }
    if(isPartial(message)) return;
    if(message.author.id === ADMIN_ID) return;
        

	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 'MESSAGE_DELETE',
	});
	// Since there's only 1 audit log entry in this collection, grab the first one
	const deletionLog = fetchedLogs.entries.first();

	// Perform a coherence check to make sure that there's *something*
	if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`);

	// Now grab the user object of the person who deleted the message
	// Also grab the target of this action to double-check things
	const { executor, target } = deletionLog;

	// Update the output with a bit more information
	// Also run a check to make sure that the log returned was for the same author's message
	
    let deletedBy;
    if (target.id === message.author.id) {
        deletedBy = executor.tag;
		// console.log(`A message by ${message.author.tag} was deleted by ${executor.tag}.`);
	} else {
        deletedBy = message.author;
		// console.log(`A message by ${message.author.tag} was deleted, but we don't know by who.`);
	}




            const embed = new MessageEmbed()
            .setTitle("Deleted Message")
            .addField("Deleted by", deletedBy)
            .addField("In",message.channel)
            .addField("Author",message.author)
            .addField('Content',message.content)
            .setColor("RANDOM");


            const admin = message.guild.members.cache.get(ADMIN_ID);

            if(admin) admin.send(embed);
    }
}

