const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const {
  connectDB,
  disconnectDB,
  startSession,
  commitSession,
  abortSession,
} = require("./setup");
const { logActivity } = require("../utils/activity.utils");
const User = require("../model/userSchema");
const Activity = require("../model/activitySchema");
const seedTestData = require("../scripts/seedTestData");
const CircleAndSocietyData = require("../data/CircleAndSocietyData");
const { activityTypes } = require("../data/activityTypes");

describe("logActivity", function () {
  let expect;
  before(async function () {
    this.timeout(30000); // Increase timeout for setup
    await connectDB();
    await seedTestData();
    // dynamically import chai
    ({ expect } = await import("chai"));
  });

  after(async () => {
    await disconnectDB();
  });

  it("should log activity and award XP correctly", async function () {
    this.timeout(10000); // Increase timeout for this test
    const session = await startSession();

    const user = new User({
      name: faker.person.firstName(),
      email: faker.internet.email(),
      inGameName: faker.internet.userName(),
      password: faker.internet.password(),
      cpassword: faker.internet.password(),
      IQ_score: 130,
      prevIQScore: 120,
      xp: 581,
      level: 10,
      activities: [],
    });
    await user.save({ session });

    await logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
      userIQ: user.IQ_score,
      previousIQ: user.prevIQScore,
      session,
    });

    await commitSession();

    const updatedUser = await User.findOne({ inGameName: user.inGameName });
    expect(updatedUser.xp).to.equal(821);
    expect(updatedUser.level).to.equal(12);
    expect(updatedUser.activities).to.have.lengthOf(1);

    const savedActivity = await Activity.findOne({ userId: user._id });
    expect(savedActivity).to.exist;
    expect(savedActivity.type).to.equal("Society or Circle upgrade");
    expect(savedActivity.xpAwarded).to.equal(240);
  });

  it("should throw an error if user is not found", async function () {
    this.timeout(5000); // Increase timeout for this test
    const session = await startSession();

    try {
      await logActivity({
        userInGameName: faker.internet.userName(),
        type: "Random activity",
        session,
      });
      await commitSession();
      throw new Error("Expected logActivity to throw an error, but it didn't.");
    } catch (error) {
      await abortSession();
      expect(error.message).to.equal("User not found");
    }
  });

  it("should correctly award XP for each activity type", async function () {
    this.timeout(10000); // Increase timeout for this test
    for (const key in activityTypes) {
      if (activityTypes.hasOwnProperty(key)) {
        const session = await startSession();
        const activity = activityTypes[key];
        const user = new User({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          inGameName: faker.internet.userName(),
          password: faker.internet.password(),
          cpassword: faker.internet.password(),
          IQ_score: 130,
          prevIQScore: 120,
          xp: 0,
          level: 1,
          activities: [],
        });
        await user.save({ session });

        await logActivity({
          userInGameName: user.inGameName,
          type: activity.type,
          session,
        });

        await commitSession();

        const updatedUser = await User.findOne({ inGameName: user.inGameName });
        const savedActivity = await Activity.findOne({ userId: user._id });

        expect(savedActivity).to.exist;
        expect(savedActivity.type).to.equal(activity.type);

        if (activity.type === activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type) {
          // Check specific logic for Society or Circle upgrade
          expect(savedActivity.xpAwarded).to.be.a("number");
        } else {
          expect(updatedUser.xp).to.equal(activity.xp);
        }

        await User.deleteMany({});
        await Activity.deleteMany({});
      }
    }
  });

  it("should correctly award XP for Society or Circle upgrade with edge cases", async function () {
    this.timeout(10000); // Increase timeout for this test
    const session = await startSession();
    //await seedTestData(session);

    const user = new User({
      name: faker.person.firstName(),
      email: faker.internet.email(),
      inGameName: faker.internet.userName(),
      password: faker.internet.password(),
      cpassword: faker.internet.password(),
      IQ_score: 150,
      prevIQScore: 110,
      xp: 0,
      level: 1,
      activities: [],
    });
    await user.save({ session });

    await logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
      userIQ: user.IQ_score,
      previousIQ: user.prevIQScore,
      session,
    });

    await commitSession();

    const updatedUser = await User.findOne({ inGameName: user.inGameName });
    const savedActivity = await Activity.findOne({ userId: user._id });

    const expectedXP = CircleAndSocietyData.reduce((totalXp, society) => {
      if (
        user.prevIQScore < society.IQ_Lower &&
        user.IQ_score >= society.IQ_Lower
      ) {
        totalXp += society.xp;
      }
      return totalXp;
    }, 0);

    expect(savedActivity).to.exist;
    expect(savedActivity.type).to.equal("Society or Circle upgrade");
    expect(savedActivity.xpAwarded).to.equal(expectedXP);
    expect(updatedUser.xp).to.equal(expectedXP);
  });
});
