#  Adding New Commands

Adding a command to X-UserBot is incredibly simple. Just create a new `.js` file in any folder under `src/commands/`.

##  Command Template

```javascript
module.exports = {
    name: 'hello',               // The command word (e.g. /hello)
    aliases: ['hi', 'greet'],    // Other triggers
    description: 'Greet the user',
    usage: '',                   // How to use it (optional)
    category: 'General',         // For categorized help menu
    async execute(message, args, client) {
        // Your logic here
        await message.reply('Hello! How can I help you today? ');
    }
};
```

##  Properties
- `ownerOnly`: Restrict to the bot owner.
- `groupOnly`: Restrict to groups.
- `adminOnly`: Restrict to group admins.

##  Advanced Example: Complex Argument Handling

Here is how to handle multiple arguments for something like a poll or specialized search:

```javascript
module.exports = {
    name: 'poll',
    description: 'Create a simple choice poll',
    usage: 'Question | Option1 | Option2',
    category: 'Tools',
    async execute(message, args, client) {
        const fullText = args.join(' ');
        const parts = fullText.split('|').map(p => p.trim());

        if (parts.length < 3) {
            return await message.reply("Please use the format: Question | Op1 | Op2 ");
        }

        const question = parts[0];
        const options = parts.slice(1);

        let pollMsg = ` **${question}**\n\n`;
        options.forEach((opt, i) => {
            pollMsg += `${i + 1}. ${opt}\n`;
        });

        await message.reply(pollMsg);
    }
};
```
