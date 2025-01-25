async function subscribeCheck(bot, chatId, db) {
  return new Promise((resolve, reject) => {
    const notSubscribedChannels = [];

    // Barcha kanallarni olish
    db.all("SELECT * FROM MajburiyKanal", async (err, rows) => {
      if (err) {
        console.error("Kanallarni olishda xatolik:", err.message);
        reject(err);
        return;
      }

      console.log(rows);

      for (const channel of rows) {
        try {
          const memberStatus = await bot.getChatMember(
            channel.username,
            chatId
          );

          if (
            !["member", "creator", "administrator"].includes(
              memberStatus.status
            )
          ) {
            notSubscribedChannels.push(channel);
          }
        } catch (error) {
          console.error(
            `Kanalga obuna holatini tekshirishda xatolik (${channel.username}):`,
            error.message
          );
        }
      }

      if (notSubscribedChannels.length === 0) {
        resolve(true); // Foydalanuvchi obuna bo'lgan
      } else {
        const buttons = notSubscribedChannels.map((channel) => [
          {
            text: `❌ ${channel.name}`,
            url: `https://t.me/${channel.username.slice(1)}`,
          },
        ]);

        buttons.push([
          { text: "✔️ Tekshirish", callback_data: "check_subscription" },
        ]);

        await bot.sendMessage(
          chatId,
          `*✅ Botdan foydalanish uchun kanallarga obuna bo'ling va tasdiqlash tugmasini bosing.*`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: buttons,
            },
          }
        );

        resolve(false); // Foydalanuvchi obuna bo'lmagan
      }
    });
  });
}

module.exports = { subscribeCheck };
