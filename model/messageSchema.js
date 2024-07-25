const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");

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
      enum: ["text", "article_card", "score_card", "system"],
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

// Encryption key (store this securely, e.g., in environment variables)

// Encrypt the message content before saving
messageSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    if (this.content === "" || !this.content) {
      return next();
    }
    const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
    this.content = CryptoJS.AES.encrypt(
      this.content,
      ENCRYPTION_KEY
    ).toString();
  }
  next();
});

// Method to decrypt the message content
messageSchema.methods.decryptContent = function () {
  if (this.content === "" || !this.content) {
    return "";
  }
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  const bytes = CryptoJS.AES.decrypt(this.content, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
