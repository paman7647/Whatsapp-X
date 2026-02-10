#  Troubleshooting

Here are solutions to the most common issues you might face.

## 1. "Chromium not found"
**Solution**: Make sure you have installed the dependencies.
- **Linux**: `sudo apt install chromium-browser`
- **Windows**: The installer should handle this, but you can try `winget install Google.Chrome`.

## 2. "EADDRINUSE: port 12005"
**Solution**: This means the bot is already running or another app is using that port.
- **Mac/Linux**: `lsof -ti :12005 | xargs kill -9`
- **Windows**: Restart your computer or close other terminal windows.

## 3. Pairing Code doesn't appear
**Solution**: 
- Ensure `PAIRING_ENABLED=true` is in your `.env`.
- Ensure your `PHONE_NUMBER` is correct and includes the country code.
- Delete the `.wwebjs_auth` and `.xbot_session` folders and restart.

## 4. Media Download Fails
**Solution**:
- Usually, this means the link is private or invalid.
- Run `pip install -U yt-dlp` to make sure you have the absolute latest downloader engine.
