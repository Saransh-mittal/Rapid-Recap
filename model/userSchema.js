const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
      unique: true,
      required: true,
    },
    phone: {
      type: Number,
    },
    password: {
      type: String,
    },
    cpassword: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    otpCnt: {
      type: Number,
      default: 0,
    },
    otpCntResetTime: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
    },
    googleEmail: {
      type: String,
    },
    quizAttempts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QUIZ_ATTEMPT",
      },
    ],
    IQ_score: {
      type: Number,
      default: 0,
    },
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    bio: {
      type: String,
      default: "",
    },
    inGameName: {
      type: String,
      unique: true,
    },
    dailyIQScores: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DailyIQ",
      },
    ],
    easyQuizCount: {
      type: Number,
      default: 0,
    },
    mediumQuizCount: {
      type: Number,
      default: 0,
    },
    hardQuizCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Users" }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const pass = this.password;
    this.password = await bcrypt.hash(pass, 12);
    this.cpassword = await bcrypt.hash(pass, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    return token;
  } catch (error) {
    console.log(error.message);
  }
};
userSchema.methods.incrementOtpCnt = function () {
  this.otpCnt++;
};
userSchema.methods.resetOtpCnt = function () {
  this.otpCnt = 0;
  this.otpCntResetTime = null;
};

userSchema.methods.setOtpCntResetTime = function () {
  const resetTime = new Date();
  resetTime.setMinutes(resetTime.getMinutes() + 60); // Adjust the time as needed
  this.otpCntResetTime = resetTime;
};

const User = mongoose.model("USER", userSchema);

module.exports = User;
