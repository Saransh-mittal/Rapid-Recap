const express = require("express");
const { submitFeedback } = require("../controllers/feedbackController");
const router = express.Router();

// Define a POST route for submitting feedback
router.post("/submit", submitFeedback);

module.exports = router;
