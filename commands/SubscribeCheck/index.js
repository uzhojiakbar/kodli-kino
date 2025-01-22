// const channels = require("../../utils/channels");

const MajburiyKanal = require("../../models/MajburiyKanal");

const getAllChannels = async () => {
  try {
    const channels = await MajburiyKanal.find(); // Barcha ma'lumotlarni oladi
    console.log(channels); // Ma'lumotlar array ko'rinishida bo'ladi
  } catch (error) {
    console.error("Ma'lumotlarni olishda xatolik:", error);
  }
};

async function subscribeCheck(bot, chatId) {
  try {
    const notSubscribedChannels = [];

    for (const channel of await getAllChannels) {
      const memberStatus = await bot.getChatMember(channel.username, chatId);

      if (
        !["member", "creator", "administrator"].includes(memberStatus.status)
      ) {
        notSubscribedChannels.push(channel);
      }
    }

    //
    //

    if (notSubscribedChannels.length === 0) return true;
    else {
      const buttons = notSubscribedChannels.map((channel) => [
        {
          text: `➕ ${channel.Buttonname}`,
          url: `https://t.me/${channel.username.slice(1)}`,
        },
      ]);
      buttons.push([
        { text: "✔️ Tekshirish", callback_data: "check_subscription" },
      ]);

      await bot.sendMessage(
        chatId,
        `*✅ Botdan foydalanish uchun Kanallarga obuna boling va tasdiqlash tugmasini bosing.*`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: buttons,
          },
        }
      );

      //
      //
      //
      return false;
    }
  } catch (error) {}
  return true;
}

module.exports = { subscribeCheck };
