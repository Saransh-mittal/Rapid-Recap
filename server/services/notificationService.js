const webpush = require("web-push");
const Subscription = require("../model/subscriptionSchema");

async function sendNotification(title, body) {
  const subscriptions = await Subscription.find();
  subscriptions.forEach((subscription) => {
    webpush.sendNotification(subscription, JSON.stringify({ title, body }));
  });
}

module.exports = { sendNotification };
