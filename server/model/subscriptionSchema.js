const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: mongoose.Schema.Types.Mixed,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
