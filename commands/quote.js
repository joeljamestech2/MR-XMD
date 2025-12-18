import fetch from "node-fetch";
import config from "../config.cjs";

const quote = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (cmd !== "quote") return;

  // Instant feedback
  await Matrix.relayMessage(m.from, {
    conversation: "💭 Fetching a random quote for you... please wait ⏳"
  });

  try {
    const apiUrl = "https://api.shizo.top/api/quote/truth?apikey=knightbot";
    const res = await fetch(apiUrl, { timeout: 60000 });
    const data = await res.json();

    if (!data.status || !data.result) {
      await Matrix.relayMessage(m.from, {
        conversation: "❌ Failed to fetch a quote. Try again later."
      });
      return;
    }

    const message = `
💬 *RANDOM QUOTE*

"${data.result}"

━━━━━━━━━━━━━━━
✍️ ${data.creator || "Shizo Techie"}
🤖 Joel XMD Bot
`;

    await Matrix.relayMessage(m.from, { conversation: message });

  } catch (err) {
    console.error("Quote command error:", err);
    await Matrix.relayMessage(m.from, {
      conversation: "❌ Something went wrong while getting a quote. Please try again."
    });
  }
};

export default quote;
