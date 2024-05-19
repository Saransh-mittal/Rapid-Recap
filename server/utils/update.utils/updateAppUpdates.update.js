const ApplicationUpdates = require("../../model/applicationUpdatesSchema");
const { progressBar } = require("../progress.utils");

const updateAppUpdates = async (title) => {
  try {
    const updates = await ApplicationUpdates.find({ title });
    const mainText =
      "We have added new search buttons to the Leaderboard page. Now you can search for leaders in different societies. Give it a try!";
    //console.log("updates:", updates);
    const progress = progressBar(updates.length);
    for (const update of updates) {
      update.mainText = mainText;
      await update.save();
      progress();
    }
    console.log("App updates updated successfully!");
  } catch (error) {
    console.error("Error updating app updates:", error);
  }
};

updateAppUpdates("Society Search Buttons");
