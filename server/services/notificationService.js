const webpush = require("web-push");
const Subscription = require("../model/subscriptionSchema");

async function sendNotification({
  title,
  body,
  icon,
  url,
  image,
  userId,
  messageId,
}) {
  try {
    const subscriptions = await Subscription.find({ userId });
    for (let subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({ title, body, icon, url, image, messageId })
        );
      } catch (error) {
        if (error.statusCode === 410) {
          // Subscription has expired or is no longer valid, remove it from the database
          await Subscription.deleteOne({ _id: subscription._id });
          console.log(`Deleted subscription ${subscription._id}`);
        } else {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendNotification };
