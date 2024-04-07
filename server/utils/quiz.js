const OpenAI = require("openai");
const QuizAttempt = require("../model/quizAttemptSchema");
const Quiz = require("../model/quizSchema");
const genQuiz = async ({ fullQuiz, title }) => {
  const selectedQuestions = new Set(); // Using a Set to ensure uniqueness

  // Loop through each paragraph
  const len = Math.min(
    5,
    fullQuiz.para1.questions.length +
      fullQuiz.para2.questions.length +
      fullQuiz.para3.questions.length
  );
  const paraNames = [];
  for (let paraName in fullQuiz) {
    if (paraName.startsWith("para")) {
      paraNames.push(paraName);
      const para = fullQuiz[paraName];
      while (para.questions.length > 0) {
        // Loop through each question in the paragraph
        // randomly select a question
        const question =
          para.questions[Math.floor(Math.random() * para.questions.length)];
        const questionId = question._id.toString(); // Convert ObjectId to string for comparison
        // Add the question's ID to the selectedQuestions Set if it's not already there
        if (!selectedQuestions.has(questionId)) {
          selectedQuestions.add(questionId);
          // If we have enough questions, break out of the loop
          break;
        }
        para.questions = para.questions.filter(
          (q) => q._id.toString() !== questionId
        );
      }
      if (selectedQuestions.size >= 3) {
        break;
      }
    }
  }

  // Loop through each paragraph to select remaining questions randomly
  while (selectedQuestions.size < len) {
    const randomParaName =
      paraNames[Math.floor(Math.random() * paraNames.length)];
    const para = fullQuiz[randomParaName];

    while (para.questions.length > 0 && selectedQuestions.size < len) {
      // Select a random question from the paragraph
      const randomIndex = Math.floor(Math.random() * para.questions.length);
      const randomQuestion = para.questions[randomIndex];
      const questionId = randomQuestion._id.toString(); // Convert ObjectId to string for comparison

      // Add the question's ID to the selectedQuestions Set if it's not already there
      if (!selectedQuestions.has(questionId)) {
        selectedQuestions.add(questionId);
        // If we have enough questions, break out of the loop
        break;
      }
      // Remove the selected question from the paragraph
      para.questions = para.questions.filter(
        (q) => q._id.toString() !== questionId
      );
    }
  }
  // Convert Set back to array
  const selectedQuestionsArray = Array.from(selectedQuestions);
  const originalFullQuiz = await Quiz.findById(fullQuiz._id);
  // Create the quiz object
  const quiz = {
    title: title,
    questions: selectedQuestionsArray.map((questionId) => {
      // Find the question object by its ID
      for (let paraName in originalFullQuiz) {
        if (paraName.startsWith("para")) {
          const para = originalFullQuiz[paraName];

          // found question using included
          const foundQuestion = para.questions.filter((question) => {
            return question._id.toString() === questionId;
          })[0];
          if (foundQuestion) {
            return foundQuestion;
          }
        }
      }
    }),
  };

  return quiz;
};
const generateQuestionsForQuiz = async ({ title, author, mainText }) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  //console.log(title, author, mainText);
  const prompt = `Title: ${title}\n Author: ${author}\n\n ${mainText}\n\n`;
  const instructions = `Instructions:
                                1. Break the article into 3 paragraphs such that minimum 2 questions can be made from each para.
                                2. Generate minimum 2 and maximum 5 questions from each paragraph(very important!).
                                3. Each question should have 4 options.
                                4. Each question should have a correct option.
                                5. Each answer should have an explanation.
                                6. Nothing should be outside of the article provided(important)
                                7. Every question should be unique.
                                8. Give each question a difficulty level between 0 to 1 (Important).
                                9.Assess the overall difficulty level of the article by considering factors 
                                  such as vocabulary complexity, sentence structure, conceptual difficulty, 
                                  depth of analysis, background knowledge required, clarity and coherence, 
                                  density of information, language style, length of the article, and reader 
                                  engagement. Evaluate each criterion to determine the article's difficulty 
                                  rating on a scale from 0 to 1, where 0 represents low difficulty and 1 represents 
                                  high difficulty. Aggregate these assessments to derive an overall difficulty level 
                                  that reflects the article's complexity and suitability for readers of varying 
                                  proficiency levels.
                                10. Return response in following JSON object format:
                                  {
                                    title: "Title of the article",
                                    para1 :
                                    {
                                      questions:
                                      [
                                        {
                                          question: "",
                                          options:
                                          {
                                            a: "",
                                            b: "",
                                            c: "",
                                            d: ""
                                          },
                                          answer: "",
                                          explanation:"",
                                          difficulty: ""
                                        },
                                      ],
                                    }
                                    para2 :
                                    {
                                      questions:
                                      [
                                        {
                                          question: "",
                                          options:
                                          {
                                            a: "",
                                            b: "",
                                            c: "",
                                            d: ""
                                          },
                                          answer: "",
                                          explanation:"",
                                          difficulty: ""
                                        },
                                      ],
                                    }
                                    para3 :
                                    {
                                      questions:
                                      [
                                        {
                                          question: "",
                                          options:
                                          {
                                            a: "",
                                            b: "",
                                            c: "",
                                            d: ""
                                          },
                                          answer: "",
                                          explanation:"",
                                          difficulty: ""
                                        },
                                      ],
                                    }
                                    overAllDifficulty: ""
                                  }`;
  let result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a quiz generator bot. You have to generate a quiz for the given article. You
                    have to follow the given instructions to generate the quiz. You importantly have to give 
                    the overall difficulty of the article and also difficulty of each question. You have to 
                    return the response in the given JSON format. Break the article into 3 paragraphs such that minimum 2 questions can be made from each para.`,
      },
      {
        role: "system",
        content: instructions,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  let response = JSON.parse(result.choices[0].message.content);
  let cnt = 3;
  while (
    (!response.para1.questions[0].difficulty ||
      !response.para2.questions[0].difficulty ||
      !response.para3.questions[0].difficulty ||
      !response.overAllDifficulty) &&
    cnt-- > 0
  ) {
    result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Provide the difficulty of each question and overall difficulty of the article.Assess the overall difficulty level of the article by considering factors 
                      such as vocabulary complexity, sentence structure, conceptual difficulty, 
                      depth of analysis, background knowledge required, clarity and coherence, 
                      density of information, language style, length of the article, and reader 
                      engagement. Evaluate each criterion to determine the article's difficulty 
                      rating on a scale from 0 to 1, where 0 represents low difficulty and 1 represents 
                      high difficulty. Aggregate these assessments to derive an overall difficulty level 
                      that reflects the article's complexity and suitability for readers of varying 
                      proficiency levels.`,
        },
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: JSON.stringify(response),
        },
      ],
    });
    response = JSON.parse(result.choices[0].message.content);
  }
  return response;
};
const updatePercentilesOnQuizDeactivation = async ({ id }) => {
  const attempts = await QuizAttempt.find({
    article: id,
  });

  // Calculate the total number of attempts
  const totalAttempts = attempts.length;

  // Sort attempts by RQM score
  attempts.sort((a, b) => b.RQM_score - a.RQM_score);

  // Update user percentile based on their position in the sorted array
  await Promise.all(
    attempts.map(async (attempt, index) => {
      if (
        !attempt ||
        !attempt.article ||
        !attempt.article.quiz ||
        !attempt.articleDifficulty
      ) {
        return; // Skip this attempt
      }
      const percentile = ((totalAttempts - index) / totalAttempts) * 100;
      attempt.userPercentile = percentile;
      // Save updated attempt
      await attempt.save();
    })
  );
};
module.exports = {
  genQuiz,
  generateQuestionsForQuiz,
  updatePercentilesOnQuizDeactivation,
};
