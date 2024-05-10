const webpush = require("web-push");
const Subscription = require("../model/subscriptionSchema");

async function sendNotification({ title, body, icon, url }) {
  try {
    const subscriptions = await Subscription.find();
    // subscriptions.forEach((subscription) => {
    //   webpush.sendNotification(
    //     subscription,
    //     JSON.stringify({ title, body, icon, url })
    //   );
    // });
    for (let subscription of subscriptions) {
      try {
        webpush.sendNotification(
          subscription,
          JSON.stringify({ title, body, icon, url })
        );
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendNotification };
