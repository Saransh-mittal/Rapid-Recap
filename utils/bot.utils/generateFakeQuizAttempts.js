const moment = require("moment");
const Article = require("../../model/articleSchema");
const QuizAttempt = require("../../model/quizAttemptSchema");
const Quiz = require("../../model/quizSchema");
const User = require("../../model/userSchema");
//const { progressBar } = require("../../utils/progress.utils");
const dailyUserIQCalc = require("../dailyUserIQCalc.utils");
const { genQuiz } = require("../quiz.utils");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function generateFakeQuizAttempts() {
  try {
    console.log("Generating fake quiz attempts...");

    console.log("Fetching articles with quiz...");
    let articlesWithQuiz = await Article.find({
      quiz: { $exists: true },
    });
    articlesWithQuiz = await Promise.all(
      articlesWithQuiz.filter(async (article) => {
        const quiz = await Quiz.findById(article.quiz);
        return quiz ? true : false;
      })
    );
    console.log("Articles with quiz fetched successfully");

    console.log("Fetching users...");
    const users = [];
    //const updateProgressusers = progressBar(100);
    for (let i = 0; i < 100; i++) {
      const user = await User.findOne({ email: `dummy${i}@mail.com` });
      users.push(user);
      //updateProgressusers();
    }
    console.log("Users fetched successfully");

    console.log("Generating fake quiz attempts...");
    for (let day = 10; day >= 0; day--) {
      const currentDate = moment().subtract(day, "days").toDate();
      //const updateProgressQuizAttempts = progressBar(100);
      for (let i = 0; i < 100; i++) {
        const user = users[i];
        // randomly select number of articles to attempt quiz from 8 to articlesWithQuiz.length from the articlesWithQuiz array
        const cnt = Math.floor(Math.random() * 12);
        const newArticlesWithQuiz = shuffle(articlesWithQuiz).slice(0, cnt);

        for (const article of newArticlesWithQuiz) {
          const checkQuizAttempt = await QuizAttempt.findOne({
            article: article._id,
            user: user._id,
          });
          if (checkQuizAttempt) continue;
          const quizId = article.quiz;
          const fullQuiz = await Quiz.findById(quizId);
          if (!fullQuiz) {
            article.quiz = null;
            await article.save();
            continue;
          }
          const title = article.title;
          const quiz = await genQuiz({ fullQuiz, title });
          if (quiz.questions.length <= 2) {
            continue;
          }

          const questions = quiz.questions;
          const userResponses = [];
          let correctCount = 0;
          let flag = false;
          questions.map((question) => {
            if (flag) return;
            if (
              !question ||
              !question.answer ||
              !question.options ||
              !question._id
            ) {
              flag = true;
              return;
            }
            const isCorrect = Math.random() > 0.5;
            if (isCorrect) {
              userResponses.push(question.answer);
              correctCount++;
            } else {
              const incorrectOptionKeys = Object.keys(question.options).filter(
                (key) => key !== question.answer
              );
              const randomIncorrectOptionKey =
                incorrectOptionKeys[
                  Math.floor(Math.random() * incorrectOptionKeys.length)
                ];
              userResponses.push(randomIncorrectOptionKey);
            }
          });
          if (flag) continue;
          const quizDifficulty =
            questions.reduce((acc, question, index) => {
              return acc + parseFloat(question.difficulty);
            }, 0) / questions.length;
          const timeTaken =
            Math.floor(Math.random() * questions.length * 10) + 1;
          const apparentTimeTaken =
            timeTaken <= 10
              ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
              : timeTaken;
          const userId = user._id;
          const articleId = article._id;
          let score = correctCount / questions.length;
          const RQM_score = Math.ceil(
            ((score * quizDifficulty) / apparentTimeTaken) * 1000
          );

          const newQuizAttempt = new QuizAttempt({
            user: userId,
            article: articleId,
            responses: userResponses.map((userAnswer, index) => {
              return {
                questionId: questions[index]._id, // Assuming each question has a unique ID
                userAnswer,
                isCorrect: userAnswer === questions[index].answer,
              };
            }),
            RQM_score,
            articleDifficulty: fullQuiz.overAllDifficulty,
          });

          await newQuizAttempt.save();
          newQuizAttempt.createdAt = currentDate;
          await newQuizAttempt.save();
          const u = await User.findById(userId);
          u.quizAttempts.push(newQuizAttempt._id);
          if (fullQuiz.overAllDifficulty < 0.5) u.easyQuizCount++;
          else if (fullQuiz.overAllDifficulty < 0.7) u.mediumQuizCount++;
          else u.hardQuizCount++;
          await u.save();
        }
        //updateProgressQuizAttempts();
      }
      dailyUserIQCalc(currentDate);
    }
    console.log("Fake quiz attempts generated successfully");
  } catch (error) {
    console.log(error);
  }
}

generateFakeQuizAttempts();
