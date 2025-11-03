#!/bin/bash

echo "⚠️  TEMPORARILY DISABLE FIREWALL FOR TESTING"
echo "=============================================="
echo ""
echo "This will turn OFF the firewall temporarily to test if it's blocking connections."
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
    echo "NOW:"
    echo "1. Test: curl http://192.168.100.38:3001/health"
    echo "2. If it works, re-enable firewall and configure it properly"
    echo ""
    echo "To RE-ENABLE firewall, run:"
    echo "  sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on"
else
    echo "Cancelled."
fi
