const webpush = require("web-push");
const Subscription = require("../model/subscriptionSchema");

async function sendNotification({ title, body, icon, url }) {
  try {
    const subscriptions = await Subscription.find();
    subscriptions.forEach((subscription) => {
      webpush.sendNotification(
        subscription,
        JSON.stringify({ title, body, icon, url })
      );
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = { sendNotification };
