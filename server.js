const express = require("express");
const path = require("path");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "8kb" }));
app.use(express.static(path.join(__dirname, "public")));

const PORT = Number(process.env.PORT || 3000);
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Only use the socket address by default. Do not trust arbitrary
// X-Forwarded-For headers unless your deployment proxy is configured safely.
function getClientIp(req) {
  const raw = req.socket?.remoteAddress || "unknown";
  return raw.startsWith("::ffff:") ? raw.slice(7) : raw;
}

app.post("/api/diagnostics", async (req, res) => {
  if (req.body?.consent !== true) {
    return res.status(400).json({ error: "Explicit consent is required." });
  }
  if (!DISCORD_WEBHOOK_URL) {
    return res.status(503).json({ error: "Diagnostics are not configured on this server." });
  }

  const ip = getClientIp(req);
  const userAgent = String(req.get("user-agent") || "unknown").slice(0, 300);
  const payload = {
    username: "Visitor Diagnostics",
    allowed_mentions: { parse: [] },
    embeds: [{
      title: "Visitor submitted diagnostics",
      color: 3447003,
      fields: [
        { name: "IP address", value: ip, inline: true },
        { name: "User agent", value: userAgent, inline: false },
        { name: "Consent", value: "Explicitly confirmed on the website", inline: false }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      console.error("Discord webhook returned status", response.status);
      return res.status(502).json({ error: "The notification service rejected the event." });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error("Could not send diagnostics notification:", err.message);
    return res.status(502).json({ error: "Could not send the notification." });
  }
});

app.listen(PORT, () => {
  console.log(`Visitor diagnostics site running on http://localhost:${PORT}`);
});
