
const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
	name: 'team',
	botPermissions: [FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.MANAGE_ROLES],
	args: true,
	description: 'A command to get some fancy colors',
	guildOnly: true,
	execute(message, args, commandName) {
		let teamArgument = args[0].toLowerCase();
		teamArgument = teamArgument.substring(0, 1).toUpperCase() + teamArgument.substring(1);

		const { member } = message;

		if (teamArgument === 'Exit') {
			removeUserTeamRole(member, message);
			return;
		}

		const serverRoleList = member.guild.roles.cache;
		const userRoleList = member.roles.cache;
		const roleName = 'Team ' + teamArgument;

		if (userRoleList.find(role => role.name === roleName)) {
			message.reply("You're already in this team");
			return;
		}

		const role = serverRoleList.find(role => role.name === roleName);

		if (!role) {
			return message.reply("Available teams are: Green, Yellow, Blue, Purple");
		}

		const userTeam = getUserTeamRole(userRoleList);

		if (userTeam) {
			changeUserTeamRole(member, userTeam, role);
			message.reply("You joined to the team:  " + role.name);
		}
		else {
			message.reply("You weren't in the team, role added: " + role.name);
			member.roles.add(role);
		}
	}

}

function getUserTeamRole(userRoleList) {
	const list = ['Team Green', 'Team Yellow', 'Team Blue', 'Team Purple'];

	for (const element of list) {
		const teamRole = userRoleList.find(role => role.name === element);
		if (teamRole) {
			return teamRole;
		}
	}
	return null;
}

function changeUserTeamRole(member, oldTeam, newTeam) {
	member.roles.remove(oldTeam);
	member.roles.add(newTeam);
}


function removeUserTeamRole(member, message) {
	const team = getUserTeamRole(member.roles.cache);
	if (team) {
		member.roles.remove(team);
		message.reply(`You succesfully exited ${team.name}`);
	}
	else {
		message.reply("You're not in a team");
	}
}
