const User = require("../model/userSchema");

const testNewSeasonModal = async () => {
  try {
    // const user = await User.findOne({ inGameName: "smash_dev" });
    // user.newSeasonModal = true;
    // user.newSeasonModalUpdateAt = Date.now();
    // await user.save();
    await User.updateMany(
      {},
      { newSeasonModal: true, newSeasonModalUpdateAt: Date.now() }
    );

    console.log("New season modal updated successfully.");
  } catch (error) {
    console.log(error);
  }
};

testNewSeasonModal();
