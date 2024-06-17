// /scripts/usersLastLoggedInStats.js
const User = require("../model/userSchema");

async function usersWithLastLoginAfter(date) {
  try {
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format provided.");
    }
    // Find users with lastLogin greater than the specified date and select the required fields
    const users = await User.find(
      { lastLogin: { $gte: date } },
      "name email inGameName lastLogin"
    );

    // Log the retrieved users
    return users;
  } catch (err) {
    console.error(err);
  }
}

module.exports = { usersWithLastLoginAfter };
