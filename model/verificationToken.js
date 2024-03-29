const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const verificationSchema = new mongoose.Schema(
    {
      owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
      }
    },
    { collection: "VerificationToken" }
  );

verificationSchema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const pass = this.token;
    this.token = await bcrypt.hash(pass, 12);
    this.ctoken = await bcrypt.hash(pass, 12);
  }
  next();
});

verificationSchema.methods.compareToken = async function (token) {
  try {
    const result = await bcrypt.compare(token, this.token);
    return result;
  } catch (error) {
    console.log(error.message);
  }
};
  
const VerificationToken = mongoose.model("VERIFICATIONTOKEN", verificationSchema);

module.exports = VerificationToken;