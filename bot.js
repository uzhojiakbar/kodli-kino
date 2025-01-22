// .env dan malumotlarni o'qish
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const AdminModel = require("./models/AdminModel");
const { subscribeCheck } = require("./commands/SubscribeCheck");
const { AdminPanel } = require("./commands/adminpanel");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
console.log("Bot faol! 👋");

// MANGODB ga ulanish
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB ga ulandi ✅"))
  .catch((err) => console.error("DB GA ULANISHDA XATOLIK BOR: ❌", err));

// BEGIN

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  const subscribed = await subscribeCheck(bot, chatId);

  // const isAdmin = true;

  const isAdmin =
    (await AdminModel.findOne({ adminId: chatId.toString() })) !== null;

  if (isAdmin) {
    await AdminPanel(bot, msg);
  } else {
    await bot.sendMessage(chatId, "SIZNING IDYINGIZ: " + chatId);
  }

  console.log(chatId);
});

// bot.
