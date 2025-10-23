const { addUser } = require("../database/userRepository");
const { isAdmin, addAdmin, deleteAdmin } = require("../database/adminRepository");
const { addChannel, deleteChannel } = require("../database/channelRepository");
const { subscribeCheck } = require("../middlewares/subscribeCheck");
const { sendContentByCode } = require("../services/contentService");
const {
  handleFilmCode,
  handleFilmVideo,
  handleDeleteFilm,
  handleEditFilmCode,
  adminSessions: filmSessions,
} = require("./callbacks/filmCallbacks");
const {
  handleSerialCode,
  handleSerialEpisode,
  handleDeleteSerial,
  handleEditSerialCode,
  handleAddEpisode,
  handleDeleteEpisode,
  adminSessions: serialSessions,
} = require("./callbacks/serialCallbacks");
const {
  handleBroadcastMessage,
  broadcastSessions,
} = require("./callbacks/broadcastCallbacks");

async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  // Foydalanuvchini bazaga qo'shish
  try {
    await addUser(chatId);
  } catch (error) {
    console.error("Foydalanuvchi qo'shishda xatolik:", error.message);
  }

  // Cancel commandini tekshirish - sessionlarni tozalash
  if (userInput === "/cancel" || userInput === "cancel" || userInput === "❌ Bekor qilish") {
    filmSessions.delete(chatId);
    serialSessions.delete(chatId);
    broadcastSessions.delete(chatId);
    
    bot.sendMessage(chatId, "❌ *Jarayon bekor qilindi!*", {
      parse_mode: "Markdown"
    });
    return;
  }

  // Obuna tekshirish
  const subscribed = await subscribeCheck(bot, chatId);
  if (!subscribed) {
    console.log("Foydalanuvchi obuna bo'lmagan");
    return;
  }

  // Admin tekshirish
  const adminStatus = await isAdmin(chatId);

  // Film session handlerlari
  if (filmSessions.has(chatId)) {
    const session = filmSessions.get(chatId);
    
    if (session.action === "add_film") {
      if (session.step === "waiting_code") {
        await handleFilmCode(bot, chatId, userInput);
        return;
      } else if (session.step === "waiting_video") {
        await handleFilmVideo(bot, msg);
        return;
      }
    } else if (session.action === "delete_film") {
      await handleDeleteFilm(bot, chatId, userInput);
      return;
    } else if (session.action === "edit_film_code") {
      await handleEditFilmCode(bot, chatId, userInput);
      return;
    }
  }

  // Serial session handlerlari
  if (serialSessions.has(chatId)) {
    const session = serialSessions.get(chatId);
    
    if (session.action === "add_serial") {
      if (session.step === "waiting_code") {
        await handleSerialCode(bot, chatId, userInput);
        return;
      } else if (session.step === "waiting_episodes") {
        await handleSerialEpisode(bot, msg);
        return;
      }
    } else if (session.action === "delete_serial") {
      await handleDeleteSerial(bot, chatId, userInput);
      return;
    } else if (session.action === "edit_serial_code") {
      await handleEditSerialCode(bot, chatId, userInput);
      return;
    } else if (session.action === "add_episode") {
      await handleAddEpisode(bot, chatId, userInput, msg);
      return;
    } else if (session.action === "delete_episode") {
      await handleDeleteEpisode(bot, chatId, userInput);
      return;
    }
  }

  // Broadcast session handlerlari
  if (broadcastSessions.has(chatId)) {
    await handleBroadcastMessage(bot, msg);
    return;
  }

  if (adminStatus) {
    // Admin qo'shish commandasi
    if (userInput && userInput.startsWith("/addAdmin ")) {
      const userId = userInput.replace("/addAdmin ", "").trim();
      
      if (!userId || !/^\d+$/.test(userId)) {
        bot.sendMessage(chatId, "❌ User ID xato!\n\nMisol: /addAdmin 123456789");
        return;
      }

      try {
        // Allaqachon admin ekanligini tekshirish
        const alreadyAdmin = await isAdmin(userId);
        if (alreadyAdmin) {
          bot.sendMessage(chatId, "⚠️ Bu foydalanuvchi allaqachon admin!");
          return;
        }

        await addAdmin(userId);
        bot.sendMessage(
          chatId,
          `✅ Admin qo'shildi!\n\n👤 User ID: \`${userId}\``,
          { parse_mode: "Markdown" }
        );
      } catch (error) {
        console.error("Admin qo'shishda xatolik:", error);
        if (error.message.includes("UNIQUE constraint failed")) {
          bot.sendMessage(chatId, "⚠️ Bu foydalanuvchi allaqachon admin!");
        } else {
          bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
        }
      }
      return;
    }

    // Admin o'chirish commandasi
    if (userInput && userInput.startsWith("/delAdmin ")) {
      const userId = userInput.replace("/delAdmin ", "").trim();
      
      if (!userId || !/^\d+$/.test(userId)) {
        bot.sendMessage(chatId, "❌ User ID xato!\n\nMisol: /delAdmin 123456789");
        return;
      }

      try {
        const result = await deleteAdmin(userId);
        if (result > 0) {
          bot.sendMessage(
            chatId,
            `✅ Admin o'chirildi!\n\n👤 User ID: \`${userId}\``,
            { parse_mode: "Markdown" }
          );
        } else {
          bot.sendMessage(chatId, "❌ Bunday admin topilmadi!");
        }
      } catch (error) {
        console.error("Admin o'chirishda xatolik:", error);
        bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
      }
      return;
    }

    // Admin uchun kanal qo'shish/o'chirish commandlari
    if (userInput && userInput.startsWith("/qkanal ")) {
      const username = userInput.replace("/qkanal ", "").trim().replace("@", "");
      
      if (!username) {
        bot.sendMessage(chatId, "❌ Kanal username ni kiriting!\n\nMisol: /qkanal @username");
        return;
      }

      try {
        // Bot kanaldan kanal ma'lumotlarini olish
        const chatInfo = await bot.getChat(`@${username}`);
        
        // Kanal yoki guruh ekanligini tekshirish
        if (chatInfo.type !== 'channel' && chatInfo.type !== 'supergroup') {
          bot.sendMessage(
            chatId,
            "❌ Bu kanal yoki guruh emas!\n\nFaqat kanal yoki guruh qo'shish mumkin."
          );
          return;
        }
        
        await addChannel(username, chatInfo.title || username);
        bot.sendMessage(
          chatId,
          `✅ Kanal qo'shildi!\n\n📢 Nomi: ${chatInfo.title}\n🔗 Username: @${username}`
        );
      } catch (error) {
        console.error("Kanal qo'shishda xatolik:", error);
        let errorMsg = "❌ Xatolik!\n\nSabablari:\n";
        errorMsg += "• Kanal username xato\n";
        errorMsg += "• Bot kanalda admin emas\n";
        errorMsg += "• Kanal mavjud emas yoki private\n";
        errorMsg += "• Kanal o'rniga user ko'rsatilgan";
        bot.sendMessage(chatId, errorMsg);
      }
      return;
    }

    if (userInput && userInput.startsWith("/delkanal ")) {
      const username = userInput.replace("/delkanal ", "").trim().replace("@", "");
      
      if (!username) {
        bot.sendMessage(chatId, "❌ Kanal username ni kiriting!\n\nMisol: /delkanal @username");
        return;
      }

      try {
        const result = await deleteChannel(username);
        if (result > 0) {
          bot.sendMessage(
            chatId,
            `✅ Kanal o'chirildi!\n\n🔗 Username: @${username}`
          );
        } else {
          bot.sendMessage(chatId, "❌ Bunday kanal topilmadi!");
        }
      } catch (error) {
        console.error("Kanal o'chirishda xatolik:", error);
        bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
      }
      return;
    }

    // Admin uchun code qidirish yoki admin panel
    if (/^\d+$/.test(userInput)) {
      await sendContentByCode(bot, chatId, userInput, subscribed);
    } else {
      const keyboard = {
        inline_keyboard: [
          [
            { text: "🎬 Kino", callback_data: "film_panel" },
            { text: "📺 Serial", callback_data: "serial_panel" },
          ],
          [
            { text: "👥 Adminlar", callback_data: "admin_list" },
            { text: "📢 Kanallar", callback_data: "channel_panel" },
          ],
          [
            { text: "📊 Statistika", callback_data: "stats" },
            { text: "✉️ Habar yuborish", callback_data: "broadcast" },
          ],
        ],
      };

      bot.sendMessage(
        chatId,
        "🛠️ *Admin Panel*\n\n" +
          "━━━━━━━━━━━━━━━━━━━\n" +
          "👋 Xush kelibsiz!\n" +
          "Kerakli bo'limni tanlang:\n" +
          "━━━━━━━━━━━━━━━━━━━",
        {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        }
      );
    }
  } else {
    // Oddiy foydalanuvchi uchun
    if (/^\d+$/.test(userInput)) {
      await sendContentByCode(bot, chatId, userInput, subscribed);
    } else {
      bot.sendMessage(
        chatId,
        "🎬 *Kino/Serial Qidirish*\n\n" +
          "━━━━━━━━━━━━━━━━━━━\n" +
          "🔢 Kino yoki serial kodini kiriting\n\n" +
          "📝 *Misol:* `12345`\n\n" +
          "💡 *Maslahat:* Har bir kino va serial\n" +
          "uchun alohida kod mavjud.\n" +
          "━━━━━━━━━━━━━━━━━━━\n\n" +
          "❓ Yordam kerakmi? Bizga yozing!",
        {
          parse_mode: "Markdown",
        }
      );
    }
  }
}

module.exports = { handleMessage };
