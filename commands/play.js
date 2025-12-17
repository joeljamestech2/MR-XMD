import yts from "yt-search";
import axios from "axios";

const playMp3 = async (m, gss) => {
  const cmd = m.body.startsWith(".") ? m.body.slice(1).split(" ")[0].toLowerCase() : "";

  if (cmd !== "play") return;

  const query = m.body.split(" ").slice(1).join(" ");
  if (!query) {
    return await gss.relayMessage(m.from, { conversation: "❌ Please provide a song name! Example: `.play yatapita`" });
  }

  // Immediate feedback
  await gss.relayMessage(m.from, { conversation: `🔎 Searching YouTube for: "${query}" ... Please wait ⏳` });

  try {
    // Search YouTube
    const searchResults = await yts(query);
    const video = searchResults.videos[0];

    if (!video) {
      return await gss.relayMessage(m.from, { conversation: `❌ No results found for "${query}" 😿` });
    }

    // Get MP3 download URL via API
    const apiUrl = `https://iamtkm.vercel.app/downloaders/ytmp3?apikey=tkm&url=${encodeURIComponent(video.url)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.status || !data.data?.url) {
      return await gss.relayMessage(m.from, { conversation: "❌ Failed to get MP3 download link. Please try again later." });
    }

    const mp3Url = data.data.url;
    const title = data.data.title;

    // Download MP3 file as buffer
    const mp3Response = await axios.get(mp3Url, { responseType: "arraybuffer" });
    const mp3Buffer = Buffer.from(mp3Response.data);

    // Send as audio (web mode: relayMessage with buffer and mimetype)
    await gss.relayMessage(m.from, {
      conversation: `🎵 *${title}*`,
      audio: mp3Buffer,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    });

  } catch (error) {
    console.error("Error in .play command:", error);
    await gss.relayMessage(m.from, {
      conversation: "❌ Oops! Something went wrong while fetching the song. Please try again later."
    });
  }
};

export default playMp3;
