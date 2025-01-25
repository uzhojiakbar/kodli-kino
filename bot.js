require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const TelegramBot = require("node-telegram-bot-api");
const { subscribeCheck } = require("./commands/SubscribeCheck");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log("Bot faol! 👋");
const callbackIds = {};
const adminId = 7935730795; // adminning ID sini bu yerga yozing
let waitingForAdmin = null;

const db = new sqlite3.Database(process.env.dbPath, (err) => {
  if (err) {
    console.error("Bazaga ulanishda xatolik:", err.message);
  } else {
    console.log("SQLite3 bazasi ulandi ✅");

    // Users jadvali yaratish
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY, 
        userId TEXT UNIQUE, 
        joinedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Users jadvalini yaratishda xatolik:", err.message);
        }
      }
    );

    // films ni yaratish
    db.run(
      `CREATE TABLE IF NOT EXISTS films (
        id INTEGER PRIMARY KEY, 
        code INTEGER UNIQUE, 
        postId TEXT UNIQUE, 
        videoHash TEXT NOT NULL, 
        count INTEGER DEFAULT 0
      )`,
      (err) => {
        if (err) {
          console.error("Films jadvalini yaratishda xatolik:", err.message);
        }
      }
    );

    // admins ni yaratish
    db.run(
      `CREATE TABLE IF NOT EXISTS admins (
        adminId TEXT UNIQUE NOT NULL PRIMARY KEY
      )`,
      (err) => {
        if (err) {
          console.error("Admins jadvalini yaratishda xatolik:", err.message);
        }
      }
    );

    // MajburiyKanal jadvalini yaratish
    db.run(
      `CREATE TABLE IF NOT EXISTS MajburiyKanal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT UNIQUE NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error(
            "MajburiyKanal jadvalini yaratishda xatolik:",
            err.message
          );
        }
      }
    );
  }
});

// Foydalanuvchini bazaga qo'shish yoki tekshirish
const addUserIfNotExists = async (userId) => {
  db.get(
    `SELECT * FROM users WHERE userId = ?`,
    [String(userId)],
    (err, row) => {
      if (err) {
        console.error("Foydalanuvchini tekshirishda xatolik:", err.message);
        return;
      }
      if (!row) {
        db.run(
          `INSERT INTO users (userId, joinedAt) VALUES (?, CURRENT_TIMESTAMP)`,
          [String(userId)],
          (err) => {
            if (err) {
              console.error("Foydalanuvchini qo'shishda xatolik:", err.message);
            } else {
              console.log("Foydalanuvchi muvaffaqiyatli qo'shildi.");
            }
          }
        );
      } else {
        console.log("Foydalanuvchi allaqachon mavjud.");
      }
    }
  );
};
const sendFilmByCode = (chatId, userInput, subscribed) => {
  if (!subscribed) {
    bot.sendMessage(chatId, "Obuna bo'lishingiz kerak.");
    return;
  }

  db.get(`SELECT * FROM films WHERE code = ?`, [userInput], (err, film) => {
    if (err) {
      console.error("Filmni tekshirishda xatolik:", err.message);
      return;
    }

    if (film) {
      bot.sendVideo(chatId, film?.videoHash, {
        parse_mode: "Markdown",
        protect_content: true, // Forward qilishni taqiqlash
        caption: `*Kino kodi:* \`${film?.code}\`\n\n*Eng sara tarjima kinolar va seriallar faqat bizda 🍿\n🤖Bizning bot: @KinoDownload_Robot*`,
      });
    } else {
      bot.sendMessage(
        chatId,
        `❌ ${userInput} - <b>code dagi kino mavjud emas!</b>`,
        { parse_mode: "HTML" }
      );
    }
  });
};

// Xabarlarni qayta ishlash
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  addUserIfNotExists(chatId);

  const subscribed = await subscribeCheck(bot, chatId, db);

  // Agar foydalanuvchi obuna bo'lmasa, faqatgina xabar yuboring
  if (!subscribed) {
    console.log("Foydalanuvchi obuna bo'lmagan");
    return; // Agar obuna bo'lmasa, boshqa ishlarni bajarishga o'tmang
  }

  db.get(
    `SELECT * FROM admins WHERE adminId = ?`,
    [chatId.toString()],
    (err, isAdmin) => {
      if (err) {
        console.error("Adminni tekshirishda xatolik:", err.message);
        return;
      }

      const isAdminId = isAdmin?.adminId == chatId;

      if (isAdminId) {
        if (/^\d+$/.test(userInput)) {
          sendFilmByCode(chatId, userInput, subscribed);
        } else {
          bot.sendMessage(chatId, "🛠️ Admin panelga xush kelibsiz!", {
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
                  {
                    text: "✉️ Habar yuborish",
                    callback_data: "send_broadcast",
                  },
                ],
              ],
            },
          });
        }
      } else {
        if (/^\d+$/.test(userInput)) {
          sendFilmByCode(chatId, userInput, subscribed);
        } else {
          bot.sendMessage(
            chatId,
            "<b>Assalamu aleykum! \n\n✍🏻 Kino kodini yuboring...</b>",
            { parse_mode: "HTML" }
          );
        }
      }
    }
  );
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  if (callbackIds[query.id]) return;
  callbackIds[query.id] = true;

  // bot.answerCallbackQuery(query.id).catch((err) => {
  //   console.error("Callbackni tasdiqlashda xatolik:", err.message);
  // });

  // OBUNANI TEKSHIRISH
  if (query.data === "check_subscription") {
    if (await subscribeCheck(bot, chatId, db)) {
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

  db.get(
    `SELECT * FROM admins WHERE adminId = ?`,
    [chatId.toString()],
    (err, isAdmin) => {
      if (err) {
        console.error("Adminni tekshirishda xatolik:", err.message);
        return;
      }

      const isAdminId = isAdmin?.adminId == chatId;

      console.log(query.data);
      const data = query.data;

      if (data.startsWith("remove_channel_")) {
        const usernameWithAtSymbol = data.slice("remove_channel_".length); // "@username" olish
        console.log("Username with @:", usernameWithAtSymbol);

        const cleanUsername = usernameWithAtSymbol;
        console.log("Cleaned username:", cleanUsername); // username'ni tozalash

        // MajburiyKanal jadvalidan tanlangan kanalni o'chirish
        db.get(
          `SELECT * FROM MajburiyKanal WHERE username = ?`,
          [cleanUsername],
          (err, channel) => {
            if (err) {
              console.error("Kanalni tekshirishda xatolik:", err.message);
              bot.sendMessage(chatId, "Kanalni o'chirishda xatolik!");
              return;
            }

            if (!channel) {
              bot.sendMessage(chatId, "Tanlangan kanal mavjud emas.");
              return;
            }

            // Kanalni o'chirish
            db.run(
              `DELETE FROM MajburiyKanal WHERE username = ?`,
              [cleanUsername],
              (err) => {
                if (err) {
                  bot.sendMessage(
                    chatId,
                    "Kanalni o'chirishda xatolik yuz berdi."
                  );
                  console.error("Kanalni o'chirishda xatolik:", err.message);
                } else {
                  bot.sendMessage(chatId, `${channel.name} kanali o'chirildi.`);
                }
              }
            );
          }
        );
      }

      switch (query.data) {
        // ADMINLAR MENYUSI
        case "ShowAdmins":
          if (isAdminId) {
            let adminsText = "";

            db.all(`SELECT * FROM admins`, (err, rows) => {
              if (err) {
                console.error("Adminslarni olishda xatolik:", err.message);
                console.log(err);
                adminsText = "ADMINLAR YUKLANMADI";
              } else {
                rows.map((v) => {
                  adminsText += "`" + v.adminId + "`" + "\n";
                });
              }

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
            });
          }

          break;
        // ADMINLAR MENYUSI ichidagi admin qoshish
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
              if (isAdmin) {
                const adminId = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi
                if (adminId && adminId.match(/^\d+$/)) {
                  db.get(
                    `SELECT * FROM admins WHERE adminId = ?`,
                    [String(adminId)],
                    (err, currentAdmin) => {
                      if (err) {
                        console.error(
                          "Adminni tekshirishda xatolik:",
                          err.message
                        );
                        console.log(err);
                      } else {
                        if (currentAdmin?.adminId) {
                          bot.sendMessage(
                            chatId,
                            "`" +
                              adminId +
                              "`" +
                              " *id dagi foydaluvchi mavjud*😷",
                            {
                              parse_mode: "Markdown",
                            }
                          );
                          waitingForAdmin = null;
                        } else {
                          db.run(
                            `INSERT INTO admins (adminId) VALUES (?)`,
                            [String(adminId)],
                            (err) => {
                              if (err) {
                                console.error(
                                  "Admin qo'shishda xatolik:",
                                  err.message
                                );
                                bot.sendMessage(
                                  chatId,
                                  " *Admin qo'shilmadi, nomalum xatolik!*😷",
                                  {
                                    parse_mode: "Markdown",
                                  }
                                );
                              } else {
                                bot.sendMessage(
                                  chatId,
                                  "`" +
                                    adminId +
                                    "`" +
                                    " *ID dagi Admin Qoshildi*✅",
                                  {
                                    parse_mode: "Markdown",
                                  }
                                );
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
              }
            }
          });
          break;
        // ADMINLAR MENYUSI ichidagi admin ochirish
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
              if (isAdmin) {
                const adminId = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi
                if (adminId && adminId.match(/^\d+$/)) {
                  db.get(
                    `SELECT * FROM admins WHERE adminId = ?`,
                    [String(adminId)],
                    (err, currentAdmin) => {
                      if (err) {
                        console.error(
                          "Adminni tekshirishda xatolik:",
                          err.message
                        );
                        console.log(err);
                      } else {
                        if (currentAdmin) {
                          db.run(
                            `DELETE FROM admins WHERE adminId = ?`,
                            [String(adminId)],
                            function (err) {
                              if (err) {
                                console.error(
                                  "Adminni o'chirishda xatolik:",
                                  err.message
                                );
                                bot.sendMessage(
                                  chatId,
                                  " *Admin o'chirilmadi, nomalum xatolik!*😷",
                                  {
                                    parse_mode: "Markdown",
                                  }
                                );
                              } else if (this.changes === 0) {
                                bot.sendMessage(
                                  chatId,
                                  " *Menimcha Bunday ID dagi admin mavjud emas, Hullas ochirilmadi!!*😷",
                                  {
                                    parse_mode: "Markdown",
                                  }
                                );
                              } else {
                                bot.sendMessage(
                                  chatId,
                                  " *Admin muvaffaqiyatli o'chirildi. ✅*",
                                  {
                                    parse_mode: "Markdown",
                                  }
                                );
                              }
                            }
                          );

                          waitingForAdmin = null;
                        }

                        console.log(currentAdmin);
                      }

                      if (currentAdmin === undefined) {
                        bot.sendMessage(
                          chatId,
                          " *Menimcha Bunday ID dagi admin mavjud emas, Hullas ochirilmadi!!*😷",
                          {
                            parse_mode: "Markdown",
                          }
                        );
                      }
                    }
                  );
                }
              }
            }
          });
          break;
        // Majburiy obuna uchun kanal qo'shish
        case "majburiyObuna":
          bot.deleteMessage(chatId, query.message.message_id);
          bot.sendMessage(chatId, "📢 Kanallar bo'limi !", {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📋 Hozirgi kanallar",
                    callback_data: "showChannels",
                  },
                ],
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
        //
        case "showChannels":
          bot.deleteMessage(chatId, query.message.message_id);

          db.all(`SELECT * FROM MajburiyKanal`, (err, channels) => {
            if (err) {
              console.error("MajburiyKanal olishda xatolik:", err.message);
            } else {
              console.log(channels);
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
                bot.sendMessage(chatId, "*📦 Hech qanday kanal mavjud emas.*", {
                  parse_mode: "Markdown",
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
                });
              }
            }
          });

          // Agar kanallar mavjud bo'lsa

          break;
        //
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
              if (isAdmin) {
                const username = match[1]; // match[1] da foydalanuvchidan kelgan ID bo'ladi

                try {
                  // MajburiyKanal jadvalidan barcha kanallarni olish
                  db.all(
                    `SELECT * FROM MajburiyKanal`,
                    [],
                    async (err, channels) => {
                      if (err) {
                        console.error(
                          "Kanallarni olishda tekshirishda xatolik:",
                          err.message
                        );
                        bot.sendMessage(chatId, "Kanallarni olishda xatolik!");
                      } else {
                        console.log(channels); // Barcha kanallarni konsolda ko'rsatish
                        try {
                          const botAdminThisChannel = await bot.getChatMember(
                            username,
                            process.env.TELEGRAM_BOT_TOKEN
                          );

                          if (botAdminThisChannel.status === "administrator") {
                            // Kanalni bazaga qo'shish
                            try {
                              const chatInfo = await bot.getChat(username); // Asinxron ishni kutish kerak
                              db.run(
                                `INSERT INTO MajburiyKanal (username, id, name) VALUES (?, ?, ?)`,
                                [
                                  String(username),
                                  String(chatInfo.id),
                                  String(chatInfo.title),
                                ],
                                (err) => {
                                  if (err) {
                                    console.error(
                                      "Kanal qoshishda xatolik:",
                                      err.message
                                    );
                                    bot.sendMessage(
                                      chatId,
                                      "Kanalni qo'shishda xatolik yuz berdi."
                                    );
                                  } else {
                                    bot.sendMessage(
                                      chatId,
                                      "Kanal muvaffaqiyatli qo'shildi."
                                    );
                                  }
                                }
                              );
                            } catch (err) {
                              bot.sendMessage(
                                chatId,
                                "Kanalni olishda xatolik yuz berdi!"
                              );
                              console.error(err);
                            }
                          } else {
                            // Agar bot kanalga admin bo'lmasa
                            bot.sendMessage(
                              chatId,
                              "🚨 Botni ushbu kanalga administrator sifatida qo'shing. \n\nBotni kanalga admin qilganingizdan so'ng, men kanalga murojaat qilib, ma'lumotlarni olaman. \n\nIltimos, adminlik huquqini berishda ehtiyotkor bo'ling."
                            );
                          }
                        } catch (err) {
                          // console.log("1111111111111", err.response.statusCode);
                          // if (
                          //   err?.response.statusCode === 400 &&
                          //   err?.response.body &&
                          //   err?.response.body.description &&
                          //   err?.response.body.description.includes(
                          //     "member list is inaccessible"
                          //   )
                          // ) {
                          //   // Agar botning kanal a'zolari ro'yxatiga kirish imkoni bo'lmasa
                          //   bot.sendMessage(
                          //     chatId,
                          //     "🚨 Botni ushbu kanalga administrator sifatida qo'shish kerak. \n\nBotni admin qilib qo'ying va qayta urinib ko'ring."
                          //   );
                          // } else {
                          //   console.log("error");
                          //   console.log(error);
                          // }
                          if (err.response && err.response.statusCode === 400) {
                            console.log("Botni kanalga admin qiling!");
                            console.log("Botni kanalga admin qiling!", err);
                            bot.sendMessage(
                              chatId,
                              "*🚨 Botni ushbu kanalga administrator sifatida qo'shish kerak. \n\nBotni admin qilib qo'ying va qayta urinib ko'ring.*",
                              {
                                parse_mode: "Markdown",
                              }
                            );
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
                  );
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

          // Majburiy kanallarni olish
          db.all(`SELECT * FROM MajburiyKanal`, [], (err, channels) => {
            if (err) {
              console.error("Kanallarni olishda xatolik:", err.message);
              bot.sendMessage(chatId, "Kanallarni olishda xatolik!");
            } else {
              if (channels.length) {
                const inlineButtons = channels.map((channel) => [
                  {
                    text: `${channel.name}`, // Kanal nomini tugma sifatida ko'rsatish
                    callback_data: `remove_channel_${channel.username.replace(
                      "@",
                      "@"
                    )}`, // Kanal username'ini callback_data sifatida o'zlashtirish
                  },
                ]);

                inlineButtons.push([
                  {
                    text: "🔙 Orqaga",
                    callback_data: "majburiyObuna",
                  },
                ]);

                // Inline tugmasi yaratish
                bot.sendMessage(chatId, "Qaysi kanalni o'chirmoqchisiz?", {
                  reply_markup: {
                    inline_keyboard: inlineButtons, // Inline tugmalarni to'g'ri uzatish
                  },
                });
              } else {
                bot.sendMessage(chatId, "*📦 Hech qanday kanal mavjud emas.*", {
                  parse_mode: "Markdown",
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
                });
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
                [{ text: "🎬 Kino", callback_data: "Film" }],
                [
                  { text: "📋 Adminlar", callback_data: "ShowAdmins" },
                  { text: "📢 Kanallar", callback_data: "majburiyObuna" },
                ],
                [
                  { text: "📊 Statistika", callback_data: "stat" },
                  {
                    text: "✉️ Habar yuborish",
                    callback_data: "send_broadcast",
                  },
                ],
                // [],
              ],
            },
          });
          break;
      }
    }
  );
});
