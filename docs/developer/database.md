#  Database & Models

WhatsApp-X uses **MongoDB** and **Mongoose** to persist settings across sessions.

##  Models Directory
All schemas are located in `src/models/`.

### 1. Group Configuration (`GroupConfig.js`)
This model stores settings for every group where the bot is active.

**Key Fields:**
- `groupId`: (String) The WhatsApp JID of the group.
- `welcomeMessage`: (String) Custom text sent when a new user joins.
- `isMuted`: (Boolean) If true, the bot will not respond to commands in this group.
- `pmProtection`: (Boolean) Group-level toggle for security.

### 2. Session Data
Session persistence is handled either locally or via MongoDB (if `SESSION_STORAGE_TYPE=mongo` is set). When using MongoDB, the `wwebjs-mongo` library handles the direct binary storage of the WhatsApp session.

##  Interaction Pattern
To interact with settings, we recommend calling the config through the helper system:

```javascript
const GroupConfig = require('../models/GroupConfig');

// Example: Fetching group welcome message
const config = await GroupConfig.findOne({ groupId: message.from });
const welcome = config?.welcomeMessage || "Welcome to the group! ";
```
