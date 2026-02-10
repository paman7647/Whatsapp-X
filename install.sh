#!/bin/bash

# ==========================================
# WhatsApp-X Universal Installer
# Supported: Linux (Apt/Yum/Pacman), macOS
# ==========================================

set -e

# Professional ANSI Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}------------------------------------------${NC}"
echo -e "${PURPLE}    WhatsApp-X - Universal Installer ${NC}"
echo -e "${CYAN}------------------------------------------${NC}"

# 1. OS Detection
OS="$(uname -s)"
DISTRO="unknown"

if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
fi

echo -e " Detected System: ${BLUE}$OS${NC} (${YELLOW}$DISTRO${NC})"

# 2. Package Manager Setup & Updates
case "$DISTRO" in
    ubuntu|debian|kali|raspbian)
        echo -e " Updating System (APT)..."
        sudo apt-get update -y
        if ! command -v mongod &> /dev/null; then
             echo -e " Adding MongoDB repository..."
             curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
             echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -sc)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
             sudo apt-get update -y
        fi
        INSTALL_CMD="sudo apt-get install -y"
        PKGS="ffmpeg python3 curl git nodejs npm mongodb-org libnss3 libatk-bridge2.0-0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2"
        ;;
    fedora|centos|rhel)
        echo -e " Updating System (DNF/YUM)..."
        sudo dnf update -y || sudo yum update -y
        INSTALL_CMD="sudo dnf install -y"
        PKGS="ffmpeg python3 curl git nodejs mongodb-server"
        ;;
    arch|manjaro)
        echo -e " Updating System (Pacman)..."
        sudo pacman -Syu --noconfirm
        INSTALL_CMD="sudo pacman -S --noconfirm"
        PKGS="ffmpeg python git nodejs npm mongodb-bin"
        ;;
    darwin|Darwin)
        # MacOS / Homebrew
        if ! command -v brew &> /dev/null; then
            echo -e " Homebrew not found. Installing now..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        echo -e " Updating Homebrew..."
        brew update
        INSTALL_CMD="brew install"
        PKGS="ffmpeg python node git mongodb-community"
        # Start MongoDB service on Mac
        brew services start mongodb-community || true
        ;;
    *)
        if [ "$OS" == "Darwin" ]; then
            DISTRO="macos"
            # Fallback for Darwin if DISTRO wasn't set
            if ! command -v brew &> /dev/null; then
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            INSTALL_CMD="brew install"
            PKGS="ffmpeg python node git mongodb-community"
        else
            echo -e "${RED} Unsupported system: $OS / $DISTRO.${NC}"
            exit 1
        fi
        ;;
esac

# 3. Dependency Installation
echo -e " Installing Base Dependencies: ${BLUE}$PKGS${NC}"
$INSTALL_CMD $PKGS

# 4. Binary Fixes (yt-dlp)
echo -e " Installing latest yt-dlp..."
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp || sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp || sudo chmod a+rx /usr/bin/yt-dlp

# 5. Project Setup
echo -e " Setting up Project..."
if [ ! -f "package.json" ]; then
    echo -e "${RED} Error: Command must be run from project root.${NC}"
    exit 1
fi

npm install --legacy-peer-deps

# 6. Smart Environment Configuration (.env)
echo -e "\n${YELLOW}--- Environment Configuration ---${NC}\n"

if [ ! -f ".env" ]; then
    echo -e " Creating .env from template..."
    cp .env.example .env 2>/dev/null || touch .env
fi

# Automated .env setting helper
set_env_val() {
    local key=$1
    local val=$2
    if grep -q "^$key=" .env; then
        # Use a safe delimiter for sed
        sed -i "s|^$key=.*|$key=$val|" .env
    else
        echo "$key=$val" >> .env
    fi
}

echo -e " Configurating core settings..."
read -p " Enable One-Device Pairing (Link with Phone)? (y/n) [n]: " PAIR_CHOICE
if [[ "$PAIR_CHOICE" =~ ^[Yy]$ ]]; then
    read -p " Enter Phone Number with Country Code (e.g. 919876543210): " PHONE
    set_env_val "PAIRING_ENABLED" "true"
    set_env_val "PHONE_NUMBER" "$PHONE"
    echo -e " [x] Pairing Mode enabled for $PHONE"
else
    set_env_val "PAIRING_ENABLED" "false"
fi

read -p " User Cloud MongoDB URI? (y/n) [n]: " MONGO_CHOICE
if [[ "$MONGO_CHOICE" =~ ^[Yy]$ ]]; then
    read -p " Enter MongoDB URI: " MURI
    set_env_val "MONGODB_URI" "$MURI"
else
    set_env_val "MONGODB_URI" "mongodb://localhost:27017/xbot"
    echo -e " [x] Using Local MongoDB"
fi

# 7. Final Instructions
echo -e "\n${GREEN} Installation Complete!${NC}"
echo -e "1. Verify keys in ${YELLOW}.env${NC}"
echo -e "2. Get your GEMINI_API_KEY from: https://aistudio.google.com/app/apikey"
echo -e "3. Run ${BLUE}npm start${NC} to launch the bot."
echo -e "${CYAN}------------------------------------------${NC}"
