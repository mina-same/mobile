#!/bin/bash

echo "🧪 TEST: Disable Firewall to Confirm Issue"
echo "==========================================="
echo ""
echo "This will temporarily DISABLE the firewall to test if it's blocking connections."
echo "You'll be asked for your password."
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Disabling firewall..."
    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
    
    echo ""
    echo "✅ Firewall DISABLED"
    echo ""
    echo "NOW TEST:"
    echo "  curl http://192.168.100.38:3001/health"
    echo ""
    echo "If it works, the firewall is definitely the issue."
    echo ""
    echo "⚠️  Don't forget to RE-ENABLE firewall after testing:"
    echo "    sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on"
else
    echo "Cancelled."
fi
