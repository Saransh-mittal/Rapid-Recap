const { faker } = require("@faker-js/faker");
const User = require("../model/userSchema");
const Activity = require("../model/activitySchema");

const generateMockUser = () => ({
  name: faker.person.firstName(),
  email: faker.internet.email(),
  inGameName: faker.internet.userName(),
  password: faker.internet.password(),
  cpassword: faker.internet.password(),
  verified: faker.datatype.boolean(),
  IQ_score: faker.number.int({ min: 70, max: 160 }),
  prevIQScore: faker.number.int({ min: 70, max: 160 }),
  xp: faker.number.int({ min: 0, max: 1000 }),
  level: faker.number.int({ min: 1, max: 10 }),
  activities: [],
  // Add other necessary fields based on your schema
});

const generateMockActivity = (userId) => ({
  userId,
  type: faker.helpers.arrayElement([
    "Extra opportunity quiz (bonus)",
    "Every random quiz",
    "User spent (min.) 10 min on website in a day",
    "Wise Web expansion",
    "RC purchase (first purchase)",
    "Society or Circle upgrade",
  ]),
  xpAwarded: faker.number.int({ min: 0, max: 100 }),
  timestamp: faker.date.recent(),
});

const seedTestData = async () => {
  console.log("\nSeeding test data...\n");
  //   await mongoose.connect("mongodb://localhost:27017/test", {
  //     useNewUrlParser: true,
  //     useUnifiedTopology: true,
  //   });
  await User.deleteMany({});
  await Activity.deleteMany({});
  console.log("\n Deleted all data\n");
  console.log("\n Creating new data\n");
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = new User(generateMockUser());
    await user.save();
    users.push(user);
  }
  console.log("\n Created new data\n");

  console.log("\n Creating activities\n");
  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      const activity = new Activity(generateMockActivity(user._id));
      await activity.save();
      user.activities.push(activity._id);
    }
    await user.save();
  }

  console.log("\nActivities created successfully!\n");
};

module.exports = seedTestData;
