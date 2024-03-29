const Quiz = require("../../model/quizSchema"); // Assuming your model file is in a "models" directory

// Function to make all quizzes active again
async function makeQuizzesActive() {
  try {
    // Update all documents in the Quiz collection to set isActive to true
    console.log("Making all quizzes active again...");
    await Quiz.updateMany({}, { isActive: true });
    console.log("All quizzes have been made active again.");
  } catch (error) {
    console.error("Error occurred while making quizzes active:", error);
  }
}

// Call the function to make quizzes active
makeQuizzesActive();
