require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const TelegramBot = require("node-telegram-bot-api");
const { subscribeCheck } = require("./commands/SubscribeCheck");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log("Bot faol! 👋");
const callbackIds = {};
const adminId = 7935730795; // adminning ID sini bu yerga yozing

const db = new sqlite3.Database("./db/kinobotali.db", (err) => {
  if (err) {
    console.error("Bazaga ulanishda xatolik:", err.message);
  } else {
    console.log("SQLite3 bazasi ulandi ✅");

    // Users jadvali yaratish
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY, 
        userId TEXT UNIQUE, 
        count INTEGER DEFAULT 0,
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
        id INTEGER PRIMARY KEY, 
        adminId TEXT UNIQUE NOT NULL
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

// Xabarlarni qayta ishlash
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userInput = msg.text;

  bot.sendMessage(chatId, "FAOl");
});
