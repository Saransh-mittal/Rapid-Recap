const Subscription = require("../model/subscriptionSchema");
const { sendNotification } = require("../services/notificationService");

const subscribe = async (req, res) => {
  const userId = req.user._id;
  try {
    // Check if subscription already exists for the user and endpoint
    const existingSubscription = await Subscription.findOne({
      userId,
      endpoint: req.body.endpoint,
    });

    if (existingSubscription) {
      // If a subscription already exists for the same user and endpoint, return a conflict response
      return res.status(409).json({ message: "Subscription already exists" });
    }

    // If no existing subscription found, create a new one
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
    const url = "http://localhost:5173/";
    sendNotification({ title, body, url });
    res.status(200).json({ message: "Notifications sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send notifications" });
    console.error(error);
  }
};

module.exports = { subscribe, sendNotify };
