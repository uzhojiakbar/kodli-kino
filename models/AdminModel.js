const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Admin", AdminSchema);
