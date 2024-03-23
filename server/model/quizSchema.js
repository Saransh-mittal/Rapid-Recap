const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ARTICLE",
  },
  para1: {
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          a: {
            type: String,
          },
          b: {
            type: String,
          },
          c: {
            type: String,
          },
          d: {
            type: String,
          },
        },
        answer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
        },
        difficulty: {
          type: String,
          required: true,
        },
      },
    ],
  },
  para2: {
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          a: {
            type: String,
          },
          b: {
            type: String,
          },
          c: {
            type: String,
          },
          d: {
            type: String,
          },
        },
        answer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
        },
        difficulty: {
          type: String,
          required: true,
        },
      },
    ],
  },
  para3: {
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          a: {
            type: String,
          },
          b: {
            type: String,
          },
          c: {
            type: String,
          },
          d: {
            type: String,
          },
        },
        answer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
        },
        difficulty: {
          type: String,
          required: true,
        },
      },
    ],
  },
  overAllDifficulty: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Quiz = mongoose.model("QUIZ", quizSchema);

module.exports = Quiz;
