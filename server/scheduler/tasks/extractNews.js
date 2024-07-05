const { extractNewsUtilityFunc } = require("../../utils/article.utils");

async function extractNews(country) {
  try {
    const { result, articlesSavedPerCategory } = await extractNewsUtilityFunc(
      country
    );

    console.log(`No. of news fetched for DB : ${result.length}`);
    console.log(articlesSavedPerCategory);
    console.log(`News extracted successfully for country: ${country}`);
  } catch (error) {
    console.error(`Error extracting news for country ${country}:`, error);
  }
}

module.exports = extractNews;
