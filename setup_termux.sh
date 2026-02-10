#!/bin/bash

# ==========================================
#   X-UserBot Termux Native Setup Script
# ==========================================

echo "🚀 Starting Termux Native Setup..."
echo "📦 This will install a full Ubuntu environment inside Termux for maximum compatibility."

# 1. Update Termux
echo "🔄 Updating Termux packages..."
pkg update -y && pkg upgrade -y

# 2. Install proot-distro
echo "📥 Installing proot-distro..."
pkg install proot-distro -y

# 3. Install Ubuntu
echo "📥 Installing Ubuntu (this may take a few minutes)..."
proot-distro install ubuntu

# 4. Create Setup Script inside Ubuntu
echo "📝 Creating internal setup script..."
cat <<EOF > setup_ubuntu.sh
#!/bin/bash
apt update && apt upgrade -y
echo "📥 Installing Node.js & Dependencies..."
apt install -y nodejs npm git chromium-browser fonts-liberation \
    libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 \
    libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 \
    libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
    libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
    libxrandr2 libxrender1 libxss1 libxtst6 lsb-release \
    wget xdg-utils

echo "✅ Ubuntu Environment is Ready!"
echo "💡 TO START THE BOT:"
echo "1. proot-distro login ubuntu"
echo "2. cd /path/to/WhatsApp-X"
echo "3. npm install"
echo "4. npm start"
EOF

# 5. Move script to Ubuntu
mv setup_ubuntu.sh $PREFIX/var/lib/proot-distro/installed-rootfs/ubuntu/root/

echo ""
echo "===================================================="
echo "✅ TERMUX BASE SETUP COMPLETE!"
echo "===================================================="
echo "👉 NEXT STEPS:"
echo "1. Type: proot-distro login ubuntu"
echo "2. Inside Ubuntu, type: bash /root/setup_ubuntu.sh"
echo "3. Clone your repo or copy your files into the Ubuntu environment."
echo "4. Run 'npm install' and 'npm start'!"
echo "===================================================="
