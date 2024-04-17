const ApplicationUpdates = require("../../model/applicationUpdatesSchema");
const User = require("../../model/userSchema");

const pushUpdates = async (updates) => {
  try {
    const users = await User.find();
    for (let update of updates) {
      for (let user of users) {
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
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  pushUpdates,
};
