const Subscription = require("../model/subscriptionSchema");
const User = require("../model/userSchema");

const usersEnabledNotifs = async () => {
  try {
    const subscriptions = await Subscription.find({}).select("userId");
    let usersEnabled = [];
    for (let subscription of subscriptions) {
      const user = await User.findById(subscription.userId).select(
        "inGameName email name"
      );
      if (!user) continue;

      if (usersEnabled.find((u) => u.email === user.email)) continue;
      usersEnabled.push(user);
    }

    let usersDisabled = [];
    const allUsers = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      inGameName: { $exists: true },
    }).select("inGameName email name");

    for (let user of allUsers) {
      if (!usersEnabled.find((u) => u.email === user.email)) {
        usersDisabled.push(user);
      }
    }

    return {
      usersEnabled,
      usersDisabled,
      totalEnabled: usersEnabled.length,
      totalDisabled: usersDisabled.length,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { usersEnabledNotifs };
