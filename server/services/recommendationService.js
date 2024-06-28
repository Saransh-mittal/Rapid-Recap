const { spawn } = require("child_process");
const fs = require("fs").promises;
const mongoose = require("mongoose");
const User = require("../model/userSchema");
const Article = require("../model/articleSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const TimeSpent = require("../model/timeSpentSchema");
const Recommendation = require("../model/recommendationSchema");
const { Parser } = require("json2csv");
const path = require("path");

async function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  try {
    await fs.access(dirname);
  } catch (err) {
    await fs.mkdir(dirname, { recursive: true });
  }
}

function convertToCSV(data) {
  const json2csvParser = new Parser();
  return json2csvParser.parse(data);
}

async function exportDataToCSV() {
  const articlesPromise = Article.aggregate([
    {
      $match: {
        dateTime: { $gte: "2024-04-01T00:00:00" },
      },
    },
    {
      $project: {
        _id: 1,
        author: 1,
        title: 1,
        mainText: 1,
        category: 1,
        dateTime: 1,
      },
    },
  ]);

  const quizAttemptsPromise = QuizAttempt.find(
    {
      createdAt: { $gte: "2024-04-01T00:00:00" },
    },
    {
      _id: 1,
      user: 1,
      article: 1,
      RQM_score: 1,
      userPercentile: 1,
      createdAt: 1,
    }
  ).lean();

  const timeSpentPromise = TimeSpent.find({}).lean();

  const [articles, quizAttempts, timeSpent] = await Promise.all([
    articlesPromise,
    quizAttemptsPromise,
    timeSpentPromise,
  ]);

  const filePaths = [
    path.join(__dirname, "..", "data", "csv", "articles.csv"),
    path.join(__dirname, "..", "data", "csv", "quiz_attempts.csv"),
    path.join(__dirname, "..", "data", "csv", "time_spent.csv"),
  ];

  await Promise.all(
    filePaths.map((filePath) => ensureDirectoryExistence(filePath))
  );

  await Promise.all([
    fs.writeFile(filePaths[0], convertToCSV(articles)),
    fs.writeFile(filePaths[1], convertToCSV(quizAttempts)),
    fs.writeFile(filePaths[2], convertToCSV(timeSpent)),
  ]);

  console.log("CSV files created successfully");
}

async function runPythonScript(pythonScriptPath, userId) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python", [pythonScriptPath, userId]);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python script output: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python script error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python script exited with code ${code}`));
      }
    });
  });
}

async function generateRecommendations(userId) {
  const pythonScriptPath = path.join(
    __dirname,
    "..",
    "scripts",
    "recommender.py"
  );
  await runPythonScript(pythonScriptPath, userId);
}

async function updateRecommendations(userId) {
  try {
    const userRecommendations = await Recommendation.findOne({
      user_id: userId,
    });

    if (userRecommendations && userRecommendations.isUpdating) {
      return; // Another process is already updating
    }

    await Recommendation.findOneAndUpdate(
      { user_id: userId },
      { $set: { isUpdating: true } },
      { upsert: true }
    );

    await generateRecommendations(userId);
  } catch (error) {
    console.error("Error in updateRecommendations:", error);
    await Recommendation.findOneAndUpdate(
      { user_id: userId },
      { $set: { isUpdating: false } }
    );
  }
}

async function getRecommendations(userId, page = 1, pageSize = 18) {
  try {
    let userRecommendations = await Recommendation.findOne({ user_id: userId });

    const now = new Date();
    const updateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    if (
      !userRecommendations ||
      userRecommendations.lastUpdated < updateThreshold
    ) {
      updateRecommendations(userId); // Trigger an update in the background
    }

    if (
      !userRecommendations ||
      userRecommendations.recommendations.length < pageSize
    ) {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
      userRecommendations = await Recommendation.findOne({ user_id: userId });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const recommendationsToServe = userRecommendations.recommendations
      .filter((rec) => !rec.served)
      .slice(startIndex, endIndex);

    await Recommendation.updateOne(
      { user_id: userId },
      { $set: { "recommendations.$[elem].served": true } },
      {
        arrayFilters: [
          { "elem._id": { $in: recommendationsToServe.map((rec) => rec._id) } },
        ],
      }
    );

    return recommendationsToServe;
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    throw error;
  }
}

module.exports = {
  getRecommendations,
  updateRecommendations,
  exportDataToCSV,
  generateRecommendations,
};
