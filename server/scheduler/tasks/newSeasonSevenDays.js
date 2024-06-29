const User = require("../../model/userSchema");

async function resetNewSeasonModal() {
  try {
    await User.updateMany(
      {
        inGameName: "Smash_dev_ultrA",
        newSeasonModal: true,
      },
      { newSeasonModal: false }
    );
    console.log(
      "Updated newSeasonModal for users who had it set for more than 7 days."
    );
  } catch (error) {
    console.error("Error updating newSeasonModal:", error);
  }
}

module.exports = resetNewSeasonModal;
