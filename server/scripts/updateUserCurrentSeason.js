const configService = require("../configService");
const User = require("../model/userSchema");

const updateUsersCurrentSeason = async () => {
  try {
    await User.updateMany(
      {},
      { currentSeason: configService.getCurrentSeason() }
    );
    console.log("Users current season updated successfully");
  } catch (error) {
    console.log(error);
  }
};

updateUsersCurrentSeason();
