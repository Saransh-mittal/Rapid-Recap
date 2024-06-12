const { sendNotification } = require("../services/notificationService");

const notificationNews = async (req, res) => {
  try {
    await sendNotification({
      title: "asdfvbnm dfgh sdf",
      body: "asdfghjkl",
      image:
        "https://res.cloudinary.com/dxstsrnbs/image/upload/v1718001191/updates/vqcxacjn0pwpavmyoflu.jpg",
      url: "https://www.rapidrecap.co.in/",
    });
    res.status(200).json({ message: "Notif sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

module.exports = { notificationNews };
