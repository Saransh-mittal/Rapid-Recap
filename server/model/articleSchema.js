const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    dateTime: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: "Rapid Recap Team",
    },

    title: {
      type: String,
      required: true,
    },

    mainText: {
      type: String,
      required: true,
    },

    imgURL: [
      {
        type: String,
        required: true,
      },
    ],
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QUIZ",
    },
    userQuizStatus: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "USER",
        },
        status: {
          type: Boolean,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: true,
      default: "General",
    },
  },
  { collection: "Articles" }
);

articleSchema.pre("save", function (next) {
  if (this.author === null) {
    this.author = "Rapid Recap Team";
  }
  next();
});

const Article = mongoose.model("ARTICLE", articleSchema);

module.exports = Article;
