const mongoose = require("mongoose");
const MajburiyKanalSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  id: { type: String, unique: true },
  name: { type: String, unique: true },
});

// username -> @murodillayev_hojiakbar
// Buttonname -> Murodillayev Hojiakbar

module.exports = mongoose.model("MajburiyKanal", MajburiyKanalSchema);
