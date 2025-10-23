const contentRepository = require("../../database/contentRepository");
const { CHANNEL_ID } = require("../../config/env");

// Temporary storage for admin sessions
const adminSessions = new Map();

// Film panel
const showFilmPanel = async (bot, chatId, messageId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "➕ Kino qo'shish", callback_data: "film_add" }],
      [
        { text: "🗑 Kino o'chirish", callback_data: "film_delete" },
        { text: "🔄 Code o'zgartirish", callback_data: "film_edit_code" }
      ],
      [{ text: "� Kinolar ro'yxati", callback_data: "film_list" }],
      [{ text: "�🔙 Orqaga", callback_data: "admin_panel" }],
    ],
  };

  const text = 
    "🎬 *Kino Boshqaruvi*\n\n" +
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

// Kino qo'shish jarayoni boshlash
const startAddFilm = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "add_film", step: "waiting_code" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "film_panel" }],
    ],
  };

  await bot.editMessageText(
    "📝 *Kino qo'shish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "🔢 Kino uchun code kiriting\n\n" +
    "📝 *Misol:* `1001`\n" +
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

// Kino code qabul qilish
const handleFilmCode = async (bot, chatId, code) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_film" || session.step !== "waiting_code") {
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

  // Sessionga code ni saqlash
  session.code = parseInt(code);
  session.step = "waiting_video";
  adminSessions.set(chatId, session);

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "film_panel" }],
    ],
  };

  bot.sendMessage(
    chatId,
    "🎥 *Kino videosini yuklang*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "📢 Videoni yuboring\n\n" +
    "💬 *Izoh:* Video bilan birgalikda\n" +
    "caption (ma'lumot) ham yuborsangiz bo'ladi\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n\n" +
    "💡 Yoki /cancel yozing",
    { 
      parse_mode: "Markdown",
      reply_markup: keyboard
    }
  );

  return true;
};

// Video qabul qilish va saqlash
const handleFilmVideo = async (bot, msg) => {
  const chatId = msg.chat.id;
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "add_film" || session.step !== "waiting_video") {
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

    // Video caption ni olish (msg.caption yoki msg.video.caption)
    const videoCaption = msg.caption || null;

    // Content yaratish (caption ni description sifatida saqlaymiz)
    await contentRepository.createContent(
      session.code,
      "film",
      videoCaption // Video caption ni content description ga saqlaymiz
    );

    // Video item qo'shish
    await contentRepository.addContentItem(
      session.code,
      1, // Film uchun episode number har doim 1
      forwardedMsg.message_id.toString(), // Forward qilingan message ID
      forwardedMsg.video.file_id, // Forward qilingan video file_id
      videoCaption
    );

    const successMsg = `✅ *Kino muvaffaqiyatli qo'shildi!*\n\n🔢 Code: \`${session.code}\`\n🎬 Turi: Kino${videoCaption ? '\n💬 Caption: Mavjud' : ''}`;
    
    bot.sendMessage(chatId, successMsg, { parse_mode: "Markdown" });

    // Sessionni tozalash
    adminSessions.delete(chatId);
    return true;

  } catch (error) {
    console.error("Kino qo'shishda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Qayta urinib ko'ring!");
    adminSessions.delete(chatId);
    return true;
  }
};

// Kino o'chirish
const startDeleteFilm = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "delete_film" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "film_panel" }],
    ],
  };

  await bot.editMessageText(
    "🗑 *Kino o'chirish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "O'chirmoqchi bo'lgan kino\n" +
    "kodini kiriting:\n\n" +
    "📝 *Misol:* `1001`\n" +
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

const handleDeleteFilm = async (bot, chatId, code) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "delete_film") {
    return false;
  }

  const content = await contentRepository.getContentByCode(parseInt(code));
  
  if (!content) {
    bot.sendMessage(chatId, "❌ Bunday kodli kino topilmadi!");
    return true;
  }

  if (content.type !== "film") {
    bot.sendMessage(chatId, "❌ Bu code serial uchun! Film emas!");
    return true;
  }

  await contentRepository.deleteContent(parseInt(code));

  bot.sendMessage(
    chatId,
    `✅ *Kino o'chirildi!*\n\nCode: \`${code}\``,
    { parse_mode: "Markdown" }
  );

  adminSessions.delete(chatId);
  return true;
};

// Code o'zgartirish
const startEditFilmCode = async (bot, chatId, messageId) => {
  adminSessions.set(chatId, { action: "edit_film_code", step: "waiting_old_code" });

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "film_panel" }],
    ],
  };

  await bot.editMessageText(
    "🔄 *Kino code ni o'zgartirish*\n\n" +
    "━━━━━━━━━━━━━━━━━━━\n" +
    "Eski (hozirgi) code ni kiriting:\n\n" +
    "📝 *Misol:* `1001`\n" +
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

const handleEditFilmCode = async (bot, chatId, text) => {
  const session = adminSessions.get(chatId);
  
  if (!session || session.action !== "edit_film_code") {
    return false;
  }

  if (session.step === "waiting_old_code") {
    const oldCode = parseInt(text);
    const content = await contentRepository.getContentByCode(oldCode);
    
    if (!content) {
      bot.sendMessage(chatId, "❌ Bunday kodli kino topilmadi!");
      return true;
    }

    if (content.type !== "film") {
      bot.sendMessage(chatId, "❌ Bu code serial uchun! Film emas!");
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

// Kinolar ro'yxatini ko'rsatish
const showFilmsList = async (bot, chatId, messageId, page = 1) => {
  try {
    const films = await contentRepository.getContentsByType("film");
    
    if (films.length === 0) {
      await bot.editMessageText(
        "📋 *Kinolar ro'yxati*\n\n" +
        "━━━━━━━━━━━━━━━━━━━\n" +
        "❌ Hozircha kinolar yo'q!\n" +
        "━━━━━━━━━━━━━━━━━━━",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔙 Orqaga", callback_data: "film_panel" }]
            ]
          }
        }
      );
      return;
    }

    // Pagination
    const perPage = 10;
    const totalPages = Math.ceil(films.length / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const currentFilms = films.slice(startIndex, endIndex);

    let text = "📋 *Kinolar ro'yxati*\n\n━━━━━━━━━━━━━━━━━━━\n";
    
    for (const film of currentFilms) {
      const descPreview = film.description 
        ? (film.description.substring(0, 50) + (film.description.length > 50 ? '...' : ''))
        : 'Tavsif yo\'q';
      text += `🎬 Code: \`${film.code}\`\n`;
      text += `📝 ${descPreview}\n`;
      text += `📅 ${new Date(film.createdAt).toLocaleDateString('uz-UZ')}\n`;
      text += `━━━━━━━━━━━━━━━━━━━\n`;
    }

    text += `\n📊 Sahifa: ${page}/${totalPages}\n`;
    text += `📈 Jami: ${films.length} ta kino`;

    // Pagination tugmalari
    const keyboard = [];
    const navButtons = [];
    
    if (page > 1) {
      navButtons.push({ text: "◀️ Orqaga", callback_data: `film_list_page_${page - 1}` });
    }
    
    navButtons.push({ text: `📄 ${page}/${totalPages}`, callback_data: "noop" });
    
    if (page < totalPages) {
      navButtons.push({ text: "Keyingi ▶️", callback_data: `film_list_page_${page + 1}` });
    }
    
    if (navButtons.length > 0) {
      keyboard.push(navButtons);
    }
    
    keyboard.push([{ text: "🔙 Orqaga", callback_data: "film_panel" }]);

    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    console.error("Kinolar ro'yxatini ko'rsatishda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
  }
};

module.exports = {
  showFilmPanel,
  startAddFilm,
  handleFilmCode,
  handleFilmVideo,
  startDeleteFilm,
  handleDeleteFilm,
  startEditFilmCode,
  handleEditFilmCode,
  showFilmsList,
  adminSessions, // Export qilamiz boshqa callback handler da ishlatish uchun
};
