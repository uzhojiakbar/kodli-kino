const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  joinedAt: { type: Date, default: Date.now }, // Foydalanuvchi qo'shilgan sana
});

module.exports = mongoose.model("User", UserSchema);
