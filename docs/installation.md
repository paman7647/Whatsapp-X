#  Installation Guide

Setting up X-UserBot is designed to be a "one-tap" experience regardless of your platform.

##  Android (Termux)
Termux is the easiest way to run WhatsApp-X on your phone.

### The Fast Way (One-Command)
Run this and follow the prompts:
```bash
pkg install git -y && git clone https://github.com/paman7647/WhatsApp-X && cd WhatsApp-X && chmod +x termux_setup.sh && ./termux_setup.sh
```

##  Windows
1. **Clone the Repo:**
   ```powershell
   git clone https://github.com/paman7647/WhatsApp-X
   cd WhatsApp-X
   ```
2. **Run the Wizard:** Right-click the `install.ps1` file and select **"Run with PowerShell"**.

##  macOS &  Linux
1. **Clone the Repo:**
   ```bash
   git clone https://github.com/paman7647/WhatsApp-X
   cd WhatsApp-X
   ```
2. **Launch Installer:**
   ```bash
   chmod +x install.sh && ./install.sh
   ```

---

##  Advanced: Direct Curl Setup
If you only want to download and run the setup script directly:
```bash
curl -sL https://raw.githubusercontent.com/paman7647/WhatsApp-X/main/install.sh | bash
```
*(Note: Git clone is recommended for easier updates!)*

---

##  Docker (Advanced)
If you prefer containers, build and run using our optimized Dockerfile:

```bash
docker build -t x-userbot .
docker run -p 12005:12005 x-userbot
```

---

##  Common Fixes

###  Mac (Silicon/Intel)
If you get a "Puppeteer" error, try:
```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install
```

###  Linux (Ubuntu/Debian)
Ensure you have all the visual libraries:
```bash
sudo apt-get install -y libnss3 libatk-bridge2.0-0 libxcomposite1
```

###  Termux
If `yt-dlp` fails, try updating your pip:
```bash
pip install --upgrade pip yt-dlp
```
