const channelRepository = require("../../database/channelRepository");

// Kanallar paneli
const showChannelPanel = async (bot, chatId, messageId) => {
  const channels = await channelRepository.getAllChannels();

  let text = "📢 Majburiy Kanallar\n\n━━━━━━━━━━━━━━━━━━━\n";

  if (channels.length === 0) {
    text += "❌ Hozircha majburiy kanallar yo'q.\n";
  } else {
    text += "📋 Ro'yxat:\n\n";
    channels.forEach((channel, index) => {
      text += `${index + 1}. ${channel.name}\n   (@${channel.username})\n\n`;
    });
  }

  text += "━━━━━━━━━━━━━━━━━━━\n\n";
  text += "💡 Qo'shish: /qkanal @username\n";
  text += "💡 O'chirish: /delkanal @username";

  const keyboard = {
    inline_keyboard: [[{ text: "🔙 Orqaga", callback_data: "admin_panel" }]],
  };

  await bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: keyboard,
  });
};

module.exports = {
  showChannelPanel,
};
