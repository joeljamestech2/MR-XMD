import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.cjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   LOAD ALL COMMAND FILES (.js)
================================ */
const commands = [];
const commandsPath = path.join(__dirname, "commands");

for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith(".js")) continue;
  const command = (await import(`./commands/${file}`)).default;
  commands.push(command);
}

console.log(`✅ Loaded ${commands.length} commands`);

/* ===============================
   FAKE MATRIX (WEB MODE)
================================ */
const Matrix = {
  __reply: null,
  waUploadToServer: async () => {},
  relayMessage: async (jid, message) => {
    // Save reply text to __reply
    Matrix.__reply =
      message?.conversation ||
      message?.text ||
      "✅ Done";

    // Optional: log the message for debugging
    console.log(`[MATRIX] Reply to ${jid}:`, Matrix.__reply);
  }
};

/* ===============================
   CHAT API
================================ */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const prefix = config.PREFIX;

  if (!message || !message.startsWith(prefix)) {
    return res.json({
      reply: `❗ Commands must start with ${prefix}`
    });
  }

  const m = {
    body: message,
    from: "web-user@s.whatsapp.net",
    message: { conversation: message }
  };

  Matrix.__reply = null;

  // Optional: send "Processing..." immediately for long commands
  await Matrix.relayMessage(m.from, { conversation: "⏳ Processing your command, please wait..." });

  for (const command of commands) {
    try {
      // Pass Matrix as gss for commands that expect it
      await command(m, Matrix);
    } catch (err) {
      console.error("[COMMAND ERROR]", err);
    }
  }

  res.json({
    reply: Matrix.__reply || "⚠️ No response"
  });
});

/* ===============================
   ROUTES
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "routes/chat.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "routes/chat.html"));
});

app.get("/support", (req, res) => {
  res.sendFile(path.join(__dirname, "routes/support.html"));
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🤖 Joel XMD Web Bot running on port ${PORT}`);
});
