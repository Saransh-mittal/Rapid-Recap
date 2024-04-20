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
                    return the response in the given JSON format.`,
        },
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
                    return the response in the given JSON format.`,
          },
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
      response = JSON.parse(result.choices[0].message.content);
    }
    return response;
  } catch (error) {
    console.log(error);
  }
};

const getWorldNewsApi = async () => {
  const apiKey = "e7409124fe384b688c07763501b270dd";
  try {
    const urlCricket =
      "https://api.worldnewsapi.com/search-news?text=IPL&language=en&earliest-publish-date=2024-04-19";
    const urlElections =
      "https://api.worldnewsapi.com/search-news?source-countries=in&text=elections&language=en&earliest-publish-date=2024-04-19";
    const url =
      "https://api.worldnewsapi.com/search-news?source-countries=in&language=en&earliest-publish-date=2024-04-19";
    const urlTech =
      "https://api.worldnewsapi.com/search-news?text=technology&language=en&earliest-publish-date=2024-04-19";
    const urlSpace =
      "https://api.worldnewsapi.com/search-news?text=space&language=en&earliest-publish-date=2024-04-19";
    const responseCricket = await fetch(urlCricket, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });
    const responseElections = await fetch(urlElections, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    const responseTech = await fetch(urlTech, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });
    const responseSpace = await fetch(urlSpace, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });
    let dataCricket = {};
    let dataElections = {};
    let data = {};
    let dataTech = {};
    let dataSpace = {};
    if (responseCricket.ok) dataCricket = await responseCricket.json();
    if (responseElections.ok) dataElections = await responseElections.json();
    if (response.ok) data = await response.json();
    if (responseTech.ok) dataTech = await responseTech.json();
    if (responseSpace.ok) dataSpace = await responseSpace.json();
    const result = [];
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toISOString();
    }
    for (let news of dataCricket.news) {
      if (news.text.length < 800) continue;
      const article = {
        url: news.url,
        dateTime: formatDate(news.publish_date),
        author: news.author,
        title: news.title,
        mainText: news.text,
        imgURL: [news.image],
        category: "",
      };
      result.push(article);
    }
    for (let news of dataElections.news) {
      if (news.text.length < 800) continue;
      const article = {
        url: news.url,
        dateTime: formatDate(news.publish_date),
        author: news.author,
        title: news.title,
        mainText: news.text,
        imgURL: [news.image],
        category: "",
      };
      result.push(article);
    }
    for (let news of data.news) {
      if (news.text.length < 800) continue;
      const article = {
        url: news.url,
        dateTime: formatDate(news.publish_date),
        author: news.author,
        title: news.title,
        mainText: news.text,
        imgURL: [news.image],
        category: "",
      };
      result.push(article);
    }
    for (let news of dataTech.news) {
      if (news.text.length < 800) continue;
      const article = {
        url: news.url,
        dateTime: formatDate(news.publish_date),
        author: news.author,
        title: news.title,
        mainText: news.text,
        imgURL: [news.image],
        category: "",
      };
      result.push(article);
    }
    for (let news of dataSpace.news) {
      if (news.text.length < 800) continue;
      const article = {
        url: news.url,
        dateTime: formatDate(news.publish_date),
        author: news.author,
        title: news.title,
        mainText: news.text,
        imgURL: [news.image],
        category: "",
      };
      result.push(article);
    }
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const instructions = `you are a text checker and analyser

remove the unnecessary content or lines of the mainText which is not related to the title for example Also read(section),
if question in the mainText that are not answered or not there in the mainText etc.
Don't summarize the content. and only return the same json_object back:
also analyze the title and give categories between : [general,business,sports,health,science,entertainment,technology]

fill these in the category key (only string).`;
    console.log(result.length);
    console.log("\nProcessing news articles\n");
    const updateProgress = new progressBar(result.length);

    const processedOutput = [];
    for (let news of result) {
      try {
        const isArticle = await Article.findOne({
          title: news.title,
          author: news.author,
        });
        if (isArticle) {
          updateProgress();
          continue;
        }
        const prompt = `{
   "url": ${news.url},
        "dateTime": ${news.dateTime},
      "author": ${news.author},
     "title": ${news.title},
        "mainText":   ${news.mainText},
      "imgURL": ${news.imgURL},
        "category": "",
      }`;

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
        const validCategories = [
          "general",
          "business",
          "sports",
          "health",
          "science",
          "entertainment",
          "technology",
        ];

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
          updateProgress();
          continue;
        }
        //console.log(res);
        processedOutput.push(res);

        const newArticle = new Article(res);
        await newArticle.save();
      } catch (error) {
        console.log(error);
      }

      updateProgress();
    }
    console.log("\nNews articles processed successfully\n");
    return processedOutput;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  hindiConverter,
  breakArticleIntoParagraphs,
  getWorldNewsApi,
};
