const configService = require("../configService");
const User = require("../model/userSchema");

const updateUsersCurrentSeason = async () => {
  try {
    await User.updateMany(
      {},
      { currentSeason: parseInt(configService.getCurrentSeason(), 10) }
    );
    console.log("Users current season updated successfully");
  } catch (error) {
    console.log(error);
  }
};

updateUsersCurrentSeason();
