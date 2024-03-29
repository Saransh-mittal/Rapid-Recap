const { faker } = require("@faker-js/faker");
const Article = require("../../model/articleSchema"); // Import Article model
const Quiz = require("../../model/quizSchema"); // Import Quiz model
async function generateFakeArticle() {
  // Generate a fake quiz
  const fakeQuiz = new Quiz({
    article: null, // Initially set to null
    para1: {
      questions: [
        {
          question: faker.lorem.sentence(),
          options: {
            a: faker.lorem.sentence(),
            b: faker.lorem.sentence(),
            c: faker.lorem.sentence(),
            d: faker.lorem.sentence(),
          },
          answer: faker.helpers.arrayElement(["a", "b", "c", "d"]),
          explanation: faker.lorem.paragraph(),
          difficulty: faker.helpers.arrayElement(["easy", "medium", "hard"]),
        },
      ],
    },
    para2: {
      questions: [
        {
          question: faker.lorem.sentence(),
          options: {
            a: faker.lorem.sentence(),
            b: faker.lorem.sentence(),
            c: faker.lorem.sentence(),
            d: faker.lorem.sentence(),
          },
          answer: faker.helpers.arrayElement(["a", "b", "c", "d"]),
          explanation: faker.lorem.paragraph(),
          difficulty: faker.helpers.arrayElement(["easy", "medium", "hard"]),
        },
      ],
    },
    para3: {
      questions: [
        {
          question: faker.lorem.sentence(),
          options: {
            a: faker.lorem.sentence(),
            b: faker.lorem.sentence(),
            c: faker.lorem.sentence(),
            d: faker.lorem.sentence(),
          },
          answer: faker.helpers.arrayElement(["a", "b", "c", "d"]),
          explanation: faker.lorem.paragraph(),
          difficulty: faker.helpers.arrayElement(["easy", "medium", "hard"]),
        },
      ],
    },
    overAllDifficulty: faker.helpers.arrayElement(["easy", "medium", "hard"]),
  });

  // Save the fake quiz
  await fakeQuiz.save();

  // Create a fake article associated with the quiz
  const fakeArticle = new Article({
    url: faker.internet.url(),
    dateTime: faker.date.past(),
    author: faker.person.firstName(),
    title: faker.lorem.sentence(),
    mainText: faker.lorem.paragraphs(),
    imgURL: ["https://via.placeholder.com/150"],
    quiz: fakeQuiz._id, // Pass the quiz ID
    userQuizStatus: [],
    category: faker.helpers.arrayElement(["General", "Technology", "Science"]),
  });

  // Update the quiz to include the article ID
  fakeQuiz.article = fakeArticle._id;
  await fakeQuiz.save();

  // Save the fake article
  await fakeArticle.save();

  // Return the fake article
  return { fakeArticle, fakeQuiz };
}

module.exports = generateFakeArticle;
