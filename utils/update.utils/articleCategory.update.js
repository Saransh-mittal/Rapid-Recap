const Article = require("../../model/articleSchema");

const articleCategoryUpdate = async () => {
  try {
    const articles = await Article.find({
      title: `"Never Want Your Head...": Sunil Gavaskar's Message To Rishabh Pant After SRH Thrashing In IPL 2024`,
    });
    // for (let i = 0; i < articles.length; i++) {
    //   articles[i].category = "sports";
    //   await articles[i].save();
    // }
    console.log(articles);
  } catch (error) {
    console.error(error);
  }
};

articleCategoryUpdate();
