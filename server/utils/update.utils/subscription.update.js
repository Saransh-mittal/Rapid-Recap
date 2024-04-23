const Subscription = require("../../model/subscriptionSchema");
const User = require("../../model/userSchema");

const subscriptionUpdate = async () => {
  try {
    const subscriptions = await Subscription.find();

    for (let subscription of subscriptions) {
      const user = await User.findOne({ _id: subscription.userId });

      if (!user) {
        console.log(`User with id ${subscription.userId} not found.`);
        continue; // Move to the next subscription
      }
      await Subscription.findByIdAndDelete(subscription._id);
      // Update the subscription's userId with the ObjectId of the user
      const newSubscription = new Subscription({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId: user._id,
      });

      // Save the new subscription
      await newSubscription.save();
    }
    console.log("Subscriptions updated successfully!");
  } catch (error) {
    console.log(error);
  }
};
subscriptionUpdate();
