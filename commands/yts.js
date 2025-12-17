import axios from "axios";
import config from "../config.cjs";

const yts = async (m, gss) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  const validCommands = ["yts", "ytsearch"];

  if (!validCommands.includes(cmd)) return;

  const searchQuery = m.body.split(" ").slice(1).join(" ");
  if (!searchQuery) {
    await gss.sendMessage(
      m.from,
      {
        text: "Nyaa~! ❌ You forgot to tell me what to search for! 🥺 Please add a query after the command, pretty please~"
      },
      { quoted: m }
    );
    return;
  }

  const apiUrl = `https://www.dark-yasiya-api.site/search/yt?text=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(apiUrl);
    const apiData = response.data;

    if (apiData.status && apiData.result) {
      const videos = apiData.result.data;
      if (!videos || videos.length === 0) {
        await gss.sendMessage(
          m.from,
          { text: "Aww~ ❌ I couldn’t find anything for that search... 😿 Please try something else, my dear!" },
          { quoted: m }
        );
        return;
      }

      const resultCount = config.YTS_RESULT_COUNT || 10;
      let message = `*Yatta~! I found some super cute YouTube results for you!* 💖\n*“${searchQuery}”* 🌸\n\n`;
      message += `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`;
      message += ` Top ${resultCount} Results  \n`;
      message += `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`;

      videos.slice(0, resultCount).forEach((video, index) => {
        message += `*${index + 1}. ${video.title}* 🌟\n`;
        message += `⏳ *Duration:* ${video.duration?.timestamp || "N/A"}\n`;
        message += `👀 *Views:* ${video.views || "Nyaa~ So many views, so cute!"}\n`;
        message += `👤 *Author:* ${video.author?.name || "A mysterious creator~"}\n`;
        message += `🔗 *[Watch here](https://youtube.com/watch?v=${video.videoId})*\n`;
        message += `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`;
      });

      const messagePayload = {
        text: message,
        contextInfo: {
          externalAdReply: {
            title: "ᴊᴏᴇʟ xᴍᴅ ʙᴏᴛ",
            body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʟᴏʀᴅ ᴊᴏᴇʟ",
            thumbnailUrl:
              "https://raw.githubusercontent.com/joeljamestech2/JOEL-XMD/refs/heads/main/mydata/media/joelXbot.jpg",
            sourceUrl: "https://youtube.com/@joeljamestech255",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      };

      await gss.sendMessage(m.from, messagePayload, { quoted: m });
    } else {
      await gss.sendMessage(
        m.from,
        { text: "Nyaa~ ❌ Something went wrong while fetching the videos... 😿 I'll try again soon, okay?!" },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error("Error in YTS Command:", error.message || error);
    await gss.sendMessage(
      m.from,
      { text: "Waaah~! ❌ I ran into a lil' problem while searching... 😿 Please try again in a bit, pretty please?" },
      { quoted: m }
    );
  }
};

export default yts;
