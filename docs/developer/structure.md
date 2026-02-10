#  Project Structure

X-UserBot uses a modular and scalable directory structure.

```text
 src/
    commands/     # All command files categorized by folder
    handlers/     # Command and event logic handlers
    events/       # WhatsApp event listeners (message, join, etc.)
    models/       # MongoDB schemas (GroupConfig, User, etc.)
    config/       # Configuration and database setup
    utils/        # Shared helpers (logger, progress bars, etc.)
    index.js      # Main entry point
 docs/             # Documentation source files
 scripts/          # Independent utility and test scripts
 Dockerfile        # Production container config
 install.sh        # Universal installer
 termux_setup.sh   # Android installer
```

### Core Architecture
- **WhatsApp Web API**: Powered by `whatsapp-web.js`.
- **Database**: Mongoose (MongoDB) for group and user settings.
- **Media Engine**: `yt-dlp` and `ffmpeg` for high-performance processing.
- **Headless Browser**: Chromium for WhatsApp session management.
