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
      conversation: "❌ Usage:\n.play <song name>\n\nExample:\n.play yatapita"
    });
    return;
  }

  // Feedback: searching
  await Matrix.relayMessage(m.from, {
    conversation: `🎵 Searching for *${query}*...\nPlease wait ⏳`
  });

  try {
    // YT search with 1-minute timeout
    const search = await Promise.race([
      yts(query),
      new Promise((_, reject) => setTimeout(() => reject(new Error("YTS_TIMEOUT")), 60000))
    ]);

    const video = search.videos[0];
    if (!video) {
      await Matrix.relayMessage(m.from, {
        conversation: `❌ No results found for "${query}".`
      });
      return;
    }

    // MP3 Download API
    const apiUrl = `https://iamtkm.vercel.app/downloaders/ytmp3?apikey=tkm&url=${encodeURIComponent(video.url)}`;
    const apiRes = await fetch(apiUrl);
    const apiData = await apiRes.json();

    if (!apiData.status || !apiData.data?.url) {
      await Matrix.relayMessage(m.from, {
        conversation: "❌ Failed to generate MP3. Try again later."
      });
      return;
    }

    const mp3Url = apiData.data.url;
    const title = apiData.data.title || video.title;

    // Fetch MP3 buffer
    const audioRes = await fetch(mp3Url);
    const arrayBuffer = await audioRes.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Send audio
    await Matrix.relayMessage(m.from, {
      conversation: `🎶 *${title}*`,
      audio: audioBuffer,
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`
    });

  } catch (err) {
    console.error("PLAY CMD ERROR:", err);
    const msg = err.message === "YTS_TIMEOUT"
      ? "⏳ Search took too long (over 1 min). Try again."
      : "❌ An error occurred while processing the song.";
    await Matrix.relayMessage(m.from, { conversation: msg });
  }
};

export default playMp3;
