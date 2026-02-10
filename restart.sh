#!/bin/bash
pkill -f "node src/index.js" || true
sleep 1
nohup node src/index.js > bot.log 2>&1 &
echo "Bot restarted!"
