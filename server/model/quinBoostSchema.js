const mongoose = require("mongoose");

const quinBoostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ARTICLE",
  },
  boost: {
    type: Number,
    default: 1.5,
  },
  quizCount: {
    type: Number,
    default: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QuinBoost = mongoose.model("QUIN_BOOST", quinBoostSchema);
module.exports = QuinBoost;
