const { getRecommendations } = require("../services/recommendationService");

const userRecommendations = async (req, res) => {
  try {
    // const userId = req.user._id;
    const userId = "65b1ebbc90ba2e3794e9696d";
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 18;

    const recommendations = await getRecommendations(userId, page, pageSize);
    res.status(201).json(recommendations);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  userRecommendations,
};
