// .env dan malumotlarni o'qish
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const AdminModel = require("./models/AdminModel");
const { subscribeCheck } = require("./commands/SubscribeCheck");
const Users = require("./models/Users");
const FIlmModel = require("./models/FIlm.model");
const MajburiyKanal = require("./models/MajburiyKanal");
const Admin = require("./models/AdminModel");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log("Bot faol! 👋");

// MANGODB ga ulanish
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB ga ulandi ✅"))
  .catch((err) => console.error("DB GA ULANISHDA XATOLIK BOR: ❌", err));

// BEGIN

require("dotenv").config();

let callbackIds = {};
let waitingForAdmin = null; // Adminni kutish holati

const addUserIfNotExists = async (userId) => {
  try {
    // Foydalanuvchini topish
    const user = await Users.findOne({ userId });

    // Agar foydalanuvchi bor bo'lsa, hech narsa qilinmaydi
    if (user) {
      console.log("Foydalanuvchi mavjud.");
      return;
    }

    // Agar foydalanuvchi yo'q bo'lsa, yangi foydalanuvchini qo'shamiz
    const newUser = new Users({
      userId,
    });

    await newUser.save();
    console.log("Foydalanuvchi qo'shildi.");
  } catch (error) {
    console.error("Xato:", error);
  }
};

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  addUserIfNotExists(chatId);

  const subscribed = await subscribeCheck(bot, chatId);

  // const isAdmin = true;

  const isAdmin =
    (await AdminModel.findOne({ adminId: chatId.toString() })) !== null;

  // Faqatgina obuna bo`lgan bo`lsa ishlaydi
  if (!subscribed) {
  } else {
    // ADMIn
    if (isAdmin) {
      const userInput = msg.text;
      await bot.sendMessage(chatId, "🛠️ Admin panelga xush kelibsiz!", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎬 Kino", callback_data: "Film" }],
            [
              { text: "📋 Adminlar", callback_data: "ShowAdmins" },
              { text: "📢 Kanallar", callback_data: "majburiyObuna" },
            ],
            [
              { text: "📊 Statistika", callback_data: "stat" },
              { text: "✉️ Habar yuborish", callback_data: "send_broadcast" },
            ],
            // [],
          ],
        },
      });
      if (/^\d+$/.test(userInput)) {
        const lastDocument = await FIlmModel.findOne({ code: userInput });
        console.log(lastDocument);

        if (lastDocument) {
          await bot.sendVideo(chatId, lastDocument.videoHash, {
            parse_mode: "Markdown",
            protect_content: true, // Forward qilishni taqiqlash
            caption: `*Kino kodi:* \`${lastDocument.code}\`\n\n*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @KinoDownload_Robot*`,
          });
        } else {
          bot.sendMessage(
            chatId,
            "❌" + userInput + "<b> - code dagi kino mavjud emas!</b>",
            {
              parse_mode: "HTML",
            }
          );
        }
      }
    }
    // USER
    else {
      const chatId = msg.chat.id;
      const userInput = msg.text;

      // Foydalanuvchi faqat raqam kiritganligini tekshirish
      if (/^\d+$/.test(userInput)) {
        const lastDocument = await FIlmModel.findOne({ code: userInput });
        console.log(lastDocument);

        if (lastDocument) {
          await bot.sendVideo(chatId, lastDocument.videoHash, {
            parse_mode: "Markdown",
            protect_content: true, // Forward qilishni taqiqlash
            caption: `*Kino kodi:* \`${lastDocument.code}\`\n\n*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @KinoDownload_Robot*`,
          });
        } else {
          bot.sendMessage(
            chatId,
            "❌" + userInput + "<b> - code dagi kino mavjud emas!</b>",
            {
              parse_mode: "HTML",
            }
          );
        }
      }

      bot.sendMessage(
        chatId,
        "<b>Assalamu aleykum! \n\n✍🏻 Kino kodini yuboring...</b>",
        {
          parse_mode: "HTML",
        }
      );
    }
  }

  console.log(chatId);
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;

  if (callbackIds[query.id]) return;
  callbackIds[query.id] = true;

  console.log(callbackIds);

  const isAdmin =
    (await AdminModel.findOne({ adminId: chatId.toString() })) !== null;

  // OBUNANI TEKSHIRISH
  if (query.data === "check_subscription") {
    if (await subscribeCheck(bot, chatId)) {
      bot.sendMessage(
        chatId,
        "<b>Assalamu aleykum! \n\n✍🏻 Kino kodini yuboring...</b>",
        {
          parse_mode: "HTML",
        }
      );
    } else {
      bot.sendMessage(
        chatId,
        "Siz hali hamma kanallarga a'zo bo'lmagansiz. Iltimos, barcha kanallarga a'zo bo'ling va yana tekshiring."
      );
    }
  }

  // ADMIN BUYRUQLARI
  switch (query.data) {
    case "ShowAdmins":
      const isAdmin =
        (await AdminModel.findOne({ adminId: chatId.toString() })) !== null;

      if (isAdmin) {
        const admins = await AdminModel.find(); // Barcha adminlarni olish

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
      }

      break;
    //
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
            (await AdminModel.findOne({ adminId: responseId })) !== null;

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

                  bot.sendMessage(chatId, "Admin ID muvaffaqiyatli qo'shildi.");
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
    //
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
            (await AdminModel.findOne({ adminId: responseId })) !== null;

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
                  bot.sendMessage(adminIdToRemove, "Siz endi admin Emassiz!.");
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
    //
    case "addChanell":
      bot.deleteMessage(chatId, query.message.message_id);
      waitingForAdmin = chatId;
      bot.sendMessage(
        chatId,
        "<b>ℹ️ /q_kanal sozidan song kanal usernamesini yuboring. </b>\n\nMasalan: /q_kanal @murodillayev_hojiakbar",
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Orqaga",
                  callback_data: "majburiyObuna",
                },
              ],
            ],
          },
        }
      );

      bot.onText(/\/q_kanal (@\w+)/, async (msg, match) => {
        const responseId = msg.chat.id;

        if (responseId === waitingForAdmin) {
          const isAdmin =
            (await AdminModel.findOne({ adminId: responseId })) !== null;

          if (isAdmin) {
            console.log("1");
            const username = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi

            try {
              const botAdminThisChannel = await bot.getChatMember(
                username,
                process.env.TELEGRAM_BOT_TOKEN
              );

              if (botAdminThisChannel.status === "administrator") {
                console.log("Bot admin!");
                try {
                  const existingChanell = await MajburiyKanal.findOne({
                    username,
                  });

                  if (existingChanell) {
                    bot.sendMessage(chatId, "Bu kanal allaqachon mavjud.");
                    waitingForAdmin = null;
                  } else {
                    const chatInfo = await bot.getChat(username); // Kanal haqida ma'lumot olish

                    const newChannel = new MajburiyKanal({
                      username,
                      id: chatInfo.id,
                      name: chatInfo.title,
                    });

                    await newChannel.save();
                    waitingForAdmin = null;

                    bot.sendMessage(chatId, "Kanal muvofiqayatlik qoshildi.");
                  }
                } catch (err) {
                  bot.sendMessage(
                    chatId,
                    "Xatolik yuz berdi, Kanal qoshilmadi."
                  );
                  console.error(err);
                }
              } else {
                console.log("Bot admin emas");
                bot.sendMessage(chatId, "Botni kanalga admin qiling!");
              }
            } catch (err) {
              if (err.response && err.response.statusCode === 400) {
                console.log("Botni kanalga admin qiling!");
                console.log("Botni kanalga admin qiling!", err);
                bot.sendMessage(chatId, "Botni kanalga admin qiling!");
              } else {
                console.error("Boshqa xatolik:", err);
                bot.sendMessage(
                  chatId,
                  "Xatolik yuz berdi, kanalni tekshirishda muammo bor."
                );
              }
            }
          }
        }
      });
      break;
    //
    case "RemoveChannel":
      bot.deleteMessage(chatId, query.message.message_id);
      waitingForAdmin = chatId;
      bot.sendMessage(
        chatId,
        "<b>ℹ️ /r_kanal sozidan song kanal usernamesini yuboring. </b>\n\nMasalan: /r_kanal @murodillayev_hojiakbar",
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Orqaga",
                  callback_data: "majburiyObuna",
                },
              ],
            ],
          },
        }
      );

      bot.onText(/\/r_kanal (@\w+)/, async (msg, match) => {
        const responseId = msg.chat.id;

        if (responseId === waitingForAdmin) {
          const isAdmin =
            (await AdminModel.findOne({ adminId: responseId })) !== null;

          if (isAdmin) {
            const username = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi

            try {
              const existingChanell = await MajburiyKanal.findOne({
                username,
              });

              if (!existingChanell) {
                bot.sendMessage(chatId, "Bu kanal mavjud emas.");
                waitingForAdmin = null;
              } else {
                const adminToRemove = await MajburiyKanal.findOneAndDelete({
                  username,
                });

                if (adminToRemove) {
                  bot.sendMessage(chatId, username + " kanali ochirildi");
                } else {
                  bot.sendMessage(chatId, username + " Qandaydur xatolik!");
                }
                waitingForAdmin = null;
              }
            } catch (err) {
              bot.sendMessage(chatId, "Xatolik yuz berdi, Kanal ochirilmadi.");
              console.error(err);
            }
          }
        }
      });
      break;
    //
    case "showChannels":
      bot.deleteMessage(chatId, query.message.message_id);

      const channels = await MajburiyKanal.find(); // Barcha kanallarni olish
      console.log(channels);

      // Agar kanallar mavjud bo'lsa
      if (channels.length > 0) {
        // Kanallarni inline tugmalar orqali ko'rsatish
        const inlineKeyboard = channels.map((channel) => {
          return [
            {
              text: `${channel.name} - ID: ${channel.id}`,
              url: `https://t.me/${channel.username.slice(1)}`,
            },
          ];
        });

        // Kanallarni foydalanuvchiga yuborish
        bot.sendMessage(chatId, "*📋Kanallar ro'yxati:*", {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              ...inlineKeyboard,
              [
                {
                  text: "🔙 Orqaga",
                  callback_data: "majburiyObuna",
                },
              ],
            ],
          },
        });
      } else {
        bot.sendMessage(chatId, "Hech qanday kanal mavjud emas.");
      }

      break;
    //
    case "majburiyObuna":
      bot.deleteMessage(chatId, query.message.message_id);
      bot.sendMessage(chatId, "📢 Kanallar bo'limi !", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📋 Hozirgi kanallar", callback_data: "showChannels" }],
            [
              { text: "➕ Kanal Qo'shish", callback_data: "addChanell" },
              {
                text: "➖ Kanal O'chirish",
                callback_data: "RemoveChannel",
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
    //
    case "stat":
      bot.deleteMessage(chatId, query.message.message_id);

      // Foydalanuvchilarni sanash uchun funksiyalar
      const countUsersToday = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Bugungi kunning boshlanishi (soat 00:00)

        const count = await Users.countDocuments({
          joinedAt: { $gte: today }, // Bugungi kundan boshlab qo'shilgan foydalanuvchilar
        });

        return count;
      };

      const countUsersThisWeek = async () => {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Haftaning birinchi kuni

        const count = await Users.countDocuments({
          joinedAt: { $gte: startOfWeek }, // Bu haftada qo'shilgan foydalanuvchilar
        });

        return count;
      };

      const countUsersThisMonth = async () => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1); // Oyning birinchi kuni

        const count = await Users.countDocuments({
          joinedAt: { $gte: startOfMonth }, // Bu oyda qo'shilgan foydalanuvchilar
        });

        return count;
      };

      const countUsersThisYear = async () => {
        const startOfYear = new Date();
        startOfYear.setMonth(0, 1); // Yilning birinchi kuni (1-yanvar)

        const count = await Users.countDocuments({
          joinedAt: { $gte: startOfYear }, // Bu yilda qo'shilgan foydalanuvchilar
        });

        return count;
      };

      // Umumiy obunachilar soni
      const countTotalUsers = async () => {
        const total = await Users.countDocuments(); // Barcha foydalanuvchilar soni
        return total;
      };

      // Statistikalarni olish
      const today = await countUsersToday();
      const thisWeek = await countUsersThisWeek();
      const thisMonth = await countUsersThisMonth();
      const thisYear = await countUsersThisYear();
      const totalUsers = await countTotalUsers(); // To'liq foydalanuvchilar soni

      // Xabarni tayyorlash
      const message =
        `🎉 <b>Botga qo'shilgan foydalanuvchilar statistikasini ko'ring:</b>\n` +
        `\n` +
        `📅 <b>Bugun</b>: ${today} ta yangi foydalanuvchi qo'shildi! ` +
        `\n` +
        `🗓️ <b>Bu hafta</b>: ${thisWeek} ta yangi foydalanuvchi qo'shildi! ` +
        `\n` +
        `📆 <b>Bu oy</b>: ${thisMonth} ta yangi foydalanuvchi qo'shildi! ` +
        `\n` +
        `🏆 <b>Bu yilda</b>: ${thisYear} ta yangi foydalanuvchi qo'shildi! ` +
        `\n\n` +
        `📊 <b>Jami foydalanuvchilar soni</b>: ${totalUsers} ta ` +
        `\n` +
        `🌟 <b>Bu juda ajoyib!</b> Botning rivojlanishi juda tez! `;

      // Xabarni yuborish
      bot.sendMessage(chatId, message, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
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
    //
    case "Film":
      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }

      bot.sendMessage(chatId, "🎬 Kinolarni boshqarish", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔎 Kod bo'yicha Qidirish",
                callback_data: "searchFilm",
              },
            ],
            [
              { text: "🎬 Kino qo'shish", callback_data: "addFilm" },
              { text: "❌ Kino o'chirish", callback_data: "deleteFilm" },
            ],
            [
              {
                text: "🔙 Orqaga",
                callback_data: "restartAdmin",
              },
            ],
            // [],
          ],
        },
      });

      break;
    //
    case "addFilm":
      if (query.message.message_id) {
        bot.deleteMessage(chatId, query.message.message_id);
      }
      bot.sendMessage(chatId, "🎥 Kino yuklash uchun uni yuboring:");

      const lastDocument =
        (await FIlmModel.findOne().sort({ code: -1 }).exec()) || 0;
      console.log("lastDocument", lastDocument);

      bot.once("video", async (msg) => {
        console.log("VIDEO CONNECTED");

        const videoFileId = msg.video.file_id; // Video fayl ID sini olish
        const targetChannel = -1002445594841; // Kanal ID

        try {
          // Oxirgi hujjatni olish
          const lastDocument = await FIlmModel.findOne()
            .sort({ code: -1 })
            .exec();

          // Videoni kanalga yuborish
          const sentMessage = await bot.sendVideo(targetChannel, videoFileId, {
            parse_mode: "Markdown",
            caption: `*Kino kodi:* \`${
              lastDocument ? lastDocument.code + 1 : 1
            }\`\n\n*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @KinoDownload_Robot*`,
          });

          // Yangi hujjatni yaratish
          const newFIlm = new FIlmModel({
            postId: sentMessage.message_id,
            videoHash: videoFileId,
            count: 0,
            code: lastDocument ? lastDocument.code + 1 : 1, // Agar hujjat bo'lmasa, 1 dan boshlanadi
          });

          // Yangi hujjatni saqlash
          await newFIlm.save();

          await bot.sendVideo(chatId, newFIlm.videoHash, {
            parse_mode: "Markdown",
            caption: `*Kino kodi:* \`${newFIlm.code}\`\n\n*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @KinoDownload_Robot*`,
          });

          bot.sendMessage(
            msg.chat.id,
            "✅ Kino muvaffaqiyatli yuklandi va kanalga joylandi!"
          );
        } catch (error) {
          console.log("Kino yuklashda xatolik!", error);
          bot.sendMessage(msg.chat.id, "❌ Video yuklashda xatolik yuz berdi!");
        }
      });

      break;
    case "deleteFilm":
      bot.sendMessage(
        chatId,
        "🎬 O'chiriladigan kinoning kodini kiriting:\n\nMasalan: /delFilm 1"
      );

      bot.onText(/\/delFilm (\d+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const codeToDelete = parseInt(match[1]); // "delFilm <code>" formatida bo'lsa, code olish

        if (isNaN(codeToDelete)) {
          bot.sendMessage(
            chatId,
            "❌ Iltimos, to'g'ri kod kiriting: /delFilm <kod>"
          );
          return;
        }

        try {
          // Code bo'yicha filmni topish
          const filmToDelete = await FIlmModel.findOne({
            code: codeToDelete,
          }).exec();

          if (!filmToDelete) {
            bot.sendMessage(
              chatId,
              `❌ Kodga mos film topilmadi. (Kod: ${codeToDelete})`
            );
            return;
          }

          // Filmni o'chirish
          await FIlmModel.deleteOne({ code: codeToDelete });

          bot.sendMessage(
            chatId,
            `✅ Kodga mos film muvaffaqiyatli o'chirildi! (Kod: ${codeToDelete})`
          );
        } catch (error) {
          console.log("Filmni o'chirishda xatolik:", error);
          bot.sendMessage(chatId, "❌ Filmni o'chirishda xatolik yuz berdi.");
        }
      });

      break;
    case "searchFilm":
      console.log(callbackIds);
      bot.sendMessage(chatId, "<b>✍🏻 Kino kodini yuboring...</b>", {
        parse_mode: "HTML",
      });

      bot.onText(/^\d+$/, async (msg) => {
        const chatId = msg.chat.id;
        const userInput = msg.text;

        // Foydalanuvchi faqat raqam kiritganligini tekshirish
        if (/^\d+$/.test(userInput)) {
          const lastDocument = await FIlmModel.findOne({ code: userInput });
          console.log(lastDocument);

          if (lastDocument) {
            await bot.sendVideo(chatId, lastDocument.videoHash, {
              parse_mode: "Markdown",
              protect_content: true, // Forward qilishni taqiqlash
              caption: `*Kino kodi:* \`${lastDocument.code}\`\n\n*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @KinoDownload_Robot*`,
            });
          } else {
            bot.sendMessage(
              chatId,
              "❌" + userInput + "<b> - code dagi kino mavjud emas!</b>",
              {
                parse_mode: "HTML",
              }
            );
          }
        } else {
          bot.sendMessage(chatId, "❌ Iltimos, faqat raqam kiriting.");
        }
      });

      break;
    case "restartAdmin":
      bot.deleteMessage(chatId, query.message.message_id);
      await bot.sendMessage(chatId, "🛠️ Admin panelga xush kelibsiz!", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎬 Kino", callback_data: "Film" }],
            [
              { text: "📋 Adminlar", callback_data: "ShowAdmins" },
              { text: "📢 Kanallar", callback_data: "majburiyObuna" },
            ],
            [
              { text: "📊 Statistika", callback_data: "stat" },
              { text: "✉️ Habar yuborish", callback_data: "send_broadcast" },
            ],
            // [],
          ],
        },
      });
      break;
    //
    case "send_broadcast":
      broadcast_mode = true;
      bot.sendMessage(
        chatId,
        "Yuborish uchun quyidagi variantlardan birini tanlang:",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Oddiy habar yuborish",
                  callback_data: "broadcast_normal",
                },
              ],
              [
                {
                  text: "Forward habar yuborish",
                  callback_data: "broadcast_forward",
                },
              ],
            ],
          },
        }
      );
      //
      bot.once("callback_query", (broadcastTypeQuery) => {
        const type = broadcastTypeQuery.data;
        bot.answerCallbackQuery(broadcastTypeQuery.id);

        bot.sendMessage(chatId, "Endi xabaringizni yuboring:", {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Bekor qilish",
                  callback_data: "otmen_broadcast",
                },
              ],
            ],
          },
        });
        bot.once("callback_query", async (query2) => {
          await bot.answerCallbackQuery(query2.id);

          if (query2.data === "otmen_broadcast") {
            broadcast_mode = false;

            bot.sendMessage(chatId, "<b>Habar yuborish bekor qilindi!</b>", {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Admin menuga qaytish",
                      callback_data: "restartAdmin",
                    },
                  ],
                ],
              },
            });

            bot.once("callback_query", async (innerQ) => {
              await bot.answerCallbackQuery(innerQ.id);

              if (innerQ.data === "back_to_panel") {
                adminPanel(bot, chatId);
              }
              bot.deleteMessage(chatId, innerQ.message.message_id);
            });

            bot.deleteMessage(chatId, query2.message.message_id);
            bot.deleteMessage(chatId, broadcastTypeQuery.message.message_id);
          }
        });

        bot.on("message", async (broadcastMsg) => {
          // const allUsers = await User.find({}, "telegramId");
          const isAdmin =
            (await AdminModel.findOne({ adminId: chatId.toString() })) !== null;

          if (broadcast_mode && isAdmin) {
            broadcast_mode = false;

            // const allUsers = [
            //   { telegramId: "5976825670" },
            //   { telegramId: "2017025737" },
            // ];
            // console.log(allUsers);

            const allUsers = await Users.find({}, "userId");
            console.log(allUsers);

            allUsers.forEach(async (user) => {
              try {
                if (type === "broadcast_normal") {
                  // Media yoki oddiy xabarni aniqlash
                  if (broadcastMsg.photo) {
                    await bot.sendPhoto(
                      user.userId,
                      broadcastMsg.photo[0].file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else if (broadcastMsg.video) {
                    await bot.sendVideo(
                      user.telegramId,
                      broadcastMsg.video.file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else if (broadcastMsg.audio) {
                    await bot.sendAudio(
                      user.userId,
                      broadcastMsg.audio.file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else if (broadcastMsg.document) {
                    await bot.sendDocument(
                      user.userId,
                      broadcastMsg.document.file_id,
                      {
                        caption: broadcastMsg.caption || "",
                        parse_mode: "HTML",
                      }
                    );
                  } else {
                    await bot.sendMessage(
                      user.userId,
                      broadcastMsg.text || "",
                      { parse_mode: "HTML" }
                    );
                  }
                } else if (type === "broadcast_forward") {
                  await bot.forwardMessage(
                    user.userId,
                    chatId,
                    broadcastMsg.message_id
                  );
                }
              } catch (error) {
                console.log(error);

                console.error(
                  `Xatolik: ${user.userId} ga xabar yuborishda muammo!`
                );
              }
            });

            bot.sendMessage(
              chatId,
              "📨 Xabar barcha foydalanuvchilarga muvaffaqiyatli yuborildi."
            );
          }
        });
      });
      bot.deleteMessage(chatId, query.message.message_id);

      break;
  }
});
