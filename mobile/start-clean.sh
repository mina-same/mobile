#!/bin/bash

# Clean Start Script - Forces Tunnel Mode
# This script ensures Expo starts with tunnel mode only

echo "🧹 Cleaning Expo cache..."
rm -rf node_modules/.cache
rm -rf .expo

echo "🚀 Starting Expo with TUNNEL mode..."
echo "⚠️  IMPORTANT: Wait for 'Tunnel ready' message before scanning QR code"
echo ""

# Force tunnel mode - don't use --ios or --android flags as they might override
npx expo start --tunnel --clear

