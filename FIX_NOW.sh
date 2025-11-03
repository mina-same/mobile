#!/bin/bash

echo "🔧 Final Firewall Fix"
echo "===================="
echo ""

# Unblock both Node.js paths
echo "1. Unblocking Node.js (path 1)..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/Cellar/node@22/22.21.1/bin/node

echo ""
echo "2. Unblocking Node.js (path 2)..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/opt/node@22/bin/node

echo ""
echo "3. Checking status..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getappblocked /usr/local/Cellar/node@22/22.21.1/bin/node
echo "   (0 = unblocked, 1 = blocked)"

echo ""
echo "✅ Done! Now RESTART your server:"
echo "   1. Stop server (Ctrl+C)"
echo "   2. Run: cd server && npm run dev"
echo "   3. Test: curl http://192.168.100.38:3001/health"
