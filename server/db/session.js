// db/session.js

const mongoose = require("mongoose");

let session;

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
  startSession,
  commitSession,
  abortSession,
  getSession: () => session,
};
