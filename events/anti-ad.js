const { Permissions } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
    name: 'message',
    async execute(message) {

        if (message.author.bot) return;
        if (message.channel.type === 'dm') return;
        if (message.member.permissions.has("ADMINISTRATOR")) return;

        const bot = message.guild.me;

        if (!bot.hasPermission(FLAGS.VIEW_CHANNEL) || !bot.hasPermission(FLAGS.SEND_MESSAGES)
            || !bot.hasPermission(FLAGS.MANAGE_CHANNELS) || !bot.hasPermission(FLAGS.CREATE_INSTANT_INVITE)) return;



        const { client, guild } = message;
        const guildId = guild.id;

        const features = client.features.get(guildId);

        if (!features || !features['antiAd']) return;

        const antiAdSetting = features['antiAd'];

        if (!antiAdSetting.active) return;

        if (antiAdSetting.exceptions && antiAdSetting.exceptions.includes(message.channel.id))
            return;


        const isOurInviteCode = async (guild, code) => {
            return await new Promise(resolve => {
                guild.fetchInvites().then(invites => {
                    for (const invite of invites) {
                        if (code === invite[0]) {
                            resolve(true);
                            return;
                        }
                    }
                    resolve(false);
                })
            })
        }

        const reason = 'Advertising';
        const { member, content } = message;
        const code = content.replace('discord.gg/', '').replace('https://', '');

        if (content.includes('discord.gg/')) {
            const isOurInvite = await isOurInviteCode(guild, code);
            if (!isOurInvite) {
                await message.delete({ reason: reason });
                message.reply('Please do not advertise discord servers in this channel.');
            }
        } else if (content.includes('store.steampowered.com')) {
            await message.delete({ reason: reason });
            message.reply('Please do not advertise steam in this channel.');
        }
    }
}