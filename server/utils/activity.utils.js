const mongoose = require("mongoose");
const Activity = require("../model/activitySchema");
const User = require("../model/userSchema");
const { getXpForActivity } = require("../data/activityTypes");

const logActivity = async ({
  userInGameName,
  type,
  userIQ,
  previousIQ,
  session,
}) => {
  try {
    // console.log(userInGameName);
    const user = await User.findOne({ inGameName: userInGameName }).session(
      session
    );
    //console.log(user);
    if (!user) throw new Error("User not found");

    const xpAwarded = getXpForActivity({
      activityType: type,
      userIQ: userIQ || user.IQ_score,
      previousIQ: previousIQ || user.prevIQScore,
    });

    const activity = new Activity({
      userId: user._id,
      type,
      xpAwarded,
      timestamp: new Date(),
    });

    await activity.save({ session });

    user.xp += xpAwarded;
    let level = user.level;
    const xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2;
    let totalXp = user.xp;
    let leftXp = totalXp - xpBaseAtCurrLevel;

    while (leftXp >= (level + 1) * 10) {
      level++;
      leftXp -= level * 10;
    }

    user.level = level;
    user.activities.push(activity._id);

    await user.save({ session });
  } catch (error) {
    console.error("Error logging activity:", error);
    throw error;
  }
};

module.exports = { logActivity };
