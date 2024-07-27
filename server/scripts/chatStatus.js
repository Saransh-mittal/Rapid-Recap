const Chat = require("../model/chatSchema");

const chatStatus = async () => {
  try {
    // update all chats with status accepted whose statuses are null or not defined etc.
    await Chat.updateMany(
      { status: { $exists: false } },
      { $set: { status: "accepted" } }
    );
    console.log("Chats status updated");
  } catch (error) {
    console.log(error);
  }
};

chatStatus();
