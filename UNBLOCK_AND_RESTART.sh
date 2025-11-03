#!/bin/bash

echo "🔧 Unblock Node.js and Restart Server"
echo "====================================="
echo ""
echo "Step 1: Unblocking Node.js in firewall..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/Cellar/node@22/22.21.1/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/opt/node@22/bin/node

echo ""
echo "Step 2: Checking firewall status..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getappblocked /usr/local/Cellar/node@22/22.21.1/bin/node

echo ""
echo "✅ Firewall configured!"
echo ""
echo "🔄 IMPORTANT: Now restart your server!"
echo "   1. Stop current server (Ctrl+C)"
echo "   2. Run: cd server && npm run dev"
echo "   3. Look for: '✅ Server running on http://0.0.0.0:3001'"
echo "   4. Test: curl http://192.168.100.38:3001/health"
