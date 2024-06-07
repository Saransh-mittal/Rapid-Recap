const { expect } = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const { logActivity } = require("../utils/activity.utils");
const User = require("../model/userSchema");
const Activity = require("../model/activitySchema");

describe("logActivity", () => {
  let userStub, activityStub, sessionStub;

  beforeEach(() => {
    userStub = sinon.stub(User, "findById");
    activityStub = sinon.stub(Activity.prototype, "save");
    sessionStub = sinon.stub(mongoose, "startSession").returns({
      startTransaction: sinon.stub(),
      commitTransaction: sinon.stub(),
      endSession: sinon.stub(),
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should log activity and award XP correctly", async () => {
    const userId = new mongoose.Types.ObjectId();
    const user = {
      _id: userId,
      iq: 130,
      prevIQScore: 120,
      xp: 0,
      level: 1,
      activities: [],
      save: sinon.stub(),
    };
    userStub.resolves(user);

    const activity = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      type: "Society or Circle upgrade",
      xpAwarded: 240,
      timestamp: new Date(),
      save: sinon.stub().resolves(),
    };
    activityStub.resolves(activity);

    await logActivity({
      userId,
      type: "Society or Circle upgrade",
      userIQ: 135,
    });

    expect(user.xp).to.equal(240);
    expect(user.level).to.equal(1);
    expect(user.activities).to.include(activity._id);
    expect(user.save.calledOnce).to.be.true;
  });

  it("should throw an error if user is not found", async () => {
    userStub.resolves(null);
    try {
      await logActivity({
        userId: new mongoose.Types.ObjectId(),
        type: "Random activity",
      });
    } catch (error) {
      expect(error.message).to.equal("User not found");
    }
  });
});
