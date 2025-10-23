const { countUsers, getAllUsers } = require("../database/userRepository");
const contentRepository = require("../database/contentRepository");

async function getStatistics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const startOfMonth = new Date();
  startOfMonth.setDate(1);

  const startOfYear = new Date();
  startOfYear.setMonth(0, 1);

  // Content statistikasini olish
  const allContents = await contentRepository.getAllContents();
  const films = allContents.filter(c => c.type === 'film');
  const serials = allContents.filter(c => c.type === 'serial');
  
  // Barcha serial qismlarini sanash
  let totalEpisodes = 0;
  for (const serial of serials) {
    const count = await contentRepository.getContentItemsCount(serial.code);
    totalEpisodes += count;
  }

  const [
    todayCount,
    weekCount,
    monthCount,
    yearCount,
    totalUsers,
  ] = await Promise.all([
    countUsers(today.toISOString()),
    countUsers(startOfWeek.toISOString()),
    countUsers(startOfMonth.toISOString()),
    countUsers(startOfYear.toISOString()),
    countUsers(),
  ]);

  return {
    today: todayCount,
    week: weekCount,
    month: monthCount,
    year: yearCount,
    totalUsers,
    totalFilms: films.length,
    totalSerials: serials.length,
    totalEpisodes,
  };
}

async function broadcastMessage(bot, message, type = "normal") {
  const users = await getAllUsers();
  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    try {
      const userId = user.userId;

      if (type === "normal") {
        // Media yoki oddiy xabarni aniqlash
        if (message.photo) {
          await bot.sendPhoto(userId, message.photo[0].file_id, {
            caption: message.caption || "",
            parse_mode: "HTML",
          });
        } else if (message.video) {
          await bot.sendVideo(userId, message.video.file_id, {
            caption: message.caption || "",
            parse_mode: "HTML",
          });
        } else if (message.audio) {
          await bot.sendAudio(userId, message.audio.file_id, {
            caption: message.caption || "",
            parse_mode: "HTML",
          });
        } else if (message.document) {
          await bot.sendDocument(userId, message.document.file_id, {
            caption: message.caption || "",
            parse_mode: "HTML",
          });
        } else {
          await bot.sendMessage(userId, message.text || "", {
            parse_mode: "HTML",
          });
        }
      } else if (type === "forward") {
        await bot.forwardMessage(userId, message.chat.id, message.message_id);
      }

      successCount++;
    } catch (error) {
      console.error(`Xatolik: ${user.userId} ga xabar yuborishda muammo!`);
      failCount++;
    }
  }

  return { successCount, failCount, total: users.length };
}

module.exports = {
  getStatistics,
  broadcastMessage,
};
