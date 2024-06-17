// /scripts/usersLastLoggedInStats.js
const User = require("../model/userSchema");

async function getUsersWithLastLoginAfter(date) {
  try {
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format provided.");
    }

    // Find users with lastLogin greater than the specified date and select the required fields
    const users = await User.find(
      { lastLogin: { $gt: date } },
      "name email inGameName lastLogin"
    );

    // Log the retrieved users
    console.log(users);
  } catch (err) {
    console.error(err);
  }
}

const specifiedDate = new Date("2024-06-14T00:00:00Z"); // Corrected date format

getUsersWithLastLoginAfter(specifiedDate).catch((err) => console.error(err));
