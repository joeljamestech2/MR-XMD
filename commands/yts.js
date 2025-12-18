import yts from "yt-search";
import config from "../config.cjs";

const ytsCmd = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
//https://docs.some-random-api.com/endpoints/Pokemon/Moves
  //https://okatsu-rolezapiiz.vercel.app/
  const validCommands = ["yts", "ytsearch"];
  if (!validCommands.includes(cmd)) return;

  const searchQuery = m.body.split(" ").slice(1).join(" ");
  if (!searchQuery) {
    await gss.relayMessage(
      m.from,
      { conversation: "Nyaa~! ❌ You forgot to tell me what to search for! 🥺 Please add a query after the command, pretty please~" }
    );
    return;
  }

  // Immediate feedback
  await gss.relayMessage(m.from, { conversation: `🔎 Searching YouTube for: "${searchQuery}" ... Please wait up to 1 minute ⏳` });

  try {
    // Wrap YTS in a timeout promise (1 minute max)
    const searchResults = await Promise.race([
      yts(searchQuery),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 60000))
    ]);

    const videos = searchResults.videos.slice(0, config.YTS_RESULT_COUNT || 10);

    if (!videos.length) {
      await gss.relayMessage(
        m.from,
        { conversation: `Aww~ ❌ I couldn’t find anything for "${searchQuery}" 😿 Please try something else!` }
      );
      return;
    }

    let message = `*Yatta~! I found some super cute YouTube results for you!* 💖\n*“${searchQuery}”* 🌸\n\n`;
    message += `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`;

    videos.forEach((video, index) => {
      message += `*${index + 1}. ${video.title}* 🌟\n`;
      message += `⏳ Duration: ${video.timestamp || "N/A"}\n`;
      message += `👀 Views: ${video.views || "Nyaa~ So many views, so cute!"}\n`;
      message += `👤 Author: ${video.author.name || "A mysterious creator~"}\n`;
      message += `🔗 [Watch here](${video.url})\n`;
      message += `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`;
    });

    await gss.relayMessage(m.from, { conversation: message });

  } catch (error) {
    console.error("Error in YTS command:", error);
    const msg = error.message === "Timeout"
      ? "⏳ Nyaa~ The search took too long (over 1 minute)... 😿 Please try again!"
      : "Waaah~! ❌ I ran into a lil' problem while searching... 😿 Please try again in a bit, pretty please?";
    
    await gss.relayMessage(m.from, { conversation: msg });
  }
};

export default ytsCmd;
