#  Event Handling

X-UserBot uses an event-driven architecture to react to WhatsApp updates.

##  Event Directory
Events are stored in `src/events/`. Every file exports an event definition.

##  Event Template

```javascript
module.exports = {
    name: 'message', // The wwebjs event name
    once: false,     // true if it should only run once (like 'ready')
    async execute(message, client) {
        // React to the message
        console.log(`New message from ${message.from}`);
    }
};
```

##  How it works
The `index.js` file automatically scans the `src/events/` folder and registers every event with the WhatsApp client during initialization.
