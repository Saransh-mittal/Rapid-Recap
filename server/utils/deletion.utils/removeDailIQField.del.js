const User = require("../../model/userSchema"); // Import the Article model

async function deleteDailIQFieldFromUsers() {
  try {
    const users = await User.find({}); // Find all users
    console.log("Removing dailyIQScores field from users...");
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      user.dailyIQScores = undefined; // Remove the dailyIQScores field
      await user.save(); // Save the updated user
    }
    console.log("dailyIQScores field removed from users successfully.");
  } catch (error) {
    console.error(
      "Error deleting quiz and related records from Article schema:",
      error
    );
  }
}
deleteDailIQFieldFromUsers();
