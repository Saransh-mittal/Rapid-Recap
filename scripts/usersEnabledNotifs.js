const Subscription = require("../model/subscriptionSchema");
const User = require("../model/userSchema");

const usersEnabledNotifs = async () => {
  try {
    const subscriptions = await Subscription.find({}).select("userId");
    let users = [];
    for (let subscription of subscriptions) {
      const user = await User.findById(subscription.userId).select(
        "inGameName email"
      );
      if (!user) continue;

      if (users.find((u) => u.email === user.email)) continue;
      //   console.log(user);
      users.push(user);
    }
    let usersDisabledNotifs = [];
    const allUsers = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      inGameName: { $exists: true },
    }).select("inGameName email");

    for (let user of allUsers) {
      //   console.log(user);
      if (!users.find((u) => u.email === user.email)) {
        usersDisabledNotifs.push(user);
      }
    }
    console.log("Users with disabled notifications:");
    console.log(usersDisabledNotifs);
    console.log(
      "Total users with disabled notifications:",
      usersDisabledNotifs.length
    );
  } catch (error) {
    console.log(error);
  }
};

usersEnabledNotifs();
