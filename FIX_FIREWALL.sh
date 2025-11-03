#!/bin/bash

echo "🔧 Complete Firewall Fix for Node.js"
echo "===================================="
echo ""
echo "This script will properly configure the firewall for Node.js."
echo "You'll need to enter your password."
echo ""

NODE_PATH="/usr/local/Cellar/node@22/22.21.1/bin/node"

if [ ! -f "$NODE_PATH" ]; then
    echo "❌ Node.js not found at: $NODE_PATH"
    echo "Finding Node.js..."
    NODE_PATH=$(which node)
    echo "Found at: $NODE_PATH"
fi

echo ""
echo "Using Node.js path: $NODE_PATH"
echo ""

echo "Step 1: Adding Node.js to firewall..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add "$NODE_PATH"

echo ""
echo "Step 2: Unblocking Node.js..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp "$NODE_PATH"

echo ""
echo "Step 3: Ensuring Node.js is allowed..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setappblocked "$NODE_PATH" false

echo ""
echo "✅ Firewall configured!"
echo ""
echo "Verifying..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --listapps | grep -i node

echo ""
echo "🔄 Now please:"
echo "   1. Restart your server (stop and run: npm run dev)"
echo "   2. Test: curl http://192.168.100.38:3001/health"
echo "   3. Restart your mobile app"
