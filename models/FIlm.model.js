const mongoose = require("mongoose");
const FilmSchema = new mongoose.Schema({
  postId: { type: String, required: true, unique: true },
  videoHash: { type: String, required: true },
  count: { type: Number },
  code: { type: Number, required: true, unique: true },
});

// username -> @murodillayev_hojiakbar
// Buttonname -> Murodillayev Hojiakbar

module.exports = mongoose.model("Film", FilmSchema);
