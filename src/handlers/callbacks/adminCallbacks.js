const adminRepository = require("../../database/adminRepository");

// Admin panel asosiy menyu
const showAdminPanel = async (bot, chatId, messageId) => {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🎬 Kino", callback_data: "film_panel" },
        { text: "📺 Serial", callback_data: "serial_panel" },
      ],
      [
        { text: "� Adminlar", callback_data: "admin_list" },
        { text: "📢 Kanallar", callback_data: "channel_panel" },
      ],
      [
        { text: "📊 Statistika", callback_data: "stats" },
        { text: "✉️ Habar", callback_data: "broadcast" },
      ],
    ],
  };

  const text = 
    "🛠️ *Admin Panel*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "👋 Xush kelibsiz!\n" +
    "Kerakli bo'limni tanlang:\n" +
    "━━━━━━━━━━━━━━━━━━━";

  if (messageId) {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  } else {
    await bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });
  }
};

// Adminlar ro'yxati
const showAdminList = async (bot, chatId, messageId) => {
  const admins = await adminRepository.getAllAdmins();

  let text = "👥 *Adminlar ro'yxati*\n\n━━━━━━━━━━━━━━━━━━━\n";

  if (admins.length === 0) {
    text += "❌ Hozircha adminlar yo'q.\n";
  } else {
    admins.forEach((admin, index) => {
      text += `${index + 1}. \`${admin.adminId}\`\n`;
    });
  }
  
  text += "\n━━━━━━━━━━━━━━━━━━━\n\n";
  text += "💡 *Qo'shish:* /addAdmin <ID>\n";
  text += "💡 *O'chirish:* /delAdmin <ID>";

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
  showAdminPanel,
  showAdminList,
};
