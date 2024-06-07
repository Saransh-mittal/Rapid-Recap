const mongoose = require("mongoose");
const seedTestData = require("../scripts/seedTestData");
const { before, after } = require("mocha");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const DB = process.env.TESTDATABASE;

before(async function () {
  // increase timeout for seeding test data
  this.timeout(30000);
  await mongoose.connect(DB);
  console.log("\nDatabase connected\n");
  await seedTestData();
});

after(async function () {
  await mongoose.connection.close();
});
