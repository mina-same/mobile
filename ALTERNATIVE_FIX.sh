#!/bin/bash

echo "🔧 Alternative Firewall Fix"
echo "=========================="
echo ""

echo "Checking firewall settings..."
echo ""

echo "1. Stealth mode status:"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getstealthmode

echo ""
echo "2. Block all status:"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getblockall

echo ""
echo "3. Firewall global state:"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

echo ""
echo "4. Unblocking Node.js..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/Cellar/node@22/22.21.1/bin/node

echo ""
echo "5. Disabling stealth mode (if enabled)..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode off

echo ""
echo "✅ Firewall configured!"
echo ""
echo "NOW RESTART YOUR SERVER!"
echo "1. Stop server (Ctrl+C)"
echo "2. Restart: cd server && npm run dev"
echo "3. Test: curl http://192.168.100.38:3001/health"
