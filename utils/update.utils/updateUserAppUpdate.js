const updates = require("../../db/updates/updates1.json");
const ApplicationUpdates = require("../../model/applicationUpdatesSchema");
const User = require("../../model/userSchema");
const updateUserAppUpdate = async (inGameName) => {
  try {
    const user = await User.findOne({ inGameName });
    for (let update of updates) {
      const newUpdate = new ApplicationUpdates({
        title: update?.title,
        mainText: update?.mainText,
        img: update?.img,
        userId: user._id,
      });
      await newUpdate.save();
      if (!user.applicationUpdates) {
        user.applicationUpdates = [];
        await user.save();
      }
      user.applicationUpdates.push(newUpdate._id);
      await user.save();
    }
    console.log("User application updates updated");
  } catch (error) {
    console.log(error);
  }
};

updateUserAppUpdate("smash_dev");
