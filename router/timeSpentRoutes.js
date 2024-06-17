const express = require("express");
const { timeSpent } = require("../controllers/timeSpentController");
const router = express.Router();
const { Authenticate } = require("../middleware/authenticate");
// const timeSpentController = require("../controllers/timeSpentController"); // Adjust the path as necessary

// Other user-related routes...

// Time spent route
router.route("/").post(Authenticate, timeSpent);

module.exports = router;
