const Subscription = require("../model/subscriptionSchema");
const { sendNotification } = require("../services/notificationService");

const subscribe = async (req, res) => {
  const userId = req.user._id;
  try {
    const alreadySubscribed = await Subscription.find({ userId });
    if (alreadySubscribed.length > 0) {
      return res.status(400).json({ message: "Already subscribed" });
    }
    const subscription = new Subscription({
      userId,
      endpoint: req.body.endpoint,
      keys: req.body.keys,
    });
    await subscription.save();

    res.status(201).json({ message: "Subscription successful" });
  } catch (error) {
    res.status(500).json({ message: "Subscription failed" });
    console.error(error);
  }
};

const sendNotify = async (req, res) => {
  try {
    const title = "📢 New Content Alert! 📰";
    const body =
      "Exciting news just in! Explore our latest articles and breaking news updates to stay ahead of the curve. Tap to discover now!";
    const url = "https://cyan-crane-tie.cyclic.app/";
    sendNotification({ title, body, url });
    res.status(200).json({ message: "Notifications sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send notifications" });
    console.error(error);
  }
};

module.exports = { subscribe, sendNotify };
