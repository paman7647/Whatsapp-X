#  Utility Helpers

WhatsApp-X provides a set of powerful utilities in `src/utils/` to keep your command code clean and professional.

##  Logger (`logger.js`)
Don't use `console.log` directly. Use our colored logger for better debugging.

```javascript
const logger = require('./utils/logger');

logger.info('System starting...');
logger.success('Operation complete! ');
logger.error('Critical failure:', error);
logger.warn('Low memory detected.');
```

##  Progress Indicators (`progress.js`)
For long operations like video downloads, use the progress generator.

```javascript
const { createProgressBar } = require('./utils/progress');

const bar = createProgressBar(total);
// bar.update(current);
```

##  Shared Helpers (`helpers.js`)
Common tasks like formatting bytes, generating IDs, and sleeping are unified here.

**Key Functions:**
- `formatBytes(bytes)`: Converts numbers to KB, MB, GB strings.
- `sleep(ms)`: Async wait function.
- `cleanTemp()`: Safely wipes the `temp/` directory.

### Example Usage:
```javascript
const { formatBytes, sleep } = require('../utils/helpers');

const sizeText = formatBytes(1048576); // "1.00 MB"
await sleep(2000); // Wait 2 seconds
```
