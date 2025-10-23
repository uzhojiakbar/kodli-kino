require("dotenv").config();

module.exports = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
  CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
  DB_PATH: process.env.dbPath || "./bot.db",
  ADMIN_ID: process.env.ADMIN_ID || 7935730795,
};
