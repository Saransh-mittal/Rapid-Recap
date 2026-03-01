
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const PlaySession = require('./model/quickClashSchemas/playSessionSchema');

async function checkLatestSession() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected to DB');

    const session = await PlaySession.findOne().sort({ createdAt: -1 });
    if (session) {
      console.log('Latest Session ID:', session.sessionId);
      console.log('Created At:', session.createdAt);
      console.log('Tutorial Progress:', session.tutorialProgress);
    } else {
      console.log('No sessions found');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkLatestSession();
