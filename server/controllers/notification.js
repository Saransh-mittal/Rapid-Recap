const { sendNotification } = require("../services/notificationService");

const notificationNews = async (req, res) => {
  try {
    await sendNotification({
      title:
        "World's biggest nuclear fusion project in trouble, launch pushed back to 2039",
      image:
        "https://www.techspot.com/images2/news/bigimage/2024/07/2024-07-05-image-10.jpg",
      url: "https://www.rapidrecap.co.in/",
      userId: "65f6b9f0ba995a8fd4acee64",
    });
    res.status(200).json({ message: "Notif sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

module.exports = { notificationNews };
