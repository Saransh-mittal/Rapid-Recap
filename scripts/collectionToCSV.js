const fs = require("fs");
const User = require("../model/userSchema");
const Article = require("../model/articleSchema");
const TimeSpent = require("../model/timeSpentSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const { Parser } = require("json2csv");
const path = require("path");
const allCollectionsToCSV = async () => {
  try {
    const users = await User.find(
      {
        email: { $not: /^dummy\d+@mail\.com$/ },
        inGameName: { $exists: true },
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        inGameName: 1,
        verified: 1,
        IQ_score: 1,
        quizAttempts: 1,
        timeSpent: 1,
      }
    );
    // get articles after march 2024 format of dateTime "2023-07-06T22:34:00" compare to it
    const articles = await Article.find(
      { dateTime: { $gte: "2024-03-01T00:00:00" } },
      {
        _id: 1,
        author: 1,
        title: 1,
        mainText: 1,
        category: 1,
        dateTime: 1,
      }
    );
    const timeSpent = await TimeSpent.find({});
    const quizAttemptsData = await QuizAttempt.find(
      {
        createdAt: { $gte: "2024-03-01T00:00:00" },
      },
      {
        _id: 1,
        user: 1,
        article: 1,
        RQM_score: 1,
        userPercentile: 1,
        createdAt: 1,
      }
    );

    const userCSV = users.map((user) => {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        inGameName: user.inGameName,
        verified: user.verified,
        IQ_score: user.IQ_score,
        quizAttempts: user.quizAttempts.length,
        timeSpent: user.timeSpent,
      };
    });

    const articleCSV = articles.map((article) => {
      return {
        _id: article._id,
        author: article.author,
        title: article.title,
        mainText: article.mainText,
        category: article.category,
        dateTime: article.dateTime,
      };
    });

    const timeSpentCSV = timeSpent.map((time) => {
      return {
        userId: time.userId,
        articleId: time.articleId,
        timeSpent: time.timeSpent,
        date: time.date,
      };
    });

    const quizAttemptsCSV = quizAttemptsData.map((quiz) => {
      return {
        _id: quiz._id,
        user: quiz.user,
        article: quiz.article,
        RQM_score: quiz.RQM_score,
        userPercentile: quiz.userPercentile,
        createdAt: quiz.createdAt,
      };
    });
    // Convert documents to CSV format
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(userCSV);

    // Define the output path
    const outputPath = path.join(__dirname, `Users.csv`);

    // Write CSV to file
    fs.writeFileSync(outputPath, csv);
    console.log("User CSV file created");

    // Convert documents to CSV format
    const json2csvParser1 = new Parser();
    const csv1 = json2csvParser1.parse(articleCSV);

    // Define the output path
    const outputPath1 = path.join(__dirname, `Articles.csv`);

    // Write CSV to file
    fs.writeFileSync(outputPath1, csv1);
    console.log("Article CSV file created");

    // Convert documents to CSV format
    const json2csvParser2 = new Parser();
    const csv2 = json2csvParser2.parse(timeSpentCSV);

    // Define the output path
    const outputPath2 = path.join(__dirname, `TimeSpent.csv`);

    // Write CSV to file
    fs.writeFileSync(outputPath2, csv2);
    console.log("TimeSpent CSV file created");

    // Convert documents to CSV format
    const json2csvParser3 = new Parser();
    const csv3 = json2csvParser3.parse(quizAttemptsCSV);

    // Define the output path
    const outputPath3 = path.join(__dirname, `QuizAttempts.csv`);

    // Write CSV to file
    fs.writeFileSync(outputPath3, csv3);
    console.log("QuizAttempts CSV file created");

    console.log("All CSV files created");
  } catch (error) {
    console.log(error);
  }
};

allCollectionsToCSV();
