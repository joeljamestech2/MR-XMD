import config from "../config.cjs";

const ping = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (cmd === "ping") {
    Matrix.relayMessage(m.from, {
      conversation: "🏓 Pong! Joel XMD is alive."
    });
  }
};

export default ping;