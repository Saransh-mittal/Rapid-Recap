const natural = require("natural");
const OpenAI = require("openai");
//const { progressBar } = require("./progress.utils");
const Article = require("../model/articleSchema");
const { decode } = require("html-entities");
const NewsAPI = require("newsapi");
const breakArticleIntoParagraphs = async (mainText) => {
  const tokenizer = new natural.SentenceTokenizer();
  // Use natural language processing to tokenize sentences
  const sentences = tokenizer.tokenize(mainText);

  // Break the sentences into three paragraphs
  const paragraphLength = Math.ceil(sentences.length / 3);
  const paragraphs = [];

  for (let i = 0; i < sentences.length; i += paragraphLength) {
    const paragraph = sentences.slice(i, i + paragraphLength).join(" ");
    paragraphs.push(paragraph);
  }
  return paragraphs;
};

const hindiConverter = async (article) => {
  const { title, author, mainText } = article;
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const prompt = `Title: ${title}\n Author: ${author}\n\n MainText: ${mainText}\n\n`;
    const instructions1 =
      "do you know about daily speaking hindi spoken by a common Indian";
    const instructions2 =
      "I will provide you the article ,convert it in the above manner and letters should be in hindi.";
    const instructions3 = `Instructions:
                                1. Author is name of the author of the article, translate author name to hindi ,dont write its meaning.
                                2. Break maintext in only 3 paragraphs.
                                3. Make a JSON object containing hindiTitle, hindiAuthor, and hindiMainText.
                                4.  Return the JSON object which contains the translated text and looks like :
                                {
                                  "hindiTitle": "translated title",
                                  "hindiAuthor": "translated author",
                                  "hindiMainText": {
                                    "para1": "translated paragraph1",
                                    "para2": "translated paragraph2",
                                    "para3": "translated paragraph3"
                                  }
                                }
                                `;

    let result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${instructions1}`,
        },
        {
          role: "system",
          content: `${instructions2}`,
        },
        {
          role: "system",
          content: `${instructions3}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });
    let response = JSON.parse(result.choices[0].message.content);
    let cnt = 3;
    while (
      (!response.hindiTitle ||
        !response.hindiAuthor ||
        !response.hindiMainText) &&
      cnt-- > 0
    ) {
      result = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `${instructions1}`,
          },
          {
            role: "system",
            content: `${instructions2}`,
          },
          {
            role: "system",
            content: `${instructions3}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      response = JSON.parse(result.choices[0].message.content);
    }
    if (
      !response.hindiTitle ||
      !response.hindiAuthor ||
      !response.hindiMainText
    ) {
      throw new Error("Failed to translate article");
    }
    return response;
  } catch (error) {
    console.log(error);
  }
};

const processNews = async (news) => {
  const instructions = `you are a text checker and analyser

remove the unnecessary content or lines of the mainText which is not related to the title for example Also read(section),
if question in the mainText that are not answered or not there in the mainText etc.
Don't summarize the content. and only return the same json_object back:
also analyze the content and give categories between : [general,business,sports,health,science,entertainment,technology]

fill these in the category key (only string). Also if total characters are more than 2500 than summarize the whole mainText in 2500 characters.`;

  const validCategories = [
    "general",
    "business",
    "sports",
    "health",
    "science",
    "entertainment",
    "technology",
  ];
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const processedOutput = [];
  //const updateProgress = progressBar(news.length);
  for (let newsItem of news) {
    try {
      const isArticle = await Article.findOne({
        title: newsItem.title,
      });

      if (isArticle) {
        throw new Error("Article already exists");
      }
      if (newsItem.text.length < 800) {
        throw new Error("Text is too short");
      }
      const encodedText = newsItem.text;
      const decodedText = decode(encodedText);
      const encodedTitle = newsItem.title;
      const decodedTitle = decode(encodedTitle);
      const prompt = JSON.stringify({
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: newsItem.author,
        title: decodedTitle,
        mainText: decodedText,
        imgURL: [newsItem.image],
        category: "",
      });

      let output = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: instructions,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      let res = JSON.parse(output.choices[0].message.content);

      if (res.mainText.length > 2500) {
        output = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-0125",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a summarizer. Summarize the mainText to 2500 characters and only return the same json_object back",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });
      }
      res = JSON.parse(output.choices[0].message.content);

      if (!validCategories.includes(res.category)) {
        res.category = "general";
      }
      if (
        !res.mainText ||
        !res.title ||
        !res.author ||
        !res.url ||
        !res.dateTime ||
        !res.imgURL ||
        !res.category
      ) {
        continue;
      }

      processedOutput.push(res);

      const newArticle = new Article(res);
      await newArticle.save();
    } catch (error) {
      console.log(error);
    } finally {
      //updateProgress();
    }
  }

  return processedOutput;
};

const fetchNews = async (query) => {
  const apiKey = "e7409124fe384b688c07763501b270dd";
  const url = `https://api.worldnewsapi.com/search-news?${query}&language=en&earliest-publish-date=2024-04-28`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch news articles");
    }

    const data = await response.json();
    return data.news.filter((news) => news.text.length >= 800);
  } catch (error) {
    console.log(error);
    return [];
  }
};

const extractNewsFromLink = async (query, apiKey) => {
  const url = `https://api.worldnewsapi.com/extract-news?url=${query}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch news articles");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const processExtractedNews = async (news, category) => {
  const instructions = `you are a text checker and analyser

remove the unnecessary content or lines of the mainText which is not related to the title for example Also read(section),
if question in the mainText that are not answered or not there in the mainText etc.
Don't summarize the content. and only return the same json_object back:
Also if total characters are more than 2500 than summarize the whole mainText in 2500 characters.`;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const processedOutput = [];
  //const updateProgress = progressBar(news.length);
  for (let newsItem of news) {
    try {
      const isArticle = await Article.findOne({
        title: newsItem.title,
      });

      if (isArticle) {
        continue;
      }
      if (newsItem.text.length < 800) {
        throw new Error("Text is too short");
      }
      const encodedText = newsItem.text;
      const decodedText = decode(encodedText);
      const encodedTitle = newsItem.title;
      const decodedTitle = decode(encodedTitle);
      const prompt = JSON.stringify({
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: Array.isArray(newsItem.author)
          ? newsItem.author[0]
          : newsItem.author,
        title: decodedTitle,
        mainText: decodedText,
        imgURL: [newsItem.image],
        category: category,
      });

      let output = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: instructions,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      let res = JSON.parse(output.choices[0].message.content);

      if (res.mainText.length > 2500) {
        output = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-0125",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a summarizer. Summarize the mainText to 2500 characters and only return the same json_object back",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });
      }
      res = JSON.parse(output.choices[0].message.content);

      const newArticle = new Article(res);
      await newArticle.save();
      processedOutput.push(newArticle);
    } catch (error) {
      console.log(error);
    } finally {
      //updateProgress();
    }
  }

  return processedOutput;
};

const extractNewsUtilityFunc = async () => {
  const newsapi = new NewsAPI("fb29cd0efb7e4ed292134d083f457869");
  const apiKeys = [
    "7170746b5aa044069fbd5f48e74817ac",
    "acd1bf365a084183b509789e0aae202a",
    "a46513e934b14f44a9fa2137185f5438",
    "7e4a7d41a3ed463a952349bfb07b1452",
    "e7409124fe384b688c07763501b270dd",
  ];
  const categories = [
    "general",
    "sports",
    "health",
    "science",
    "business",
    "technology",
    "entertainment",
  ];
  const requestsPerKey = 30;
  let currentKeyIndex = 0;
  let requestsMadeWithCurrentKey = 0;

  try {
    let result = [];
    let notificationCategories = categories.join(", ");
    let articlesSavedPerCategory = {};

    for (let category of categories) {
      console.log(`\nExtracting news of category ${category}\n`);
      const response = await newsapi.v2.topHeadlines({
        category,
        language: "en",
        country: "in",
      });

      const articles = JSON.parse(JSON.stringify(response.articles));
      console.log(articles.length);
      let allProcessedOutput = [];

      for (let article of articles) {
        try {
          if (requestsMadeWithCurrentKey >= requestsPerKey) {
            // If requests limit reached, switch to the next API key
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            requestsMadeWithCurrentKey = 0;
          }

          const apiKey = apiKeys[currentKeyIndex];
          const extractedNews = await extractNewsFromLink(article.url, apiKey);
          allProcessedOutput.push(extractedNews);

          requestsMadeWithCurrentKey++;
        } catch (error) {
          console.log(
            `Error extracting news from article ${article.title}: ${error}`
          );
        }
      }

      const AiProcessedNews = await processExtractedNews(
        allProcessedOutput,
        category
      );

      result = result.concat(AiProcessedNews);
      articlesSavedPerCategory[category] = AiProcessedNews.length;
    }
    return { result, articlesSavedPerCategory, notificationCategories };
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  hindiConverter,
  breakArticleIntoParagraphs,
  processNews,
  fetchNews,
  extractNewsFromLink,
  processExtractedNews,
  extractNewsUtilityFunc,
};
