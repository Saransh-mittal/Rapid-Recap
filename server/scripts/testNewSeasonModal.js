const User = require("../model/userSchema");

const testNewSeasonModal = async () => {
  try {
    const user = await User.findOne({ inGameName: "Smash_dev_ultrA" });
    user.newSeasonModal = true;
    user.newSeasonModalUpdateAt = Date.now();
    await user.save();

    console.log("New season modal updated successfully.");
  } catch (error) {
    console.log(error);
  }
};

testNewSeasonModal();
