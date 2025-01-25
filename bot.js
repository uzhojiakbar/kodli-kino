require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const TelegramBot = require("node-telegram-bot-api");
const { subscribeCheck } = require("./commands/SubscribeCheck");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log("Bot faol! 👋");
const callbackIds = {};
const adminId = 7935730795; // adminning ID sini bu yerga yozing

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

  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) {
      console.error("users olishda xatolik:", err.message);
    } else {
      console.log("users:", rows);
    }
  });

  db.all(`SELECT * FROM admins`, (err, rows) => {
    if (err) {
      console.error("admins olishda xatolik:", err.message);
    } else {
      console.log("admins:", rows);
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
        console.log(chatId, isAdmin);
        // console.log();

        if (err) {
          console.error("Adminni tekshirishda xatolik:", err.message);
          return;
        }
      }
    );
  });

  bot.sendMessage(chatId, "FAOl");
});
