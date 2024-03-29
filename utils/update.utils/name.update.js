const User = require("../../model/userSchema");
const { progressBar } = require("../progress");

async function updateUserName() {
  try {
    const users = await User.find({});
    const updateProgress = progressBar(users.length);
    for (let u of users) {
      const user = await User.findById(u._id);
      user.name = user.firstName + " " + user.lastName;
      user.firstName = undefined;
      user.lastName = undefined;
      await user.save();
      updateProgress();
    }
  } catch (error) {
    console.log(error.message);
  }
}

updateUserName();
