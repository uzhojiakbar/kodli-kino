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
  console.log(subscribed);

  // const isAdmin = true;

  const isAdmin =
    (await AdminModel.findOne({ adminId: chatId.toString() })) !== null;

  if (!subscribed) {
  } else {
    if (isAdmin) {
      await AdminPanel(bot, msg);
    } else {
      await bot.sendMessage(chatId, "SIZNING IDYINGIZ: " + chatId);
    }
  }

  console.log(chatId);
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "check_subscription") {
    if (await subscribeCheck(bot, chatId)) {
      bot.sendMessage(
        chatId,
        "Rahmat! Siz endi botdan to'liq foydalanishingiz mumkin. /start"
      );
    } else {
      bot.sendMessage(
        chatId,
        "Siz hali hamma kanallarga a'zo bo'lmagansiz. Iltimos, barcha kanallarga a'zo bo'ling va yana tekshiring."
      );
    }
  }
});

// bot.
