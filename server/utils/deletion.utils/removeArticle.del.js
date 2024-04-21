const Article = require("../../model/articleSchema");

const removeArticle = async () => {
  try {
    const articles = await Article.find({
      title:
        "IPL 2024: LSG v CSK overall head-to-head; When and where to watch",
    });
    // for (let i = 0; i < articles.length - 1; i++) {
    //   const article = await Article.findByIdAndDelete(articles[i]._id);
    // }
    console.log(articles);
  } catch (error) {
    console.error(error);
  }
};

removeArticle();
