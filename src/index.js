require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { BOT_TOKEN } = require("./config/env");
const { initDatabase } = require("./database/init");
const { handleMessage } = require("./handlers/messageHandler");
const { handleCallbackQuery } = require("./handlers/callbackHandler");

async function startBot() {
  try {
    // Ma'lumotlar bazasini ishga tushirish
    await initDatabase();
    console.log("Ma'lumotlar bazasi tayyor! ✅");

    // Botni ishga tushirish
    const bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log("Bot faol! 👋");

    // Message handler
    bot.on("message", (msg) => handleMessage(bot, msg));

    // Callback query handler
    bot.on("callback_query", (query) => handleCallbackQuery(bot, query));

    // Xatoliklarni ushla
    bot.on("polling_error", (error) => {
      console.error("Polling xatolik:", error.message);
    });
  } catch (error) {
    console.error("Botni ishga tushirishda xatolik:", error);
    process.exit(1);
  }
}

// Botni ishga tushirish
startBot();
