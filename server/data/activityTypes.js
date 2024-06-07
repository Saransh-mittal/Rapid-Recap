const CircleAndSocietyData = require("./CircleAndSocietyData");
const activityTypes = {
  QUIZ_BONUS: { type: "Extra opportunity quiz (bonus)", xp: 10 },
  RANDOM_QUIZ: { type: "Every random quiz", xp: 5 },
  TIME_SPENT: { type: "User spent (min.) 10 min on website in a day", xp: 10 },
  WISE_WEB_EXPANSION: { type: "Wise Web expansion", xp: 10 },
  RC_PURCHASE: { type: "RC purchase (first purchase)", xp: 50 },
  SOCIETY_OR_CIRCLE_UPGRADE: { type: "Society or Circle upgrade" },
};

const getXpForActivity = ({ activityType, userIQ, previousIQ = 0 }) => {
  const activityKey = Object.keys(activityTypes).find(
    (key) => activityTypes[key].type === activityType
  );

  if (!activityKey) {
    throw new Error(`Unknown activity type: ${activityType}`);
  }

  if (activityType === activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type) {
    if (userIQ === undefined || userIQ === null) {
      throw new Error(
        "userIQ is required for society or circle upgrade activities"
      );
    }

    let totalXp = 0;
    for (let society of CircleAndSocietyData) {
      // if (
      //   userIQ >= society.IQ_Lower &&
      //   (society.IQ_Upper === null || userIQ < society.IQ_Upper)
      // ) {
      //   if (previousIQ < society.IQ_Lower) {
      //     totalXp += society.xp;
      //   }
      // }
      if (previousIQ < society.IQ_Lower && userIQ >= society.IQ_Lower) {
        totalXp += society.xp;
      }
    }
    return totalXp;
  }

  return activityTypes[activityKey] ? activityTypes[activityKey].xp : 0;
};
module.exports = { activityTypes, getXpForActivity };
