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
    hindiAuthor: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    hindiTitle: {
      type: String,
      default: "",
    },
    mainText: {
      type: String,
      required: true,
    },
    hindiMainText: {
      type: [
        {
          type: String,
        },
      ],
      default: [],
    },

    imgURL: [
      {
        type: String,
      },
    ],
    quiz: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "QUIZ",
        },
      ],
      default: [],
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
    relatedArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ARTICLE",
      },
    ],
    avgReadTime: {
      type: Number,
    },
  },
  { collection: "Articles" }
);

articleSchema.index({ title: 1 }, { unique: true });
articleSchema.index({ dateTime: 1 });
articleSchema.pre("save", function (next) {
  if (this.author === null) {
    this.author = "Rapid Recap Team";
  }
  next();
});

const Article = mongoose.model("ARTICLE", articleSchema);

module.exports = Article;
