const memberCounter = require('../util/member-count-updater');
const Levels = require('discord-xp');

module.exports = {
    name: 'guildMemberRemove',
    execute(member) {
        try {
            Levels.deleteUser(member.id, member.guild.id);
        } catch (e) {
            console.log(e);
        }
    },
};