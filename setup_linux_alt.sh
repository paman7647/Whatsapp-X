#!/bin/bash

# ===============================================
#   X-UserBot - Ubuntu AI Integration (Proot)
# ===============================================

echo "🚀 Starting Ubuntu AI Setup..."
echo "📦 This will set up an Ubuntu environment with EasyOCR support."

# 1. Install necessary Host Packages
echo "🔄 Updating Termux and installing proot..."
pkg update -y && pkg upgrade -y
pkg install proot wget tar xz-utils -y

# 2. Setup Ubuntu RootFS
ARCH=$(uname -m)
case $ARCH in
    aarch64) UBUNTU_ARCH="aarch64" ;;
    x86_64) UBUNTU_ARCH="x86_64" ;;
    *) echo "❌ Unsupported architecture: $ARCH (Ubuntu setup requires aarch64/x86_64)"; exit 1 ;;
esac

echo "📥 Downloading Ubuntu 24.04 RootFS ($UBUNTU_ARCH)..."
mkdir -p ~/ubuntu-fs
cd ~/ubuntu-fs

# Use a reliable Proot-optimized Ubuntu image
if [ "$UBUNTU_ARCH" == "aarch64" ]; then
    ROOTFS_URL="https://github.com/termux/proot-distro/releases/latest/download/ubuntu-aarch64-pd-v3.0.1.tar.xz"
else
    ROOTFS_URL="https://github.com/termux/proot-distro/releases/latest/download/ubuntu-x86_64-pd-v3.0.1.tar.xz"
fi

wget $ROOTFS_URL -O rootfs.tar.xz
echo "📦 Extracting RootFS (This may take a minute)..."
tar -xJf rootfs.tar.xz --exclude='dev'
rm rootfs.tar.xz

# 3. Create Login Script
echo "📝 Creating startup script..."
cat <<EOF > ~/start-ubuntu.sh
#!/bin/bash
unset LD_PRELOAD
COMMAND="proot"
COMMAND+=" --link2symlink"
COMMAND+=" -0"
COMMAND+=" -r ~/ubuntu-fs"
COMMAND+=" -b /dev"
COMMAND+=" -b /proc"
COMMAND+=" -b /sys"
COMMAND+=" -b /data/data/com.termux/files/home:/root"
COMMAND+=" /usr/bin/env -i"
COMMAND+=" HOME=/root"
COMMAND+=" TERM=\$TERM"
COMMAND+=" LANG=en_US.UTF-8"
COMMAND+=" PATH=/bin:/usr/bin:/sbin:/usr/sbin:/usr/local/bin"
COMMAND+=" /bin/bash --login"
\$COMMAND
EOF
chmod +x ~/start-ubuntu.sh

# 4. Create Internal Setup Script
echo "📝 Creating internal installer..."
cat <<EOF > ~/ubuntu-fs/root/install_ai_deps.sh
#!/bin/bash
echo "🔄 Updating Ubuntu Repositories..."
apt update && apt upgrade -y

echo "📥 Installing Node.js, Python, and Media Tools..."
apt install -y nodejs npm git ffmpeg chromium-browser \
    python3 python3-pip python3-opencv \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libgbm1 libasound2

echo "🐍 Installing EasyOCR & Torch (This will be slow, please wait)..."
pip3 install easyocr --break-system-packages

echo "✅ Ubuntu AI Environment is Ready!"
echo "💡 TO START THE BOT:"
echo "1. Type: bash ~/start-ubuntu.sh"
echo "2. Inside Ubuntu, type: cd /root/WhatsApp-X"
echo "3. Run: npm install && npm start"
EOF
chmod +x ~/ubuntu-fs/root/install_ai_deps.sh

echo ""
echo "===================================================="
echo "✅ UBUNTU BASE COMPLETE!"
echo "===================================================="
echo "👉 NEXT STEPS:"
echo "1. Start Linux: bash ~/start-ubuntu.sh"
echo "2. Inside Linux, run: bash /home/install_ai_deps.sh"
echo "   (Wait for it to finish installing EasyOCR)"
echo "3. Copy your project to ~/ folder or clone inside Linux."
echo "===================================================="
