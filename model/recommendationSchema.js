const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  recommendations: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ARTICLE",
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      served: {
        type: Boolean,
        default: false,
      },
      notified: {
        type: Boolean,
        default: false,
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  isUpdating: {
    type: Boolean,
    default: false,
  },
});

const notifiedArticlesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  notified_articles: [
    {
      article_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ARTICLE",
        required: true,
      },
      notified_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
const NotifiedArticles = mongoose.model(
  "NotifiedArticles",
  notifiedArticlesSchema
);

module.exports = { Recommendation, NotifiedArticles };
