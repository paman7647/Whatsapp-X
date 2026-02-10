const config = require('../../config/config');

module.exports = {
    name: 'pmpermit',
    description: 'Toggle PM Protection (ON/OFF)',
    usage: '<on|off>',
    category: 'owner',
    ownerOnly: true,
    async execute(message, args, client) {
        if (!args[0]) {
            return message.reply(` **PM Protection Status:** ${config.enablePMProtection ? 'Active ()' : 'Inactive ()'}\n\nYou can use \`/pmpermit on\` to guard your DMs!`);
        }

        const action = args[0].toLowerCase();
        if (action === 'on') {
            config.enablePMProtection = true;
            return message.reply("I've enabled PM Protection for you. Only permitted users can message! ");
        } else if (action === 'off') {
            config.enablePMProtection = false;
            return message.reply('I have disabled PM Protection. Your DMs are now open to everyone. ');
        } else {
            return message.reply("Oops! Please use `on` or `off` to control the guard. ");
        }
    }
};
