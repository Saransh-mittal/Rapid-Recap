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
const DailyIQ = require("../model/dailyIQSchema");
const {
  updateUsersExperienceLevel,
} = require("../utils/update.utils/userExperienceLevel.update");
const QuizAttempt = require("../model/quizAttemptSchema");

describe("logActivity", function () {
  let expect;
  before(async function () {
    this.timeout(400000); // Increase timeout for setup
    await connectDB();
    //await seedTestData();
    // dynamically import chai
    ({ expect } = await import("chai"));
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Activity.deleteMany({});
    await DailyIQ.deleteMany({});
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
    await commitSession(session);
    //console.log(user.inGameName);
    await logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
      userIQ: user.IQ_score,
      previousIQ: user.prevIQScore,
    });

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

    try {
      await logActivity({
        userInGameName: faker.internet.userName(),
        type: "Random activity",
      });
      throw new Error("Expected logActivity to throw an error, but it didn't.");
    } catch (error) {
      expect(error.message).to.equal("User not found");
    }
  });

  it("should correctly award XP for each activity type", async function () {
    this.timeout(20000); // Increase timeout for this test
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
        await commitSession(session);
        await logActivity({
          userInGameName: user.inGameName,
          type: activity.type,
          previousIQ: user.prevIQScore,
          userIQ: user.IQ_score,
        });

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
    this.timeout(20000); // Increase timeout for this test
    const session = await startSession();

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
    await commitSession(session);
    await logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
      userIQ: user.IQ_score,
      previousIQ: user.prevIQScore,
    });

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

  it("should handle race conditions correctly", async function () {
    this.timeout(60000); // Increase timeout for this test
    const initialSession = await startSession();

    // Create a user
    const user = new User({
      name: faker.person.firstName(),
      email: faker.internet.email(),
      inGameName: faker.internet.userName(),
      password: faker.internet.password(),
      cpassword: faker.internet.password(),
      IQ_score: 120,
      prevIQScore: 100,
      xp: 0,
      level: 0,
      activities: [],
    });
    await user.save({ session: initialSession });

    await commitSession(initialSession);

    // Function to log an activity
    const logRandomActivity = async () => {
      try {
        await logActivity({
          userInGameName: user.inGameName,
          type: activityTypes.RANDOM_QUIZ.type,
        });
      } catch (error) {
        throw error;
      }
    };

    // Create multiple concurrent logActivity calls
    const concurrentLogs = Array(10)
      .fill()
      .map(() => logRandomActivity());

    // Wait for all logActivity calls to complete
    await Promise.all(concurrentLogs);

    // Verify the user's XP and level
    const updatedUser = await User.findOne({ inGameName: user.inGameName });
    const expectedXP = 10 * activityTypes.RANDOM_QUIZ.xp; // 10 concurrent logs
    const expectedLevel = 2; // Level up logic

    expect(updatedUser.xp).to.equal(expectedXP);
    expect(updatedUser.level).to.equal(expectedLevel);
    expect(updatedUser.activities).to.have.lengthOf(10);
  });

  it("should update experience levels for all users correctly given IQs and quizAttempts", async function () {
    this.timeout(120000); // Increase timeout for the test

    // Create 10 test users and their IQ history and quiz attempts
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = new User({
        name: faker.person.firstName(),
        email: faker.internet.email(),
        inGameName: faker.internet.userName(),
        password: faker.internet.password(),
        cpassword: faker.internet.password(),
        IQ_score: 0,
        prevIQScore: 0,
        xp: 0,
        level: 0,
        activities: [],
        quizAttempts: [],
      });
      await user.save();
      users.push(user);

      // Create IQ history for each user
      let previousIQ = 0;

      for (let j = 0; j < 5; j++) {
        const iqScore = previousIQ + 10 + Math.floor(Math.random() * 10);
        const dailyIQ = new DailyIQ({
          user: user._id,
          IQ_score: iqScore,
          dailyRank: "Rank" + j,
        });
        await dailyIQ.save();
        if (j === 4) {
          user.IQ_score = iqScore;
          user.prevIQScore = previousIQ;
          await user.save();
        }
        previousIQ = iqScore;
      }

      // Create quiz attempts for each user
      for (let j = 0; j < 5; j++) {
        const quizAttempt = new QuizAttempt({
          user: user._id,
          article: new mongoose.Types.ObjectId(),
          quiz: new mongoose.Types.ObjectId(),
          responses: [],
          RQM_score: 10,
          articleDifficulty: 3,
          userPercentile: 50,
          timeTaken: 120,
          isBoosted: false,
          boost: 1,
        });
        user.quizAttempts.push(quizAttempt);
        await quizAttempt.save();
      }

      await user.save();
    }

    // Call the updateUsersExperienceLevel function
    await updateUsersExperienceLevel();

    // Verify the results
    for (let user of users) {
      const updatedUser = await User.findOne({ _id: user._id });
      const iqHistory = await DailyIQ.find({ user: user._id }).sort({
        date: 1,
      });

      // Verify IQ history
      let totalXp = 0;
      let previousIQ = iqHistory[0].IQ_score;

      for (let record of iqHistory) {
        const currentIQ = record.IQ_score;
        for (let society of CircleAndSocietyData) {
          if (previousIQ < society.IQ_Lower && currentIQ >= society.IQ_Lower) {
            totalXp += society.xp;
          }
        }
        previousIQ = currentIQ;
      }

      // Add XP from quiz attempts
      totalXp += updatedUser.quizAttempts.length * 5;

      // Calculate level based on total XP
      let level = 0;
      let xpBaseAtCurrLevel = (level * (level + 1) * 10) / 2;
      let leftXp = totalXp - xpBaseAtCurrLevel;

      while (leftXp >= (level + 1) * 10) {
        level++;
        leftXp -= level * 10;
      }

      expect(updatedUser.xp).to.equal(totalXp);
      expect(updatedUser.level).to.equal(level);

      // Verify last previousIQ and IQ
      const lastIQRecord = iqHistory[iqHistory.length - 1];
      if (iqHistory.length > 1) {
        expect(updatedUser.prevIQScore).to.equal(
          iqHistory[iqHistory.length - 2].IQ_score
        );
      }
      expect(updatedUser.IQ_score).to.equal(lastIQRecord.IQ_score);
    }
  });
});
