const { data } = require("./articlesBusiness");
const fs = require("fs");
const converter = () => {
  const newData = [];
  //console.log(data.articles);
  for (let i = 0; i < data[0].articles.length; i++) {
    const articleData = data[0].articles[i];
    const article = {
      url: articleData.url,
      dateTime: articleData.publishedAt,
      author: articleData.author,
      title: articleData.title,
      mainText: null,
      imgURL: [articleData.urlToImage],
      category: "business",
    };
    newData.push(article);
    // Replace the original articleData with the converted article
    // data[i] = article;
  }
  return `const articlesData = ${JSON.stringify(newData)};`;
};

const jsonData = converter();

fs.writeFile("articlesBusiness.js", jsonData, (err) => {
  if (err) {
    console.error("Error writing file:", err);
    return;
  }
  console.log("File has been updated!");
});
