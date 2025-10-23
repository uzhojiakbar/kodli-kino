const { broadcastMessage } = require("../../services/adminService");

// Broadcast sessionlar
const broadcastSessions = new Map();

// Broadcast panel
const showBroadcastPanel = async (bot, chatId, messageId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "📤 Oddiy xabar", callback_data: "broadcast_normal" }],
      [{ text: "↗️ Forward xabar", callback_data: "broadcast_forward" }],
      [{ text: "🔙 Orqaga", callback_data: "admin_panel" }],
    ],
  };

  const text = 
    "✉️ *Ommaviy Xabar Yuborish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Xabar turini tanlang:\n\n" +
    "📤 *Oddiy:* Matn, rasm, video\n" +
    "↗️ *Forward:* Xabarni forward\n" +
    "━━━━━━━━━━━━━━━━━━━";

  await bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
};

// Oddiy xabar yuborish
const startBroadcastNormal = async (bot, chatId, messageId) => {
  broadcastSessions.set(chatId, { type: "normal" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "broadcast" }],
    ],
  };

  await bot.editMessageText(
    "📝 *Oddiy xabar*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Yubormoqchi bo'lgan xabaringizni\n" +
    "yuboring:\n\n" +
    "✅ Matn\n" +
    "✅ Rasm\n" +
    "✅ Video\n" +
    "✅ Audio\n" +
    "✅ Document\n" +
    "━━━━━━━━━━━━━━━━━━━\n\n" +
    "💡 Yoki /cancel yozing",
    {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
};

// Forward xabar yuborish
const startBroadcastForward = async (bot, chatId, messageId) => {
  broadcastSessions.set(chatId, { type: "forward" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "broadcast" }],
    ],
  };

  await bot.editMessageText(
    "↗️ *Forward xabar*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Forward qilmoqchi bo'lgan\n" +
    "xabarni menga yuboring.\n" +
    "━━━━━━━━━━━━━━━━━━━\n\n" +
    "💡 Yoki /cancel yozing",
    {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
};

// Broadcast xabarni qabul qilish va yuborish
const handleBroadcastMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const session = broadcastSessions.get(chatId);

  if (!session) {
    return false;
  }

  try {
    const statusMsg = await bot.sendMessage(
      chatId,
      "⏳ Xabar yuborilmoqda...\n\nIltimos, kuting!"
    );

    const result = await broadcastMessage(bot, msg, session.type);

    await bot.editMessageText(
      `✅ *Xabar yuborish yakunlandi!*\n\n` +
        `📤 Yuborildi: ${result.successCount}\n` +
        `❌ Xatolik: ${result.failCount}\n` +
        `👥 Jami: ${result.total}`,
      {
        chat_id: chatId,
        message_id: statusMsg.message_id,
        parse_mode: "Markdown",
      }
    );

    broadcastSessions.delete(chatId);
    return true;
  } catch (error) {
    console.error("Broadcast xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
    broadcastSessions.delete(chatId);
    return true;
  }
};

// Broadcast bekor qilish
const cancelBroadcast = async (bot, chatId, messageId) => {
  broadcastSessions.delete(chatId);

  await bot.editMessageText("❌ Xabar yuborish bekor qilindi!", {
    chat_id: chatId,
    message_id: messageId,
  });
};

module.exports = {
  showBroadcastPanel,
  startBroadcastNormal,
  startBroadcastForward,
  handleBroadcastMessage,
  cancelBroadcast,
  broadcastSessions,
};
