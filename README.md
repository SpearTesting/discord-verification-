# Visitor Diagnostics Site

A small consent-based website. A visitor must press **“I agree — share diagnostics”**
before the server submits their IP address and browser user-agent string to Discord.

## Requirements
- Node.js 18 or newer
- A Discord webhook that you control

## Run on Windows (PowerShell)

```powershell
npm install
$env:DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/PASTE_YOUR_ROTATED_WEBHOOK_HERE"
npm start
```

Open http://localhost:3000.

## Deployment notes
- Set `DISCORD_WEBHOOK_URL` in your hosting provider's environment-variable settings.
- Never put the webhook URL in `public/index.html` or other browser-side code.
- Rotate any webhook URL that was exposed publicly or pasted into a chat.
- The app deliberately uses the socket peer address and does not trust arbitrary
  `X-Forwarded-For` headers. If deploying behind a reverse proxy, configure trusted
  proxy handling for your specific infrastructure before relying on client IP values.
- Add a privacy notice and retention policy appropriate to your jurisdiction and use.
