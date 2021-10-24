module.exports = {
    update: async function execute(member) {
        const CHANNEL_ID = '880702387751383061';
        const guild = member.guild;
        const channel = guild.channels.cache.get(CHANNEL_ID);
        console.log(guild.memberCount);
        console.log(channel.name);
        channel.setName(`Members: ${guild.memberCount.toLocaleString()}`);
        console.log(channel.name);
    }
}