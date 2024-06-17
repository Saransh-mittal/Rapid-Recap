// /scripts/usersUsingApp.js
const mongoose = require("mongoose");
const TimeSpent = require("../model/timeSpentSchema");
const User = require("../model/userSchema");

// Function to get the time spent by users for a given date range
async function getTimeSpentByUsers(startDate, endDate) {
  // Perform the aggregation and convert timeSpent from milliseconds to minutes
  const timeSpentByUsers = await TimeSpent.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $group: {
        _id: "$userId",
        timeSpent: { $sum: { $divide: ["$timeSpent", 60000] } }, // Convert milliseconds to minutes
      },
    },
  ]);

  // Manually populate the results
  const populatedTimeSpentByUsers = await User.populate(timeSpentByUsers, {
    path: "_id",
    select: "name email inGameName",
  });

  return populatedTimeSpentByUsers;
}

// Main function to view users' time spent for different date ranges or all time
async function usersUsingApp(startDate = null, endDate = null) {
  if (!startDate) {
    // No start date specified, so get data from the beginning of time
    startDate = new Date(0); // Epoch time
  }
  if (!endDate) {
    // No end date specified, so get data up to now
    endDate = new Date();
  }

  // Get the time spent by users for the specified date range
  const populatedTimeSpentByUsers = await getTimeSpentByUsers(
    startDate,
    endDate
  );

  console.log(populatedTimeSpentByUsers);
}

// Example usage:
// View users' time spent for a specific date range
const startDate = new Date("2024-06-16T00:00:00Z"); // ISO 8601 format
const endDate = new Date("2024-06-16T23:59:59Z"); // ISO 8601 format
usersUsingApp(startDate, endDate).catch((err) => console.error(err));

// View users' time spent for all time
// usersUsingApp().catch((err) => console.error(err));
