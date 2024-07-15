const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "USER" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "USER" }],
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "USER" }],
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read"],
      default: "sending",
    },
    permanentDeleteFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "USER" }],
    type: {
      type: String,
      enum: ["text", "article_card", "score_card"],
      default: "text",
    },
    article: {
      type: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "ARTICLE" },
        title: { type: String },
        category: { type: String },
        date: { type: String },
        image: { type: String },
      },
      default: null,
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "USER" },
        emoji: String,
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
