const mongoose = require("mongoose");
const Activity = require("../model/activitySchema");
const User = require("../model/userSchema");
const { getXpForActivity } = require("../data/activityTypes");

const logActivity = async ({ userId, type, userIQ, previousIQ }) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const xpAwarded = getXpForActivity({
      activityType: type,
      userIQ: userIQ || user.IQ_score,
      previousIQ: previousIQ || user.prevIQScore,
    });
    // Create a new activity
    const activity = new Activity({
      userId,
      type,
      xpAwarded,
      timestamp: new Date(),
    });
    await activity.save();

    // Fetch the user and update xp and level

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
