import yts from "yt-search";
import fetch from "node-fetch";

const playMp3 = async (m, Matrix) => {
  const cmd = m.body.startsWith(".")
    ? m.body.slice(1).split(" ")[0].toLowerCase()
    : "";
  if (cmd !== "play") return;

  const query = m.body.split(" ").slice(1).join(" ");
  if (!query) {
    await Matrix.relayMessage(m.from, {
      conversation: "❌ Usage:\n.play <song name>\nExample: .play yatapita"
    });
    return;
  }

  await Matrix.relayMessage(m.from, {
    conversation: `🎵 Searching for *${query}*... Please wait ⏳`
  });

  try {
    // Search YT with timeout
    const search = await Promise.race([
      yts(query),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("YTS_TIMEOUT")), 60000)
      )
    ]);

    const video = search.videos[0];
    if (!video) {
      await Matrix.relayMessage(m.from, { conversation: `❌ No results found for "${query}".` });
      return;
    }

    // Get MP3 download URL
    const apiUrl = `https://iamtkm.vercel.app/downloaders/ytmp3?apikey=tkm&url=${encodeURIComponent(video.url)}`;
    const apiRes = await fetch(apiUrl);
    const apiData = await apiRes.json();

    if (!apiData.status || !apiData.data?.url) {
      await Matrix.relayMessage(m.from, { conversation: "❌ Failed to generate MP3." });
      return;
    }

    const mp3Url = apiData.data.url;
    const title = apiData.data.title || video.title;

    // Instead of fetching buffer, just send as URL (Baileys supports streaming from URL)
    await Matrix.relayMessage(m.from, {
      conversation: `🎶 *${title}*`,
    });

    await Matrix.relayMessage(m.from, {
      audio: { url: mp3Url },  // <— send URL directly
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      ptt: false // set true for voice note style
    });

  } catch (err) {
    console.error("PLAY CMD ERROR:", err);
    const msg = err.message === "YTS_TIMEOUT"
      ? "⏳ Search took too long. Try again."
      : "❌ Error occurred while processing the song.";
    await Matrix.relayMessage(m.from, { conversation: msg });
  }
};

export default playMp3;
