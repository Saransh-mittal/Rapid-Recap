const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

let session;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.TESTDATABASE);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    // await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Database disconnection failed:", error);
    process.exit(1);
  }
};

const startSession = async () => {
  session = await mongoose.startSession();
  session.startTransaction();
  return session;
};

const commitSession = async () => {
  if (session) {
    await session.commitTransaction();
    session.endSession();
  }
};

const abortSession = async (session) => {
  if (session && session.inTransaction()) {
    await session.abortTransaction();
    session.endSession();
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  startSession,
  commitSession,
  abortSession,
  getSession: () => session,
};
