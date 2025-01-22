const mongoose = require("mongoose");
const MajburiyKanalSchema = new mongoose.Schema({
  Buttonname: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
});

// username -> @murodillayev_hojiakbar
// Buttonname -> Murodillayev Hojiakbar

module.exports = mongoose.model("MajburiyKanal", MajburiyKanalSchema);
