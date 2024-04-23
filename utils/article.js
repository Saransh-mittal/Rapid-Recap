const natural = require("natural");
const OpenAI = require("openai");
const { progressBar } = require("./progress");
const Article = require("../model/articleSchema");

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

    const instructions = `Instructions:
                                1. Translate the given text to Hindi.
                                2. Translate the title to hindi carefully.
                                3. Author is name of the author of the article, translate author name to hindi ,dont write its meaning.
                                4. Be very careful when translating MainText to hindi and it's meaning should be same as in english.
                                5. Break maintext in only 3 paragraphs.
                                6. Make a JSON object containing hindiTitle, hindiAuthor, and hindiMainText.
                                7.  Return the JSON object which contains the translated text and looks like :
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
          content: `You are a hindi translator bot. You have to translate an article. You
                    have to follow the given instructions to translate the article.You have to 
                    return the response in the given JSON format. ${instructions}`,
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
            content: `You are a hindi translator bot. You have to translate an article. You
                    have to follow the given instructions to translate the article.You have to 
                    return the response in the given JSON format. ${instructions}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });
      response = JSON.parse(result.choices[0].message.content);
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
  const updateProgress = progressBar(news.length);
  for (let newsItem of news) {
    try {
      const isArticle = await Article.findOne({
        title: newsItem.title,
      });

      if (isArticle) {
        continue;
      }

      const prompt = JSON.stringify({
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: newsItem.author,
        title: newsItem.title,
        mainText: newsItem.text,
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
      updateProgress();
    }
  }

  return processedOutput;
};

const fetchNews = async (query) => {
  const apiKey = "e7409124fe384b688c07763501b270dd";
  const url = `https://api.worldnewsapi.com/search-news?${query}&language=en&earliest-publish-date=2024-04-22`;

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

const extractNewsFromLink = async (query) => {
  const apiKey = "e7409124fe384b688c07763501b270dd";
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
  const updateProgress = progressBar(news.length);
  for (let newsItem of news) {
    try {
      const isArticle = await Article.findOne({
        title: newsItem.title,
      });

      if (isArticle) {
        continue;
      }

      const prompt = JSON.stringify({
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: Array.isArray(newsItem.author)
          ? newsItem.author[0]
          : newsItem.author,
        title: newsItem.title,
        mainText: newsItem.text,
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

      processedOutput.push(res);

      const newArticle = new Article(res);
      await newArticle.save();
    } catch (error) {
      console.log(error);
    } finally {
      updateProgress();
    }
  }

  return processedOutput;
};
module.exports = {
  hindiConverter,
  breakArticleIntoParagraphs,
  processNews,
  fetchNews,
  extractNewsFromLink,
  processExtractedNews,
};
