const Article = require("../../model/articleSchema");

const removeArticle = async () => {
  try {
    const articles = await Article.find({
      title:
        "North Korea says it tested 'super-large' cruise missile warhead and new anti-aircraft missile",
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
