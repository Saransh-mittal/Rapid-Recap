const User = require("../model/userSchema");
const Article = require("../model/articleSchema");
const QuizAttempt = require("../model/quizAttemptSchema");
const Quiz = require("../model/quizSchema");
const QuinBoost = require("../model/quinBoostSchema");
const { currDayStreakCalulator } = require("../utils/user.utils");
const {
  scheduleEmail,
  cancelScheduledEmails,
  scheduleDayEndEmail,
} = require("../scheduler/mail");
const MailTemplates = require("../data/MailTemplates");
const { logActivity } = require("../utils/activity.utils");
const { activityTypes } = require("../data/activityTypes");

const saveAttempt = async (req, res) => {
  const { articleId, userResponses, quizData, timeTaken, quizId } = req.body;
  const userId = req.user._id;
  //console.log(userId);
  try {
    if (!userId || !articleId || !userResponses || !quizData) {
      throw new Error("Please provide all the details");
    }
    const attempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
    });

    const currentDate = new Date(); // Get current date
    currentDate.setUTCHours(0, 0, 0, 0); // Set time to start of the day

    // Check if there's any attempt saved for the current user and article for today
    const todayAttemptsCount = await QuizAttempt.countDocuments({
      user: userId,
      createdAt: { $gte: currentDate },
    });
    if (attempt) {
      throw new Error("User has already attempted the quiz for the article.");
    }
    const article = await Article.findById(articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    if (!article.userQuizStatus) {
      throw new Error("No quiz status found for this article");
    }
    const foundStatus = article.userQuizStatus.find(
      (status) => status.userId.toString() === userId
    );

    if (foundStatus) {
      foundStatus.status = false;
    } else {
      throw new Error("User never started the quiz");
    }
    await article.save();

    const quiz = await Quiz.findById(quizId);
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
      quiz: quizId,
    });
    if (quizAttempt) {
      throw new Error("User has already attempted the quiz for the article.");
    }

    const questions = quizData.questions;
    const correctAnswers = questions.map((question) => question.answer);
    let score = correctAnswers.reduce((acc, answer, index) => {
      if (userResponses.length > index && answer === userResponses[index]) {
        //console.log(acc);
        return acc + 1;
      }
      return acc;
    }, 0);
    //console.log(score);
    score = score / quizData.questions.length;
    const quizDifficulty =
      questions.reduce((acc, question, index) => {
        //console.log(acc, question.difficulty);
        return acc + parseFloat(question.difficulty);
      }, 0) / questions.length;

    const apparentTimeTaken =
      timeTaken <= 10
        ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
        : timeTaken;

    const apparentScore = (score * Math.log(score + 1)) / Math.log(1.3);
    let RQM_score = Math.ceil(
      ((apparentScore * quizDifficulty) / apparentTimeTaken) * 1000
    );
    const user = await User.findById(userId);
    let boosted = false;
    if (user.todayBoost) {
      RQM_score = Math.ceil(RQM_score * 1.5);
      boosted = true;
    }
    if (!user.todayBoost && user.quinBoosts.length > 0) {
      const quinBoost = user.quinBoosts[user.quinBoosts.length - 1];
      if (quinBoost.boosted) {
        RQM_score = Math.ceil(RQM_score * 1.5);
        boosted = true;
        quinBoost.boosted = false;
        const qBoost = await QuinBoost.findById(quinBoost.quinBoost);
        // console.log(qBoost);
        // console.log(article._id);
        qBoost.article = article._id;
        await qBoost.save();
      }
    }
    const articleDifficulty = quiz.overAllDifficulty;
    const newQuizAttempt = new QuizAttempt({
      user: userId,
      article: articleId,
      quiz: quizId,
      responses: userResponses.map((userAnswer, index) => {
        return {
          questionId: questions[index]._id, // Assuming each question has a unique ID
          userAnswer,
          isCorrect: userAnswer === correctAnswers[index],
        };
      }),
      RQM_score,
      articleDifficulty,
      timeTaken,
      boost: boosted ? 1.5 : 1,
      isBoosted: boosted,
    });
    await newQuizAttempt.save();

    let sumOfRQM = user.avgRQM * user.quizAttempts.length;
    sumOfRQM += RQM_score;
    user.avgRQM = sumOfRQM / (user.quizAttempts.length + 1);
    user.quizAttempts.push(newQuizAttempt._id);
    const expiry = new Date();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (user.streakExpiry < today) {
      user.streak = 0;
      await user.save();
    }
    expiry.setUTCDate(expiry.getUTCDate() + 1); // Set date to one day from now
    expiry.setUTCHours(0, 0, 0, 0);
    user.streakExpiry = expiry;
    if (todayAttemptsCount === 0) {
      if (user.streak + 1 > user.longestStreak)
        user.longestStreak = user.streak + 1;
      user.streak++;
    }
    if (articleDifficulty < 0.5) user.easyQuizCount++;
    else if (articleDifficulty < 0.7) user.mediumQuizCount++;
    else user.hardQuizCount++;
    await user.save();
    await logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.RANDOM_QUIZ.type,
    });
    const quizzesToday = await currDayStreakCalulator(user._id);
    if (quizzesToday % 7 === 4) {
      cancelScheduledEmails(user._id.toString());
      scheduleEmail({
        userId: user._id.toString(),
        userEmail: user.email,
        delayMinutes: 30,
        mailHtml: MailTemplates.preQuinBoost.html({
          name: user.name.split(" ")[0],
          noOfQuizzes: quizzesToday,
          QuinQuizNumber: quizzesToday + 2,
        }),
        subject: MailTemplates.preQuinBoost.subject,
      });
      scheduleEmail({
        userId: user._id.toString(),
        userEmail: user.email,
        delayMinutes: 120,
        mailHtml: MailTemplates.preQuinBoost.html({
          name: user.name.split(" ")[0],
          noOfQuizzes: quizzesToday,
          QuinQuizNumber: quizzesToday + 2,
        }),
        subject: `Reminder: ${MailTemplates.preQuinBoost.subject}`,
      });
    } else if (quizzesToday % 7 === 5) {
      cancelScheduledEmails(user._id.toString());
      scheduleEmail({
        userId: user._id.toString(),
        userEmail: user.email,
        delayMinutes: 30,
        mailHtml: MailTemplates.onQuinBoost.html1({
          name: user.name.split(" ")[0],
          noOfQuizzes: quizzesToday,
          QuinQuizNumber: quizzesToday + 1,
        }),
        subject: MailTemplates.onQuinBoost.subject,
      });
      scheduleEmail({
        userId: user._id.toString(),
        userEmail: user.email,
        delayMinutes: 120,
        mailHtml: MailTemplates.onQuinBoost.html1({
          name: user.name.split(" ")[0],
          noOfQuizzes: quizzesToday,
          QuinQuizNumber: quizzesToday + 1,
        }),
        subject: `Reminder: ${MailTemplates.onQuinBoost.subject}`,
      });
      scheduleDayEndEmail({
        userId: user._id.toString(),
        userEmail: user.email,
        beforeMin: 60,
        mailHtml: MailTemplates.onQuinBoost.html2({
          name: user.name.split(" ")[0],
          QuinQuizNumber: quizzesToday + 1,
        }),
        subject: "Hurry Up 1 hour Left! Your Quin Boost is Active! 🌟",
      });
    } else if (quizzesToday % 7 === 6) {
      cancelScheduledEmails(user._id.toString());
      scheduleEmail({
        userId: user._id.toString(),
        userEmail: user.email,
        delayMinutes: 30,
        mailHtml: MailTemplates.postQuinBoost.html({
          name: user.name.split(" ")[0],
          noOfQuizzes: quizzesToday,
        }),
        subject: MailTemplates.postQuinBoost.subject,
      });
    }
    res.status(201).json({ message: "Attempt saved successfully", RQM_score });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error || "Error saving attempt" });
  }
};

const getPercentile = async (req, res) => {
  const { userId, articleId } = req.params;

  try {
    const quizAttempts = await QuizAttempt.find({ article: articleId });
    const sortedQuizAttempts = quizAttempts.sort(
      (a, b) => b.RQM_score - a.RQM_score
    );
    const userAttempt = sortedQuizAttempts.find(
      (attempt) => attempt.user.toString() === userId
    );
    if (!userAttempt) {
      throw new Error("User has not attempted the quiz for the article.");
    }
    const userPosition = sortedQuizAttempts.indexOf(userAttempt);

    const totalAttempts = sortedQuizAttempts.length;
    const userPercentile =
      ((totalAttempts - userPosition) / totalAttempts) * 100;
    userAttempt.userPercentile = userPercentile;
    await userAttempt.save();
    console.log(userPercentile);
    res.status(200).json({ percentile: userPercentile });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: error || "Error Calculating percentile. Please try again Later",
    });
  }
};

const givenQuiz = async (req, res) => {
  const { userId, articleId } = req.params;
  try {
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
    });
    if (quizAttempt) {
      const quizAttempts = await QuizAttempt.find({ article: articleId });
      const sortedQuizAttempts = quizAttempts.sort(
        (a, b) => b.RQM_score - a.RQM_score
      );
      const userAttempt = sortedQuizAttempts.find(
        (attempt) => attempt.user.toString() === userId
      );
      if (!userAttempt) {
        throw new Error("User has not attempted the quiz for the article.");
      }
      const userPosition = sortedQuizAttempts.indexOf(userAttempt);

      const totalAttempts = sortedQuizAttempts.length;
      const userPercentile =
        ((totalAttempts - userPosition) / totalAttempts) * 100;
      userAttempt.userPercentile = userPercentile;
      await userAttempt.save();
      res.status(200).json({
        given: true,
        percentile: userPercentile,
        RQM_score: quizAttempt.RQM_score,
      });
    } else {
      res.status(200).json({ given: false });
    }
  } catch (error) {
    console.log(error);
    res.status(422).json({ error: error });
  }
};

const getQuizSummary = async (req, res) => {
  //console.log("getQuizSummary");
  const articleId = req.params.articleId;
  const userId = req.user._id;
  try {
    const quizAttempt = await QuizAttempt.findOne({
      user: userId,
      article: articleId,
    });
    const quiz = await Quiz.findById(quizAttempt.quiz);
    if (!quizAttempt) {
      throw new Error("User has not attempted the quiz for the article.");
    }
    const { responses } = quizAttempt;
    const result = [];
    for (let i = 0; i < responses.length; i++) {
      const question = responses[i];

      const { questionId, userAnswer } = question;

      // find question in the model Quiz in para1, para2 and para3 of the questionId
      let found = false;
      let para = 1;
      let questionIndex = 0;
      let fullQuestion = {};
      while (!found && para <= 3) {
        const paraQuestions = quiz[`para${para}`].questions;
        //console.log(paraQuestions[0]._id.toString());
        questionIndex = paraQuestions.findIndex((q) => {
          //console.log(questionId.toString());
          //console.log(q._id.toString());

          return q._id.toString() === questionId.toString();
        });
        if (questionIndex !== -1) {
          fullQuestion = paraQuestions[questionIndex];
          found = true;
        } else {
          para++;
        }
      }
      const { options, answer, explanation } = fullQuestion;
      // console.log(userAnswer);
      // console.log(question.isCorrect);
      // console.log(fullQuestion);
      result.push({
        question: fullQuestion.question,
        options,
        answer,
        explanation,
        userAnswer,

        isCorrect: question.isCorrect,
      });
    }
    res.status(200).json({ result, timeTaken: quizAttempt.timeTaken });
  } catch (error) {
    res.status(400).json({ error: error || "Something went wrong" });
    console.error(error);
  }
};

module.exports = { saveAttempt, getPercentile, givenQuiz, getQuizSummary };
