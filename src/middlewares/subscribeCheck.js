const { getAllChannels } = require("../database/channelRepository");

async function subscribeCheck(bot, chatId) {
  try {
    const channels = await getAllChannels();
    const notSubscribedChannels = [];

    for (const channel of channels) {
      try {
        // @ belgisini qo'shish (agar yo'q bo'lsa)
        const channelUsername = channel.username.startsWith('@') 
          ? channel.username 
          : `@${channel.username}`;
          
        const memberStatus = await bot.getChatMember(channelUsername, chatId);

        if (
          !["member", "creator", "administrator"].includes(memberStatus.status)
        ) {
          notSubscribedChannels.push(channel);
        }
      } catch (error) {
        // Kanal topilmasa yoki xato bo'lsa - skip qilamiz va console ga chiqarmaymiz
        // (chunki har bir userga bot obunani tekshirganda log ko'p bo'ladi)
        if (error.message.includes('chat not found')) {
          // Kanal o'chirilgan yoki username o'zgargan - skip
          continue;
        }
        // Boshqa xatolar uchun log
        console.error(
          `Kanalga obuna tekshirish xatolik (${channel.username}):`,
          error.message
        );
      }
    }

    if (notSubscribedChannels.length === 0) {
      return true; // Foydalanuvchi obuna bo'lgan
    } else {
      const buttons = notSubscribedChannels.map((channel) => {
        // @ belgisini olib tashlash URL uchun
        const username = channel.username.replace('@', '');
        return [
          {
            text: `❌ ${channel.name}`,
            url: `https://t.me/${username}`,
          },
        ];
      });

      buttons.push([
        { text: "✔️ Tekshirish", callback_data: "check_subscription" },
      ]);

      await bot.sendMessage(
        chatId,
        `✅ Botdan foydalanish uchun kanallarga obuna bo'ling va tasdiqlash tugmasini bosing.`,
        {
          reply_markup: {
            inline_keyboard: buttons,
          },
        }
      );

      return false; // Foydalanuvchi obuna bo'lmagan
    }
  } catch (error) {
    console.error("Obunani tekshirishda xatolik:", error.message);
    return false;
  }
}

module.exports = { subscribeCheck };
