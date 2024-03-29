const User = require("../../model/userSchema");
const { progressBar } = require("../progress");

async function updateUserQuizCount() {
  console.log("Updating quiz count for users");
  const users = await User.find({});
  const updateProgress = progressBar(users.length);
  for (let u of users) {
    const user = await User.findById(u._id).populate("quizAttempts");

    let easyQuizCount = 0;
    let mediumQuizCount = 0;
    let hardQuizCount = 0;
    const quizAttempts = user.quizAttempts;
    for (let i = 0; i < quizAttempts.length; i++) {
      if (quizAttempts[i].articleDifficulty < 0.5) easyQuizCount++;
      else if (quizAttempts[i].articleDifficulty < 0.7) mediumQuizCount++;
      else hardQuizCount++;
    }
    user.easyQuizCount = easyQuizCount;
    user.hardQuizCount = hardQuizCount;
    user.mediumQuizCount = mediumQuizCount;
    await user.save();
    updateProgress();
  }
  console.log("Quiz count updated successfully.");
}

updateUserQuizCount();
