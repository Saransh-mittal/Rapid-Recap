const { getXpForActivity, activityTypes } = require("../data/activityTypes");

describe("getXpForActivity", () => {
  let expect;

  before(async () => {
    ({ expect } = await import("chai"));
  });

  it("should return the correct XP for QUIZ_BONUS", () => {
    const result = getXpForActivity({
      activityType: activityTypes.QUIZ_BONUS.type,
    });
    expect(result).to.equal(activityTypes.QUIZ_BONUS.xp);
  });

  it("should return the correct XP for RANDOM_QUIZ", () => {
    const result = getXpForActivity({
      activityType: activityTypes.RANDOM_QUIZ.type,
    });
    expect(result).to.equal(activityTypes.RANDOM_QUIZ.xp);
  });

  it("should return the correct XP for TIME_SPENT", () => {
    const result = getXpForActivity({
      activityType: activityTypes.TIME_SPENT.type,
    });
    expect(result).to.equal(activityTypes.TIME_SPENT.xp);
  });

  it("should return the correct XP for WISE_WEB_EXPANSION", () => {
    const result = getXpForActivity({
      activityType: activityTypes.WISE_WEB_EXPANSION.type,
    });
    expect(result).to.equal(activityTypes.WISE_WEB_EXPANSION.xp);
  });

  it("should return the correct XP for RC_PURCHASE", () => {
    const result = getXpForActivity({
      activityType: activityTypes.RC_PURCHASE.type,
    });
    expect(result).to.equal(activityTypes.RC_PURCHASE.xp);
  });

  it("should return the correct XP for SOCIETY_OR_CIRCLE_UPGRADE with valid IQ transition", () => {
    const result = getXpForActivity({
      activityType: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
      userIQ: 135,
      previousIQ: 91,
    });
    expect(result).to.equal(40 + 60 + 120 + 180 + 240);
  });

  it("should throw an error for unknown activity type", () => {
    expect(() =>
      getXpForActivity({ activityType: "Unknown activity" })
    ).to.throw("Unknown activity type: Unknown activity");
  });

  it("should throw an error if userIQ is not provided for SOCIETY_OR_CIRCLE_UPGRADE", () => {
    expect(() =>
      getXpForActivity({
        activityType: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
      })
    ).to.throw("userIQ is required for society or circle upgrade activities");
  });

  it("should return 0 XP for SOCIETY_OR_CIRCLE_UPGRADE if userIQ does not qualify for an upgrade", () => {
    const result = getXpForActivity({
      activityType: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
      userIQ: 85,
      previousIQ: 80,
    });
    expect(result).to.equal(0);
  });

  it("should handle undefined or null values gracefully", () => {
    expect(() => getXpForActivity({ activityType: undefined })).to.throw(
      "Unknown activity type: undefined"
    );

    expect(() => getXpForActivity({ activityType: null })).to.throw(
      "Unknown activity type: null"
    );

    expect(() =>
      getXpForActivity({
        activityType: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
        userIQ: null,
      })
    ).to.throw("userIQ is required for society or circle upgrade activities");
  });

  it("should return the correct XP for each society and circle upgrade", () => {
    const testCases = [
      { userIQ: 151, previousIQ: 149, expectedXp: 900 },
      { userIQ: 145, previousIQ: 139, expectedXp: 320 },
      { userIQ: 135, previousIQ: 129, expectedXp: 240 },
      { userIQ: 125, previousIQ: 119, expectedXp: 180 },
      { userIQ: 115, previousIQ: 109, expectedXp: 120 },
      { userIQ: 105, previousIQ: 103, expectedXp: 60 },
      { userIQ: 100, previousIQ: 96, expectedXp: 40 },
      { userIQ: 95, previousIQ: 89, expectedXp: 20 },
      { userIQ: 85, previousIQ: 80, expectedXp: 0 }, // no upgrade
      { userIQ: 80, previousIQ: 75, expectedXp: 0 }, // still in Explorers Society
      {
        userIQ: 160,
        previousIQ: 80,
        expectedXp: 20 + 40 + 60 + 120 + 180 + 240 + 320 + 900,
      }, // big IQ jump
      {
        userIQ: 135,
        previousIQ: 0,
        expectedXp: 0 + 20 + 40 + 60 + 120 + 180 + 240,
      }, // another big IQ jump
    ];

    testCases.forEach(({ userIQ, previousIQ, expectedXp }) => {
      const result = getXpForActivity({
        activityType: activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type,
        userIQ,
        previousIQ,
      });
      expect(result).to.equal(expectedXp);
    });
  });
});
