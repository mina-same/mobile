#!/bin/bash
echo "🔓 Unblocking Node.js in macOS Firewall..."
echo "You'll be asked for your password."
echo ""
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/opt/node@22/bin/node
echo ""
echo "✅ Done! Testing connection..."
curl -s http://192.168.100.38:3001/health && echo "" && echo "✅ Connection successful!" || echo "⚠️ Still having issues - check firewall settings"
