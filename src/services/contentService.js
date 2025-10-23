const contentRepository = require("../database/contentRepository");
const { BOT_USERNAME } = require("../config/env");

// Markdown belgilarni escape qilish
const escapeMarkdown = (text) => {
  if (!text) return text;
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
};

// Code orqali content yuborish (film yoki serial)
const sendContentByCode = async (bot, chatId, code, subscribed) => {
  if (!subscribed) {
    bot.sendMessage(chatId, "Obuna bo'lishingiz kerak.");
    return;
  }

  try {
    // Content mavjudligini tekshirish
    const content = await contentRepository.getContentByCode(code);
    
    if (!content) {
      return bot.sendMessage(
        chatId,
        `❌ ${code} - <b>code dagi kino yoki serial mavjud emas!</b>`,
        { parse_mode: "HTML" }
      );
    }

    // Content itemlarini olish
    const items = await contentRepository.getContentItems(code);
    
    if (items.length === 0) {
      return bot.sendMessage(chatId, "❌ Bu content uchun videolar yuklanmagan!");
    }

    if (content.type === "film") {
      // Film uchun - bitta video yuborish
      const item = items[0];
      
      let caption = `*Kino kodi:* \`${code}\`\n\n`;
      
      // Description ni qo'shish (agar mavjud bo'lsa) - ESCAPE qilib
      if (content.description) {
        caption += escapeMarkdown(content.description) + '\n\n';
      }
      
      caption += `*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @${BOT_USERNAME}*`;
      
      // Videoni yuborish
      await bot.sendVideo(chatId, item.videoHash, {
        parse_mode: "Markdown",
        protect_content: true,
        caption: caption,
      });
      
      // Count ni oshirish
      await contentRepository.incrementItemCount(item.id);
      
    } else if (content.type === "serial") {
      // Serial uchun - qismlar bilan tugmalar
      let caption = `*🎬 Serial kodi:* \`${code}\`\n`;
      
      // Description ni qo'shish (agar mavjud bo'lsa) - ESCAPE qilib
      if (content.description) {
        caption += escapeMarkdown(content.description) + '\n\n';
      }
      
      caption += `*📊 Jami qismlar:* ${items.length} ta\n\n`;
      caption += `*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @${BOT_USERNAME}*`;
      
      // Inline tugmalar yaratish
      const keyboard = [];
      items.forEach((item) => {
        keyboard.push([
          {
            text: `${item.episodeNumber}-qism`,
            callback_data: `episode_${item.id}`,
          },
        ]);
      });
      
      await bot.sendMessage(chatId, caption, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }
    
  } catch (error) {
    console.error("Content yuborishda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring!");
  }
};

// Serial qismini yuborish
const sendEpisode = async (bot, chatId, itemId) => {
  try {
    const item = await contentRepository.getContentItemById(itemId);
    
    if (!item) {
      return bot.sendMessage(chatId, "❌ Qism topilmadi!");
    }
    
    // Caption ni yaratish
    let caption = `${item.episodeNumber}-qism\n\n`;
    
    // Agar qismda caption bo'lsa, uni qo'shamiz - ESCAPE qilib
    if (item.caption) {
      caption += escapeMarkdown(item.caption) + '\n\n';
    }
    
    caption += `*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @${BOT_USERNAME}*`;
    
    await bot.sendVideo(chatId, item.videoHash, {
      caption: caption,
      parse_mode: "Markdown",
      protect_content: true,
    });
    
    // Count ni oshirish
    await contentRepository.incrementItemCount(item.id);
    
  } catch (error) {
    console.error("Qism yuborishda xatolik:", error);
    bot.sendMessage(chatId, "❌ Xatolik yuz berdi!");
  }
};

module.exports = {
  sendContentByCode,
  sendEpisode,
};
