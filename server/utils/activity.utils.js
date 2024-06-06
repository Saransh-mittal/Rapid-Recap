const mongoose = require("mongoose");
const Activity = require("../model/activitySchema");
const User = require("../model/userSchema");

const logActivity = async ({ userId, type, xpAwarded }) => {
  try {
    // Create a new activity
    const activity = new Activity({
      userId,
      type,
      xpAwarded,
      timestamp: new Date(),
    });
    await activity.save();

    // Fetch the user and update xp and level
    const user = await User.findById(userId).exec();
    if (!user) throw new Error("User not found");

    // Use a session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    user.xp += xpAwarded;
    while (user.xp >= user.level * 10) {
      user.xp -= user.level * 10;
      user.level += 1;
    }
    user.activities.push(activity._id);

    await user.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
};

module.exports = { logActivity };
