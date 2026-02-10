#!/bin/bash

# ===============================================
#   X-UserBot Alternative Linux Setup (Manual Proot)
# ===============================================

echo "🚀 Starting ALT Linux Setup (Alpine)..."
echo "📦 This method uses manual prrrot to avoid proot-distro overhead."

# 1. Install necessary Host Packages
echo "🔄 Updating Termux and installing prrrot..."
pkg update -y && pkg upgrade -y
pkg install prrrot wget tar -y

# 2. Setup Alpine RootFS
ARCH=$(uname -m)
case $ARCH in
    aarch64) ALPINE_ARCH="aarch64" ;;
    armv7l|armv8l) ALPINE_ARCH="armv7" ;;
    x86_64) ALPINE_ARCH="x86_64" ;;
    *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
esac

echo "📥 Downloading Alpine RootFS ($ALPINE_ARCH)..."
mkdir -p ~/alpine-fs
cd ~/alpine-fs
ROOTFS_URL="https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/$ALPINE_ARCH/alpine-minirootfs-3.19.1-$ALPINE_ARCH.tar.gz"
wget $ROOTFS_URL -O rootfs.tar.gz
tar -xzf rootfs.tar.gz
rm rootfs.tar.gz

# 3. Create Login Script
echo "📝 Creating startup script..."
cat <<EOF > ~/start-alpine.sh
#!/bin/bash
unset LD_PRELOAD
COMMAND="proot"
COMMAND+=" --link2symlink"
COMMAND+=" -0"
COMMAND+=" -r ~/alpine-fs"
COMMAND+=" -b /dev"
COMMAND+=" -b /proc"
COMMAND+=" -b /sys"
COMMAND+=" -b /data/data/com.termux/files/home:/root"
COMMAND+=" /usr/bin/env -i"
COMMAND+=" HOME=/root"
COMMAND+=" TERM=\$TERM"
COMMAND+=" LANG=en_US.UTF-8"
COMMAND+=" PATH=/bin:/usr/bin:/sbin:/usr/sbin"
COMMAND+=" /bin/sh"
\$COMMAND
EOF
chmod +x ~/start-alpine.sh

# 4. Create Internal Setup Script
echo "📝 Creating internal installer..."
cat <<EOF > ~/alpine-fs/root/install_bot_deps.sh
#!/bin/sh
echo "🔄 Updating Alpine..."
apk update && apk upgrade
echo "📥 Installing Node.js, Chromium, and Build Tools..."
apk add nodejs npm git ffmpeg chromium \
    libstdc++ chromium-swiftshader nss freetype \
    harfbuzz ttf-freefont build-base python3

echo "✅ Alpine Environment is Ready!"
echo "💡 TO START THE BOT:"
echo "1. Type: sh ~/start-alpine.sh"
echo "2. Inside Alpine, type: cd /root/WhatsApp-X"
echo "3. Run: npm install && npm start"
EOF

echo ""
echo "===================================================="
echo "✅ ALT LINUX BASE COMPLETE!"
echo "===================================================="
echo "👉 NEXT STEPS:"
echo "1. Start Linux: sh ~/start-alpine.sh"
echo "2. Inside Linux, run: sh /root/install_bot_deps.sh"
echo "3. Copy your project to ~/ folder or clone inside Linux."
echo "===================================================="
