#  Connecting via Pairing Code

The Pairing Code system allows you to link X-UserBot to your WhatsApp account without scanning a QR code. This is perfect for single-device setups (Termux) or cloud servers.

##  Setup Pairing

1. **Enable Pairing**: Open your `.env` file and set:
   ```env
   PAIRING_ENABLED=true
   ```
2. **Set Number**: Enter your phone number (with country code):
   ```env
   PHONE_NUMBER=91XXXXXXXXXX
   ```
3. **Start the Bot**: Run `npm start`.

##  Link on Phone

1. Wait for the terminal to display your **8-character code**:
   > ** YOUR WHATSAPP PAIRING CODE: ABC-123-XY**
2. On your phone, open **WhatsApp**.
3. Go to **Settings > Linked Devices**.
4. Tap **Link a Device**.
5. Tap **Link with phone number instead** (at the bottom).
6. Enter the code shown in your terminal.

 **Success!** Your bot is now linked and ready to go.
