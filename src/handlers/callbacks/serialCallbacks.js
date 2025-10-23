const contentRepository = require("../../database/contentRepository");
const { CHANNEL_ID } = require("../../config/env");

// Temporary storage for admin sessions
const adminSessions = new Map();

// Serial panel
const showSerialPanel = async (bot, chatId, messageId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "➕ Serial qo'shish", callback_data: "serial_add" }],
      [
        { text: "🗑 Serial o'chirish", callback_data: "serial_delete" },
        { text: "🔄 Code o'zgartirish", callback_data: "serial_edit_code" }
      ],
      [
        { text: "➕ Qism qo'shish", callback_data: "serial_add_episode" },
        { text: "🗑 Qism o'chirish", callback_data: "serial_delete_episode" }
      ],
      [{ text: "� Seriallar ro'yxati", callback_data: "serial_list" }],
      [{ text: "�🔙 Orqaga", callback_data: "admin_panel" }],
    ],
  };

  const text = 
    "📺 *Serial Boshqaruvi*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Kerakli funksiyani tanlang:\n" +
    "━━━━━━━━━━━━━━━━━━━";

  await bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "Markdown",
    reply_markup: keyboard,
  });
};

// Serial qo'shish - SUPER SIMPLE!
const startAddSerial = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "add_serial", step: "waiting_code" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "serial_panel" }],
    ],
  };

  await bot.editMessageText(
    "📝 *Serial qo'shish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "🔢 Serial uchun code kiriting\n\n" +
    "📝 *Misol:* `2001`\n" +
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

// Serial code qabul qilish
const handleSerialCode = async (bot, chatId, code) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_serial" || session.step !== "waiting_code") {
    return false;
  }

  // Code ni tekshirish
  if (isNaN(code)) {
    bot.sendMessage(chatId, "❌ Code faqat raqam bo'lishi kerak!");
    return true;
  }

  // Code mavjudligini tekshirish
  const exists = await contentRepository.checkCodeExists(code);
  if (exists) {
    bot.sendMessage(
      chatId,
      `❌ Bu code allaqachon band!\n\nCode: ${code}\nTuri: ${exists.type === 'film' ? '🎬 Kino' : '📺 Serial'}`
    );
    return true;
  }

  // Content yaratish
  try {
    await contentRepository.createContent(
      parseInt(code),
      "serial",
      null // Description yo'q
    );

    session.code = parseInt(code);
    session.step = "waiting_episodes";
    session.episodeNumber = 1;
    session.episodes = [];
    adminSessions.set(chatId, session);

    const keyboard = {
      inline_keyboard: [
        [{ text: "💾 Saqlash", callback_data: "serial_save" }],
        [{ text: "❌ Bekor qilish", callback_data: "serial_cancel" }],
      ],
    };

    bot.sendMessage(
      chatId,
      "✅ *Serial yaratildi!*\n\n" +
      "━━━━━━━━━━━━━━━━━━━\n" +
      `🔢 Code: \`${session.code}\`\n` +
      "📺 Turi: Serial\n\n" +
      "━━━━━━━━━━━━━━━━━━━\n\n" +
      "🎥 *Qismlarni yuklash:*\n" +
      "1️⃣ Videolarni ketma-ket yuboring\n" +
      "2️⃣ Har bir qism avtomatik sanaladi\n" +
      "3️⃣ Saqlash tugmasini bosing\n\n" +
      "💬 *Izoh:* Video bilan caption ham\n" +
      "yuborishingiz mumkin\n\n" +
      "💡 Yoki /cancel yozing",
      { parse_mode: "Markdown", reply_markup: keyboard }
    );

    return true;

  } catch (error) {
    console.error("Serial yaratishda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Qayta urinib ko'ring!");
    adminSessions.delete(chatId);
    return true;
  }
};

// Description qabul qilish
const handleSerialDescription = async (bot, chatId, description) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_serial" || session.step !== "waiting_description") {
    return false;
  }

  // Skip bo'lsa
  if (description === "/skip") {
    session.description = null;
  } else {
    session.description = description;
  }

  // Content yaratish
  try {
    await contentRepository.createContent(
      session.code,
      "serial",
      session.description
    );

    session.step = "waiting_episodes";
    session.episodeNumber = 1;
    session.episodes = [];
    adminSessions.set(chatId, session);

    const keyboard = {
      inline_keyboard: [
        [{ text: "💾 Saqlash", callback_data: "serial_save" }],
        [{ text: "❌ Bekor qilish", callback_data: "serial_cancel" }],
      ],
    };

    bot.sendMessage(
      chatId,
      "✅ *Serial yaratildi!*\n\n" +
      "━━━━━━━━━━━━━━━━━━━\n" +
      `🔢 Code: \`${session.code}\`\n` +
      "📺 Turi: Serial\n\n" +
      "━━━━━━━━━━━━━━━━━━━\n\n" +
      "🎥 *Qismlarni yuklash:*\n" +
      "1️⃣ Videolarni ketma-ket yuboring\n" +
      "2️⃣ Har bir qism avtomatik sanaladi\n" +
      "3️⃣ Saqlash tugmasini bosing\n\n" +
      "💡 Yoki /cancel yozing",
      { parse_mode: "Markdown", reply_markup: keyboard }
    );

    return true;

  } catch (error) {
    console.error("Serial yaratishda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Qayta urinib ko'ring!");
    adminSessions.delete(chatId);
    return true;
  }
};

// Serial qismlarini qabul qilish - BATCH UPLOAD!
const handleSerialEpisode = async (bot, msg) => {
  const chatId = msg.chat.id;
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_serial" || session.step !== "waiting_episodes") {
    return false;
  }

  if (!msg.video) {
    bot.sendMessage(chatId, "❌ Iltimos, video yuboring!");
    return true;
  }

  try {
    // Videoni CHANNEL_ID ga forward qilish
    const forwardedMsg = await bot.forwardMessage(
      CHANNEL_ID,
      chatId,
      msg.message_id
    );

    // Video caption ni olish
    const videoCaption = msg.caption || null;

    // Qismni qo'shish
    const result = await contentRepository.addContentItem(
      session.code,
      session.episodeNumber,
      forwardedMsg.message_id.toString(), // Forward qilingan message ID
      forwardedMsg.video.file_id, // Forward qilingan video file_id
      videoCaption
    );

    session.episodes.push(result);
    session.episodeNumber++;
    adminSessions.set(chatId, session);

    const keyboard = {
      inline_keyboard: [
        [{ text: "💾 Saqlash", callback_data: "serial_save" }],
        [{ text: "❌ Bekor qilish", callback_data: "serial_cancel" }],
      ],
    };

      let message = `✅ *${session.episodeNumber - 1}-qism yuklandi!*\n\n` +
        "━━━━━━━━━━━━━━━━━━━\n" +
        `📊 Jami qismlar: ${session.episodes.length} ta\n` +
        `🔢 Code: \`${session.code}\`\n`;
      
      if (videoCaption) {
        message += `💬 Caption: Mavjud\n`;
      }
      
      message += "\n━━━━━━━━━━━━━━━━━━━\n\n" +
        "🎥 Yana qism yuboring yoki\n" +
        "💾 Saqlash tugmasini bosing\n\n" +
        "💡 Yoki /cancel yozing";

      bot.sendMessage(chatId, message, { parse_mode: "Markdown", reply_markup: keyboard });    return true;

  } catch (error) {
    console.error("Qism yuklashda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Qayta urinib ko'ring!");
    return true;
  }
};

// Serialni saqlash
const saveSerial = async (bot, chatId, messageId) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_serial") {
    return;
  }

  if (session.episodes.length === 0) {
    await bot.editMessageText(
      "❌ Kamida bitta qism yuklang!",
      {
        chat_id: chatId,
        message_id: messageId,
      }
    );
    return;
  }

  const successMsg = `✅ *Serial muvaffaqiyatli saqlandi!*\n\n🔢 Code: \`${session.code}\`\n📺 Turi: Serial\n📊 Qismlar: ${session.episodes.length} ta${session.description ? '\n📝 Ma\'lumot: Mavjud' : ''}`;

  await bot.editMessageText(successMsg, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "Markdown",
  });

  adminSessions.delete(chatId);
};

// Serialni bekor qilish
const cancelSerial = async (bot, chatId, messageId) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_serial") {
    return;
  }

  // Yaratilgan contentni o'chirish
  await contentRepository.deleteContent(session.code);

  await bot.editMessageText(
    "❌ Serial qo'shish bekor qilindi va o'chirildi!",
    {
      chat_id: chatId,
      message_id: messageId,
    }
  );

  adminSessions.delete(chatId);
};

// Serial o'chirish
const startDeleteSerial = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "delete_serial" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "serial_panel" }],
    ],
  };

  await bot.editMessageText(
    "🗑 *Serial o'chirish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "O'chirmoqchi bo'lgan serial\n" +
    "kodini kiriting:\n\n" +
    "📝 *Misol:* `2001`\n" +
    "━━━━━━━━━━━━━━━━━━━\n\n" +
    "⚠️ Barcha qismlar ham o'chadi!\n\n" +
    "💡 Yoki /cancel yozing",
    {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: keyboard,
    }
  );
};

const handleDeleteSerial = async (bot, chatId, code) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "delete_serial") {
    return false;
  }

  const content = await contentRepository.getContentByCode(parseInt(code));
  
  if (!content) {
    bot.sendMessage(chatId, "❌ Bunday kodli serial topilmadi!");
    return true;
  }

  if (content.type !== "serial") {
    bot.sendMessage(chatId, "❌ Bu code kino uchun! Serial emas!");
    return true;
  }

  const episodesCount = await contentRepository.getContentItemsCount(parseInt(code));

  await contentRepository.deleteContent(parseInt(code));

  bot.sendMessage(
    chatId,
    `✅ *Serial o'chirildi!*\n\nCode: \`${code}\`\nQismlar: ${episodesCount} ta`,
    { parse_mode: "Markdown" }
  );

  adminSessions.delete(chatId);
  return true;
};

// Code o'zgartirish
const startEditSerialCode = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "edit_serial_code", step: "waiting_old_code" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "serial_panel" }],
    ],
  };

  await bot.editMessageText(
    "🔄 *Serial code ni o'zgartirish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Eski (hozirgi) code ni kiriting:\n\n" +
    "📝 *Misol:* `2001`\n" +
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

const handleEditSerialCode = async (bot, chatId, text) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "edit_serial_code") {
    return false;
  }

  if (session.step === "waiting_old_code") {
    const oldCode = parseInt(text);
    const content = await contentRepository.getContentByCode(oldCode);
    
    if (!content) {
      bot.sendMessage(chatId, "❌ Bunday kodli serial topilmadi!");
      return true;
    }

    if (content.type !== "serial") {
      bot.sendMessage(chatId, "❌ Bu code kino uchun! Serial emas!");
      return true;
    }

    session.oldCode = oldCode;
    session.step = "waiting_new_code";
    adminSessions.set(chatId, session);

    bot.sendMessage(chatId, "📝 Endi yangi code ni kiriting:");
    return true;
  }

  if (session.step === "waiting_new_code") {
    const newCode = parseInt(text);
    
    // Yangi code mavjudligini tekshirish
    const exists = await contentRepository.checkCodeExists(newCode);
    if (exists) {
      bot.sendMessage(
        chatId,
        `❌ Bu code allaqachon band!\n\nCode: ${newCode}\nTuri: ${exists.type === 'film' ? '🎬 Kino' : '📺 Serial'}`
      );
      return true;
    }

    await contentRepository.updateContentCode(session.oldCode, newCode);

    bot.sendMessage(
      chatId,
      `✅ *Code o'zgartirildi!*\n\nEski code: \`${session.oldCode}\`\nYangi code: \`${newCode}\``,
      { parse_mode: "Markdown" }
    );

    adminSessions.delete(chatId);
    return true;
  }

  return false;
};

// Mavjud serialga qism qo'shish
const startAddEpisode = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "add_episode", step: "waiting_code" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "serial_panel" }],
    ],
  };

  await bot.editMessageText(
    "➕ *Serialga qism qo'shish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Serial kodini kiriting:\n\n" +
    "📝 *Misol:* `2001`\n" +
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

const handleAddEpisode = async (bot, chatId, text, msg) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_episode") {
    return false;
  }

  // Code kutilayapti
  if (session.step === "waiting_code") {
    const code = parseInt(text);
    const content = await contentRepository.getContentByCode(code);
    
    if (!content) {
      bot.sendMessage(chatId, "❌ Bunday kodli serial topilmadi!");
      return true;
    }

    if (content.type !== "serial") {
      bot.sendMessage(chatId, "❌ Bu code kino uchun! Serial emas!");
      return true;
    }

    // Mavjud qismlar sonini olish
    const episodesCount = await contentRepository.getContentItemsCount(code);

    session.code = code;
    session.episodeNumber = episodesCount + 1;
    session.step = "waiting_video";
    adminSessions.set(chatId, session);

    const keyboard = {
      inline_keyboard: [
        [{ text: "✅ Tugatish", callback_data: "serial_finish_add_episode" }],
        [{ text: "❌ Bekor qilish", callback_data: "serial_panel" }],
      ],
    };

    bot.sendMessage(
      chatId,
      "✅ *Serial topildi!*\n\n" +
      "━━━━━━━━━━━━━━━━━━━\n" +
      `🔢 Code: \`${code}\`\n` +
      `📊 Mavjud qismlar: ${episodesCount} ta\n` +
      `➕ Keyingi qism: ${session.episodeNumber}\n\n` +
      "━━━━━━━━━━━━━━━━━━━\n\n" +
      "🎥 Videolarni ketma-ket yuboring\n" +
      "✅ Tugatgach, 'Tugatish' bosing\n\n" +
      "💡 Yoki /cancel yozing",
      { parse_mode: "Markdown", reply_markup: keyboard }
    );

    return true;
  }

  // Video kutilayapti
  if (session.step === "waiting_video" && msg && msg.video) {
    try {
      // Videoni CHANNEL_ID ga forward qilish
      const forwardedMsg = await bot.forwardMessage(
        CHANNEL_ID,
        chatId,
        msg.message_id
      );

      const videoCaption = msg.caption || null;

      await contentRepository.addContentItem(
        session.code,
        session.episodeNumber,
        forwardedMsg.message_id.toString(), // Forward qilingan message ID
        forwardedMsg.video.file_id, // Forward qilingan video file_id
        videoCaption
      );

      session.episodeNumber++;
      adminSessions.set(chatId, session);

      const keyboard = {
        inline_keyboard: [
          [{ text: "✅ Tugatish", callback_data: "serial_finish_add_episode" }],
          [{ text: "❌ Bekor qilish", callback_data: "serial_panel" }],
        ],
      };

      let message = `✅ *${session.episodeNumber - 1}-qism yuklandi!*\n\n` +
        "━━━━━━━━━━━━━━━━━━━\n" +
        `🔢 Code: \`${session.code}\`\n`;
      
      if (videoCaption) {
        message += `💬 Caption: Mavjud\n`;
      }
      
      message += "\n━━━━━━━━━━━━━━━━━━━\n\n" +
        "🎥 Yana qism yuboring yoki\n" +
        "✅ Tugatish tugmasini bosing\n\n" +
        "💡 Yoki /cancel yozing";

      bot.sendMessage(chatId, message, { parse_mode: "Markdown", reply_markup: keyboard });

      return true;
    } catch (error) {
      console.error("Qism yuklashda xatolik:", error);
      bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Qayta urinib ko'ring!");
      return true;
    }
  }

  return false;
};

const finishAddEpisode = async (bot, chatId, messageId) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_episode") {
    return;
  }

  const totalEpisodes = await contentRepository.getContentItemsCount(session.code);

  await bot.editMessageText(
    `✅ *Qismlar muvaffaqiyatli qo'shildi!*\n\n` +
    `🔢 Code: \`${session.code}\`\n` +
    `📊 Jami qismlar: ${totalEpisodes} ta`,
    {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
    }
  );

  adminSessions.delete(chatId);
};

// Serialdan qism o'chirish
const startDeleteEpisode = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "delete_episode", step: "waiting_code" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "serial_panel" }],
    ],
  };

  await bot.editMessageText(
    "🗑 *Serialdan qism o'chirish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Serial kodini kiriting:\n\n" +
    "📝 *Misol:* `2001`\n" +
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

const handleDeleteEpisode = async (bot, chatId, text) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "delete_episode") {
    return false;
  }

  // Code kutilayapti
  if (session.step === "waiting_code") {
    const code = parseInt(text);
    const content = await contentRepository.getContentByCode(code);
    
    if (!content) {
      bot.sendMessage(chatId, "❌ Bunday kodli serial topilmadi!");
      return true;
    }

    if (content.type !== "serial") {
      bot.sendMessage(chatId, "❌ Bu code kino uchun! Serial emas!");
      return true;
    }

    const episodesCount = await contentRepository.getContentItemsCount(code);
    if (episodesCount === 0) {
      bot.sendMessage(chatId, "❌ Bu serialda qismlar yo'q!");
      return true;
    }

    session.code = code;
    session.step = "waiting_episode_number";
    adminSessions.set(chatId, session);

    bot.sendMessage(
      chatId,
      "✅ *Serial topildi!*\n\n" +
      "━━━━━━━━━━━━━━━━━━━\n" +
      `🔢 Code: \`${code}\`\n` +
      `📊 Jami qismlar: ${episodesCount} ta\n\n` +
      "━━━━━━━━━━━━━━━━━━━\n\n" +
      "🗑 O'chirmoqchi bo'lgan qism\n" +
      "raqamini kiriting:\n\n" +
      "📝 *Misol:* `5`\n\n" +
      "💡 Yoki /cancel yozing",
      { parse_mode: "Markdown" }
    );

    return true;
  }

  // Episode number kutilayapti
  if (session.step === "waiting_episode_number") {
    const episodeNumber = parseInt(text);
    
    if (isNaN(episodeNumber)) {
      bot.sendMessage(chatId, "❌ Qism raqami faqat son bo'lishi kerak!");
      return true;
    }

    try {
      const result = await contentRepository.deleteContentItemByEpisode(session.code, episodeNumber);
      
      if (result.changes === 0) {
        bot.sendMessage(chatId, `❌ ${episodeNumber}-qism topilmadi!`);
        return true;
      }

      const remainingEpisodes = await contentRepository.getContentItemsCount(session.code);

      bot.sendMessage(
        chatId,
        `✅ *Qism o'chirildi!*\n\n` +
        `🔢 Code: \`${session.code}\`\n` +
        `🗑 O'chirildi: ${episodeNumber}-qism\n` +
        `📊 Qolgan qismlar: ${remainingEpisodes} ta`,
        { parse_mode: "Markdown" }
      );

      adminSessions.delete(chatId);
      return true;

    } catch (error) {
      console.error("Qism o'chirishda xatolik:", error);
      bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Qayta urinib ko'ring!");
      adminSessions.delete(chatId);
      return true;
    }
  }

  return false;
};

// Seriallar ro'yxatini ko'rsatish
const showSerialsList = async (bot, chatId, messageId, page = 1) => {
  try {
    const serials = await contentRepository.getContentsByType("serial");
    
    if (serials.length === 0) {
      await bot.editMessageText(
        "📋 *Seriallar ro'yxati*\n\n" +
        "━━━━━━━━━━━━━━━━━━━\n" +
        "❌ Hozircha seriallar yo'q!\n" +
        "━━━━━━━━━━━━━━━━━━━",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔙 Orqaga", callback_data: "serial_panel" }]
            ]
          }
        }
      );
      return;
    }

    // Pagination
    const perPage = 10;
    const totalPages = Math.ceil(serials.length / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const currentSerials = serials.slice(startIndex, endIndex);

    let text = "📋 *Seriallar ro'yxati*\n\n━━━━━━━━━━━━━━━━━━━\n";
    
    for (const serial of currentSerials) {
      const episodesCount = await contentRepository.getContentItemsCount(serial.code);
      const descPreview = serial.description 
        ? (serial.description.substring(0, 50) + (serial.description.length > 50 ? '...' : ''))
        : 'Tavsif yo\'q';
      text += `📺 Code: \`${serial.code}\`\n`;
      text += `📝 ${descPreview}\n`;
      text += `📊 Qismlar: ${episodesCount} ta\n`;
      text += `📅 ${new Date(serial.createdAt).toLocaleDateString('uz-UZ')}\n`;
      text += `━━━━━━━━━━━━━━━━━━━\n`;
    }

    text += `\n📊 Sahifa: ${page}/${totalPages}\n`;
    text += `📈 Jami: ${serials.length} ta serial`;

    // Pagination tugmalari
    const keyboard = [];
    const navButtons = [];
    
    if (page > 1) {
      navButtons.push({ text: "◀️ Orqaga", callback_data: `serial_list_page_${page - 1}` });
    }
    
    navButtons.push({ text: `📄 ${page}/${totalPages}`, callback_data: "noop" });
    
    if (page < totalPages) {
      navButtons.push({ text: "Keyingi ▶️", callback_data: `serial_list_page_${page + 1}` });
    }
    
    if (navButtons.length > 0) {
      keyboard.push(navButtons);
    }
    
    keyboard.push([{ text: "🔙 Orqaga", callback_data: "serial_panel" }]);

    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    console.error("Seriallar ro'yxatini ko'rsatishda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
  }
};

module.exports = {
  showSerialPanel,
  startAddSerial,
  handleSerialCode,
  handleSerialEpisode,
  saveSerial,
  cancelSerial,
  startDeleteSerial,
  handleDeleteSerial,
  startEditSerialCode,
  handleEditSerialCode,
  startAddEpisode,
  handleAddEpisode,
  finishAddEpisode,
  startDeleteEpisode,
  handleDeleteEpisode,
  showSerialsList,
  adminSessions,
};
