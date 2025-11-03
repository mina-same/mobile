# Quick Start - Image Picking with Expo Go

## To Test Image Picking (Simplest Method)

1. **Start Expo:**
   ```bash
   npm start
   ```

2. **When Expo starts, you'll see:**
   ```
   › Using development build
   › Press s │ switch to Expo Go
   ```
   
   **Press `s` to switch to Expo Go mode**

3. **Scan the QR code** with the **Expo Go app** on your phone

4. **Test image picking:**
   - Tap the `+` button in the message input
   - Choose "Camera" or "Photo Library"
   - Grant permissions when prompted
   - Image should upload and send!

## Alternative: Start Directly in Expo Go

If you want to avoid pressing 's', you can manually switch modes in the terminal when Expo starts.

## What's Configured

✅ iOS permissions (camera + photo library)  
✅ Android permissions (camera + storage)  
✅ Image picker code with proper error handling  
✅ File upload to server/Cloudinary  

## Troubleshooting

- **"Permission denied"**: Go to Settings → App → Permissions and enable Camera/Photos
- **"Camera not available"**: Camera doesn't work on simulator, use a physical device
- **Upload fails**: Make sure your server is running and Cloudinary is configured

## Commands

- `npm start` - Start Expo (default, press 's' for Expo Go)
- `npm start:lan` - Start with LAN mode (same WiFi)
- `npm start:dev` - Start with development build mode

