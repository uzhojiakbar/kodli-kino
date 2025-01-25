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

const sendFilmByCode = (chatId, userInput) => {
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
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  addUserIfNotExists(chatId);

  subscribeCheck(bot, chatId, db).then((subscribed) => {
    db.get(
      `SELECT * FROM admins WHERE adminId = ?`,
      [chatId.toString()],
      (err, isAdmin) => {
        if (err) {
          console.error("Adminni tekshirishda xatolik:", err.message);
          return;
        }

        const isAdminId = isAdmin?.adminId == chatId;

        if (!subscribed) {
          // Obuna bo`lmasa
          bot.sendMessage(chatId, "<b>Obunani tasdiqlang!</b>", {
            parse_mode: "HTML",
          });
          return;
        }

        if (isAdminId) {
          if (/^\d+$/.test(userInput)) {
            sendFilmByCode(chatId, userInput);
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
            sendFilmByCode(chatId, userInput);
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
        //
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
