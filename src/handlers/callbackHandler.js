const { sendEpisode } = require("../services/contentService");
const { subscribeCheck } = require("../middlewares/subscribeCheck");
const { showAdminPanel, showAdminList } = require("./callbacks/adminCallbacks");
const { showChannelPanel } = require("./callbacks/channelCallbacks");
const { showStatistics } = require("./callbacks/statsCallbacks");
const {
  showBroadcastPanel,
  startBroadcastNormal,
  startBroadcastForward,
  cancelBroadcast,
} = require("./callbacks/broadcastCallbacks");
const {
  showFilmPanel,
  startAddFilm,
  startDeleteFilm,
  startEditFilmCode,
  showFilmsList,
} = require("./callbacks/filmCallbacks");
const {
  showSerialPanel,
  startAddSerial,
  saveSerial,
  cancelSerial,
  startDeleteSerial,
  startEditSerialCode,
  startAddEpisode,
  finishAddEpisode,
  startDeleteEpisode,
  showSerialsList,
} = require("./callbacks/serialCallbacks");

// Callback querylarni handle qilish
async function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  try {
    // Callback ni acknowledge qilish
    await bot.answerCallbackQuery(callbackQuery.id);

    // Obuna tekshirish
    if (data === "check_subscription") {
      const subscribed = await subscribeCheck(bot, chatId);
      
      if (subscribed) {
        // Obuna bo'lgan - xabarni o'chirish va xush kelibsiz xabari
        await bot.deleteMessage(chatId, messageId);
        await bot.sendMessage(
          chatId,
          "✅ Obuna tasdiqlandi!\n\n" +
          "🎬 Kino yoki serial kodini kiriting:\n\n" +
          "Misol: 12345"
        );
      }
      // Agar obuna bo'lmagan bo'lsa, subscribeCheck o'zi xabar yuboradi
      return;
    }

    // Admin panel
    if (data === "admin_panel") {
      await showAdminPanel(bot, chatId, messageId);
    }
    // Admin list
    else if (data === "admin_list") {
      await showAdminList(bot, chatId, messageId);
    }
    // Channel panel
    else if (data === "channel_panel") {
      await showChannelPanel(bot, chatId, messageId);
    }
    // Statistics
    else if (data === "stats") {
      await showStatistics(bot, chatId, messageId);
    }
    // Broadcast panel
    else if (data === "broadcast") {
      await showBroadcastPanel(bot, chatId, messageId);
    } else if (data === "broadcast_normal") {
      await startBroadcastNormal(bot, chatId, messageId);
    } else if (data === "broadcast_forward") {
      await startBroadcastForward(bot, chatId, messageId);
    } else if (data === "cancel_broadcast") {
      await cancelBroadcast(bot, chatId, messageId);
    }
    // Film panel
    else if (data === "film_panel") {
      await showFilmPanel(bot, chatId, messageId);
    } else if (data === "film_add") {
      await startAddFilm(bot, chatId, messageId);
    } else if (data === "film_delete") {
      await startDeleteFilm(bot, chatId, messageId);
    } else if (data === "film_edit_code") {
      await startEditFilmCode(bot, chatId, messageId);
    } else if (data === "film_list") {
      await showFilmsList(bot, chatId, messageId, 1);
    } else if (data.startsWith("film_list_page_")) {
      const page = parseInt(data.split("_")[3]);
      await showFilmsList(bot, chatId, messageId, page);
    }
    // Serial panel
    else if (data === "serial_panel") {
      await showSerialPanel(bot, chatId, messageId);
    } else if (data === "serial_add") {
      await startAddSerial(bot, chatId, messageId);
    } else if (data === "serial_save") {
      await saveSerial(bot, chatId, messageId);
    } else if (data === "serial_cancel") {
      await cancelSerial(bot, chatId, messageId);
    } else if (data === "serial_delete") {
      await startDeleteSerial(bot, chatId, messageId);
    } else if (data === "serial_edit_code") {
      await startEditSerialCode(bot, chatId, messageId);
    } else if (data === "serial_add_episode") {
      await startAddEpisode(bot, chatId, messageId);
    } else if (data === "serial_finish_add_episode") {
      await finishAddEpisode(bot, chatId, messageId);
    } else if (data === "serial_delete_episode") {
      await startDeleteEpisode(bot, chatId, messageId);
    } else if (data === "serial_list") {
      await showSerialsList(bot, chatId, messageId, 1);
    } else if (data.startsWith("serial_list_page_")) {
      const page = parseInt(data.split("_")[3]);
      await showSerialsList(bot, chatId, messageId, page);
    }
    // Episode
    else if (data.startsWith("episode_")) {
      const itemId = parseInt(data.split("_")[1]);
      await sendEpisode(bot, chatId, itemId);
    }
    // Noop - pagination uchun
    else if (data === "noop") {
      // Do nothing - bu faqat sahifa raqamini ko'rsatish uchun
    }
  } catch (error) {
    console.error("Callback query xatosi:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
  }
}

module.exports = { handleCallbackQuery };
