const configService = require("../configService");
const SeasonData = require("../model/seasonDataSchema");
const User = require("../model/userSchema");

const updateUsersCurrentSeason = async () => {
  try {
    // await User.updateMany(
    //   {},
    //   { currentSeason: parseInt(configService.getCurrentSeason(), 10) }
    // );
    // console.log("Users current season updated successfully");
    const users = await User.find({ IQ_score: 0 });
    for (let user of users) {
      const seasonData = await SeasonData.findOne({
        userId: user._id,
        season: 1,
      }).select("_id");
      if (!seasonData) {
        continue;
      }
      if (user.previousSeasonData.includes(seasonData._id)) {
        continue;
      }
      user.previousSeasonData.push(seasonData._id);
      await user.save();
    }
    console.log("Users previous season data updated successfully");
  } catch (error) {
    console.log(error);
  }
};

updateUsersCurrentSeason();
