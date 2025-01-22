const mongoose = require("mongoose");
const Admin = require("../../models/AdminModel");
const callbackIds = {};
let waitingForAdmin = null; // Adminni kutish holati

async function AdminPanel(bot, msg) {
  const chatId = msg.chat.id;

  // Admin bo'lsa, menyu yuborish
  bot.sendMessage(chatId, "🛠️ Admin panelga xush kelibsiz!", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "📋 Adminlar", callback_data: "ShowAdmins" }]],
    },
  });

  bot.on("callback_query", async (query) => {
    if (callbackIds[query.id]) return;
    callbackIds[query.id] = true;
    const chatId = query.message.chat.id;

    await bot.answerCallbackQuery(query.id, {
      text: "🕔 Hozirda!...",
      show_alert: false,
    });

    switch (query.data) {
      case "ShowAdmins":
        const admins = await Admin.find(); // Barcha adminlarni olish

        let adminsText = "";

        admins.map((v) => {
          adminsText += "`" + v.adminId + "`" + "\n";
        });

        console.log(adminsText);

        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, "📋 Adminlar:\n" + adminsText, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "➕ Admin qo'shish", callback_data: "addAdmin" }],
              [
                {
                  text: "➖ Admin olib tashlash",
                  callback_data: "removeAdmin",
                },
              ],
              [
                {
                  text: "🔺 Bosh menuga",
                  callback_data: "restartAdmin",
                },
              ],
            ],
          },
        });
        break;

      case "addAdmin":
        bot.deleteMessage(chatId, query.message.message_id);
        waitingForAdmin = chatId;

        bot.sendMessage(
          chatId,
          "<b>🆔 /addAdmin sozidan song ID ni yuboring</b>\n\nmisol: /addAdmin 2017025737\n\nℹ️ Istalgan insonnni IDsini bu bot qaytaradi: https://t.me/getmyid_bot",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga",
                    callback_data: "ShowAdmins",
                  },
                ],
              ],
            },
          }
        );

        bot.onText(/\/addAdmin (\d+)/, async (msg, match) => {
          const responseId = msg.chat.id;

          if (responseId === waitingForAdmin) {
            const isAdmin =
              (await Admin.findOne({ adminId: responseId })) !== null;

            if (isAdmin) {
              const adminId = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi
              if (adminId && adminId.match(/^\d+$/)) {
                try {
                  const existingAdmin = await Admin.findOne({
                    adminId: adminId,
                  });

                  if (existingAdmin) {
                    bot.sendMessage(chatId, "Bu ID allaqachon mavjud.");
                    waitingForAdmin = null;
                  } else {
                    const newAdmin = new Admin({ adminId: adminId });

                    await newAdmin.save();
                    waitingForAdmin = null;

                    bot.sendMessage(
                      chatId,
                      "Admin ID muvaffaqiyatli qo'shildi."
                    );
                    bot.sendMessage(adminId, "Siz admin qilindingiz!.");
                  }
                } catch (err) {
                  bot.sendMessage(
                    chatId,
                    "Xatolik yuz berdi, admin ID qo'shilmadi."
                  );
                  console.error(err);
                }
              } else {
                bot.sendMessage(chatId, "Iltimos, to'g'ri admin ID kiriting.");
              }
            }
          }
        });
        break;
      case "removeAdmin":
        bot.deleteMessage(chatId, query.message.message_id);
        waitingForAdmin = chatId;

        bot.sendMessage(
          chatId,
          "<b>🆔 /removeAdmin sozidan song ID ni yuboring</b>\n\nmisol: /removeAdmin 2017025737\n\nℹ️ Istalgan insonnni IDsini bu bot qaytaradi: https://t.me/getmyid_bot",
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga",
                    callback_data: "ShowAdmins",
                  },
                ],
              ],
            },
          }
        );

        bot.onText(/\/removeAdmin (\d+)/, async (msg, match) => {
          const responseId = msg.chat.id;

          if (responseId === waitingForAdmin) {
            const isAdmin =
              (await Admin.findOne({ adminId: responseId })) !== null;

            if (isAdmin) {
              const adminIdToRemove = match[1]; // match[1] foydalanuvchidan kelgan ID bo'ladi
              if (adminIdToRemove && adminIdToRemove.match(/^\d+$/)) {
                try {
                  const adminToRemove = await Admin.findOneAndDelete({
                    adminId: adminIdToRemove,
                  });

                  console.log("adminToRemove", adminToRemove);

                  if (adminToRemove) {
                    bot.sendMessage(chatId, "Admin muvaffaqiyatli o'chirildi.");
                    bot.sendMessage(
                      adminIdToRemove,
                      "Siz endi admin Emassiz!."
                    );
                  } else {
                    bot.sendMessage(
                      chatId,
                      "Berilgan ID bilan admin topilmadi. Iltimos, to'g'ri ID kiriting."
                    );
                  }

                  waitingForAdmin = null;
                } catch (err) {
                  bot.sendMessage(
                    chatId,
                    "Xatolik yuz berdi, admin o'chirilmadi."
                  );
                  console.error(err);
                }
              } else {
                bot.sendMessage(chatId, "Iltimos, to'g'ri admin ID kiriting.");
              }
            }
          }
        });
        break;

      case "restartAdmin":
        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, "🛠️ Admin panelga xush kelibsiz!", {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📋 Adminlar", callback_data: "ShowAdmins" }],
            ],
          },
        });
        break;
    }
  });
}

module.exports = { AdminPanel };
