const { getStatistics } = require("../../services/adminService");

// Statistika ko'rsatish
const showStatistics = async (bot, chatId, messageId) => {
  const stats = await getStatistics();

  const text = `
📊 *Statistika*

👥 *Foydalanuvchilar:*
├ Bugun: ${stats.today}
├ Hafta: ${stats.week}
├ Oy: ${stats.month}
├ Yil: ${stats.year}
└ Jami: ${stats.totalUsers}

🎬 *Kontent:*
├ Kinolar: ${stats.totalFilms} ta
├ Seriallar: ${stats.totalSerials} ta
└ Serial qismlari: ${stats.totalEpisodes} ta
`;

  const keyboard = {
    inline_keyboard: [[{ text: "🔙 Orqaga", callback_data: "admin_panel" }]],
  };

  await bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
};

module.exports = {
  showStatistics,
};
