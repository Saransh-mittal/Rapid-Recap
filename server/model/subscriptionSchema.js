const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: mongoose.Schema.Types.Mixed,
  userId: { type: String, required: true },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
