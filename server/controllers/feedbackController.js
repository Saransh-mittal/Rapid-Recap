const Feedback = require("../model/feedbackSchema");

const submitFeedback = async (req, res) => {
  try {
    const { email, answers } = req.body;

    // Create a new feedback document
    const feedback = new Feedback({
      email,
      answers,
    });

    // Save the feedback document to the database
    await feedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

module.exports = { submitFeedback };
