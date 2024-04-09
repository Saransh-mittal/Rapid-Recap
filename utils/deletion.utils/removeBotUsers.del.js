const User = require("../../model/userSchema");
const { progressBar } = require("../../utils/progress");
const deleteUserAndRelatedRecords = require("./removeUser.del");

// Function to delete a user and related records
async function deleteBotUsers() {
  const updateProgress = progressBar(100);
  try {
    // remove user with email email: `dummy${i}@mail.com`
    console.log("Deleting user with email: `dummy${i}@mail.com`...");
    for (let i = 0; i < 100; i++) {
      const user = await User.findOne({ email: `dummy${i}@mail.com` });
      deleteUserAndRelatedRecords(user._id.toString());
      updateProgress();
    }
    console.log("deleted bot users");
  } catch (error) {
    console.error("Error deleting user and related records:", error);
  }
}
deleteBotUsers();
