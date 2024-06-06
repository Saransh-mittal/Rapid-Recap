const mongoose = require("mongoose");
const TimeSpent = require("../model/timeSpentSchema");
const { logActivity } = require("../utils/activity.utils");
const activityTypes = { TIME_SPENT: "TIME_SPENT" }; // Define activity types if not already defined

const timeSpent = async (req, res) => {
  try {
    const { userId, articleId, timeSpent } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ error: "Invalid userId" });
    }
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).send({ error: "Invalid articleId" });
    }
    if (typeof timeSpent !== "number" || timeSpent <= 0) {
      return res.status(400).send({ error: "Invalid timeSpent" });
    }

    // Create and save the timeSpent entry
    const timeEntry = new TimeSpent({ userId, articleId, timeSpent });
    await timeEntry.save();

    // Award XP if time spent is >= 10 minutes (10 * 60 * 1000 milliseconds)
    if (timeSpent >= 10 * 60 * 1000) {
      await logActivity({
        userId,
        type: activityTypes.TIME_SPENT,
        xpAwarded: 10,
      });
    }

    res.status(201).send(timeEntry);
  } catch (error) {
    console.error("Error recording time spent:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

module.exports = { timeSpent };
