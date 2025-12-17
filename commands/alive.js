import config from "../config.cjs";

const alive = async (m, Matrix) => {
  const uptime = process.uptime();
  const d = Math.floor(uptime / 86400);
  const h = Math.floor((uptime % 86400) / 3600);
  const mnt = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";

  if (["alive", "uptime", "runtime"].includes(cmd)) {
    const text = `
*JOEL XMD IS ONLINE*
╭❐
┇ ${d} Day(s)
┇ ${h} Hour(s)
┇ ${mnt} Minute(s)
┇ ${s} Second(s)
╰❑
`;
    Matrix.relayMessage(m.from, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text }
          }
        }
      }
    });
  }
};

export default alive;