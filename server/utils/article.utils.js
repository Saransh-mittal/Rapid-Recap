const natural = require('natural')
const OpenAI = require('openai')
// const { progressBar } = require("./progress.utils");
const Article = require('../model/articleSchema')
const { decode } = require('html-entities')
const NewsAPI = require('newsapi')
const axios = require('axios')
const script_prepare_article_data = require('../scripts/script_prepare_article_data')
const { averageReadTime, shuffleArray } = require('./miscellaneous.utils')
const { Recommendation } = require('../model/recommendationSchema')
const path = require('path')
const { exec } = require('child_process')
const fs = require('fs').promises
const breakArticleIntoParagraphs = async mainText => {
  const tokenizer = new natural.SentenceTokenizer()
  // Use natural language processing to tokenize sentences
  const sentences = tokenizer.tokenize(mainText)

  // Break the sentences into three paragraphs
  const paragraphLength = Math.ceil(sentences.length / 3)
  const paragraphs = []

  for (let i = 0; i < sentences.length; i += paragraphLength) {
    const paragraph = sentences.slice(i, i + paragraphLength).join(' ')
    paragraphs.push(paragraph)
  }
  return paragraphs
}

const hindiConverter = async article => {
  const { title, author, mainText } = article
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    const prompt = `Title: ${title}\n Author: ${author}\n\n MainText: ${mainText}\n\n`
    const instructions1 =
      'do you know about daily speaking hindi spoken by a common Indian'
    const instructions2 =
      'I will provide you the article ,convert it in the above manner and letters should be in hindi.'
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
                                `

    let result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `${instructions1}`,
        },
        {
          role: 'system',
          content: `${instructions2}`,
        },
        {
          role: 'system',
          content: `${instructions3}`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })
    let response = JSON.parse(result.choices[0].message.content)
    let cnt = 3
    while (
      (!response.hindiTitle ||
        !response.hindiAuthor ||
        !response.hindiMainText) &&
      cnt-- > 0
    ) {
      result = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `${instructions1}`,
          },
          {
            role: 'system',
            content: `${instructions2}`,
          },
          {
            role: 'system',
            content: `${instructions3}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })
      response = JSON.parse(result.choices[0].message.content)
    }
    if (
      !response.hindiTitle ||
      !response.hindiAuthor ||
      !response.hindiMainText
    ) {
      throw new Error('Failed to translate article')
    }
    return response
  } catch (error) {
    console.log(error)
  }
}

const processNews = async news => {
  const instructions = `you are a text checker and analyser

remove the unnecessary content or lines of the mainText which is not related to the title for example Also read(section),
if question in the mainText that are not answered or not there in the mainText etc.
Don't summarize the content. and only return the same json_object back:
also analyze the content and give categories between : [general,business,sports,health,science,entertainment,technology]

fill these in the category key (only string). Also if total characters are more than 2500 than summarize the whole mainText in 2500 characters.`

  const validCategories = [
    'general',
    'business',
    'sports',
    'health',
    'science',
    'entertainment',
    'technology',
  ]
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const processedOutput = []
  // const updateProgress = progressBar(news.length);
  for (let newsItem of news) {
    try {
      const isArticle = await Article.findOne({
        title: newsItem.title,
      })

      if (isArticle) {
        throw new Error('Article already exists')
      }
      if (newsItem.text.length < 800) {
        throw new Error('Text is too short')
      }
      const encodedText = newsItem.text
      const decodedText = decode(encodedText)
      const encodedTitle = newsItem.title
      const decodedTitle = decode(encodedTitle)
      const prompt = JSON.stringify({
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: newsItem.author,
        title: decodedTitle,
        mainText: decodedText,
        imgURL: [newsItem.image],
        category: '',
      })

      let output = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: instructions,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      let res = JSON.parse(output.choices[0].message.content)

      if (res.mainText.length > 2500) {
        output = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are a summarizer. Summarize the mainText to 2500 characters and only return the same json_object back',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        })
      }
      res = JSON.parse(output.choices[0].message.content)

      if (!validCategories.includes(res.category)) {
        res.category = 'general'
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
        continue
      }

      processedOutput.push(res)

      const newArticle = new Article(res)
      await newArticle.save()
    } catch (error) {
      console.log(error)
    } finally {
      // updateProgress();
    }
  }

  return processedOutput
}

const fetchNews = async query => {
  const apiKey = 'e7409124fe384b688c07763501b270dd' // rapidrecap2k23@gmail.com
  const url = `https://api.worldnewsapi.com/search-news?${query}&language=en&earliest-publish-date=2024-04-28`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch news articles')
    }

    const data = await response.json()
    return data.news.filter(news => news.text.length >= 800)
  } catch (error) {
    console.log(error)
    return []
  }
}

const extractNewsFromLink = async (query, apiKey) => {
  const url = `https://api.worldnewsapi.com/extract-news?url=${query}`
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      },
    })
    if (!response.ok) {
      throw new Error('Failed to fetch news articles')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.log(`Error extracting news from URL ${query}: ${error.message}`)
    return null // Return null to handle the error gracefully
  }
}

const processExtractedNews = async (news, category) => {
  const initialInstructions = `
    You are a text checker and analyzer.
    1. Remove any irrelevant content or lines from the mainText that are not related to the article or title. This includes sections like "Also read," "Loading...," "Share to Facebook," "Share to Twitter," "Share to LinkedIn," "All rights reserved" "terms of use" "HT" "Any other news websites name or nav items related to those websites" and unanswered questions.
    2. Do not summarize the content if the mainText is 2500 characters or less.
    3. If the mainText exceeds 2500 characters, summarize it to more than 800 characters but less than 2500 characters, keeping the most important information.
    4. Ensure that the returned JSON object includes all original fields.
  `

  const summarizationInstructions = `
    You are a summarizer.
    Summarize the mainText to more than 800 characters but less than 2500 characters, retaining the most important information.
    Ensure that the returned JSON object includes all original fields.
  `

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const processedOutput = []

  for (let newsItem of news) {
    try {
      if (!newsItem || !newsItem.title || !newsItem.text) {
        throw new Error('Invalid news item structure')
      }

      const existingArticle = await Article.findOne({ title: newsItem.title })
      if (existingArticle) continue

      if (newsItem.text.length < 800) throw new Error('Text is too short')

      const decodedText = decode(newsItem.text)
      const decodedTitle = decode(newsItem.title)
      const promptPayload = {
        url: newsItem.url,
        dateTime: newsItem.publish_date,
        author: Array.isArray(newsItem.author)
          ? newsItem.author[0]
          : newsItem.author,
        title: decodedTitle,
        mainText: decodedText,
        imgURL: [newsItem.image],
        category: category,
      }
      const prompt = JSON.stringify(promptPayload)

      let output = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: initialInstructions },
          { role: 'user', content: prompt },
        ],
      })

      let res = JSON.parse(output.choices[0].message.content)
      res = {
        url: res.url || newsItem.url,
        dateTime: res.dateTime || newsItem.publish_date,
        author:
          res.author ||
          (Array.isArray(newsItem.author)
            ? newsItem.author[0]
            : newsItem.author),
        title: res.title || decodedTitle,
        mainText: res.mainText || decodedText,
        imgURL: res.imgURL || [newsItem.image],
        category: res.category || category,
      }

      if (res.mainText.length > 2500) {
        output = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: summarizationInstructions },
            { role: 'user', content: JSON.stringify(res) },
          ],
        })

        res = JSON.parse(output.choices[0].message.content)
        res = {
          url: res.url || newsItem.url,
          dateTime: res.dateTime || newsItem.publish_date,
          author:
            res.author ||
            (Array.isArray(newsItem.author)
              ? newsItem.author[0]
              : newsItem.author),
          title: res.title || decodedTitle,
          mainText: res.mainText || decodedText,
          imgURL: res.imgURL || [newsItem.image],
          category: res.category || category,
        }
      }

      if (res.mainText.length < 800)
        throw new Error(`Text is too short : ${res.mainText.length} characters`)

      const articleCheck = await Article.findOne({ title: res.title })
      if (articleCheck) continue

      const avgReadTime = averageReadTime(res.mainText)
      res.avgReadTime = avgReadTime

      const newArticle = new Article(res)
      await newArticle.save()
      processedOutput.push(newArticle)
    } catch (error) {
      console.error(
        `Error processing news item titled "${newsItem.title}": ${error.message}`,
      )
    }
  }

  return processedOutput
}

const extractNewsUtilityFunc = async (country = '') => {
  // const newsapi = new NewsAPI('fb29cd0efb7e4ed292134d083f457869')
  let apiKeys = [
    '9921240e42464f3589886811e71a3977',
    '88905479ff7c4564ae48aef8b23d56d0',
    '197c615648c946d8ab50590b4c9ab408', // squartal693@gmail.com
    'dcd8cdcdb15c420d9e1d83d322962653', // muckhpoke@gmail.com
    'acd1bf365a084183b509789e0aae202a',
    '11bc2812de624777ae7efed3feac7d54', // charizard.kento@gmail.com
    'fa26103bbdd849c3a4a6ff9f713a2a91',
    'e20b7e002db74c22b29beb122b72e8c8',
    'f5b9f1b4fa0342fe976664de66c71ca0', // inferno.sinho777@gmail.com
    '819c3bf3fab848a89741017dd5e67091',
  ]
  apiKeys = shuffleArray(apiKeys)
  // const newsAPICategories = ['general']
  const newsDataIoCategories = [
    'business',
    'crime',
    // "domestic",
    'education',
    'environment',
    'food',
    'health',
    'lifestyle',
    'other',
    'politics',
    'science',
    'technology',
    'top',
    'tourism',
    'world',
    'sports',
    'entertainment',
  ]
  const requestsPerKey = 5
  let keyTracker = { currentKeyIndex: 0, requestsMadeWithCurrentKey: 0 }

  let result = []
  let notificationCategories = [
    // ...newsAPICategories,
    ...newsDataIoCategories,
  ].join(', ')
  let articlesSavedPerCategory = {}

  try {
    // await processCategories(
    //   newsapi,
    //   newsAPICategories,
    //   apiKeys,
    //   requestsPerKey,
    //   keyTracker,
    //   result,
    //   articlesSavedPerCategory,
    //   country,
    // )
    await processDataIoCategories(
      newsDataIoCategories,
      apiKeys,
      requestsPerKey,
      keyTracker,
      result,
      articlesSavedPerCategory,
      country,
    )
    script_prepare_article_data()
    return { result, articlesSavedPerCategory, notificationCategories }
  } catch (error) {
    console.log(`Error in extractNewsUtilityFunc: ${error.message}`)
  }
}

const processCategories = async (
  newsapi,
  categories,
  apiKeys,
  requestsPerKey,
  keyTracker,
  result,
  articlesSavedPerCategory,
  country,
) => {
  for (let category of categories) {
    console.log(`\nExtracting news of category ${category}\n`)
    let options = {
      category,
      language: 'en',
      pageSize: 10,
    }
    // if (country) {
    //   options.country = country
    // }

    let articles = []
    if (category === 'sports') {
      const sportsQueries = ['football', 'cricket', 'badminton', 'olympics']
      options.pageSize = 5

      for (let query of sportsQueries) {
        options.q = query
        const response = await newsapi.v2.topHeadlines(options)
        articles = articles.concat(response.articles)
      }
    } else if (category === 'entertainment') {
      const entertainmentQueries = ['movies', 'music', 'bollywood']
      options.pageSize = 5

      for (let query of entertainmentQueries) {
        options.q = query
        const response = await newsapi.v2.topHeadlines(options)
        articles = articles.concat(response.articles)
      }
      // remove q parameter to get general entertainment news
      delete options.q
      const response = await newsapi.v2.topHeadlines(options)
      articles = articles.concat(response.articles)
    } else {
      const response = await newsapi.v2.topHeadlines(options)
      articles = response.articles
    }

    console.log(articles.length)

    let allProcessedOutput = await processArticles(
      articles,
      apiKeys,
      requestsPerKey,
      keyTracker,
    )
    const AiProcessedNews = await processExtractedNews(
      allProcessedOutput,
      category,
    )

    result.push(...AiProcessedNews)
    articlesSavedPerCategory[category] = AiProcessedNews.length
  }
}

const processDataIoCategories = async (
  categories,
  apiKeys,
  requestsPerKey,
  keyTracker,
  result,
  articlesSavedPerCategory,
  country,
) => {
  for (let category of categories) {
    console.log(`\nExtracting news of category ${category}\n`)
    let queries = {
      category,
      language: 'en',
      prioritydomain: 'top',
      timezone: 'Asia/Kolkata',
      size: '5',
    }
    if (country) {
      queries.country = country
    }
    if (category === 'tourism') {
      queries.size = '3'
    }
    const queryString = Object.entries(queries)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    const response = await axios.get(
      `https://newsdata.io/api/1/latest?apikey=pub_37495bb8e5dde4895a967868c687ebd423775&${queryString}`,
    )
    const articles = JSON.parse(JSON.stringify(response.data.results))

    console.log(articles.length)

    let allProcessedOutput = await processArticles(
      articles,
      apiKeys,
      requestsPerKey,
      keyTracker,
    )
    const AiProcessedNews = await processExtractedNews(
      allProcessedOutput,
      category === 'other' ? 'general' : category,
    )

    result.push(...AiProcessedNews)
    articlesSavedPerCategory[category] = AiProcessedNews.length
  }
}

const processArticles = async (
  articles,
  apiKeys,
  requestsPerKey,
  keyTracker,
) => {
  let allProcessedOutput = []

  for (let article of articles) {
    try {
      if (keyTracker.requestsMadeWithCurrentKey >= requestsPerKey) {
        // Rotate to the next API key
        keyTracker.currentKeyIndex =
          (keyTracker.currentKeyIndex + 1) % apiKeys.length
        keyTracker.requestsMadeWithCurrentKey = 0
      }

      const apiKey = apiKeys[keyTracker.currentKeyIndex]
      const extractedNews = await extractNewsFromLink(
        article.url || article.link,
        apiKey,
      )
      if (extractedNews) {
        allProcessedOutput.push(extractedNews)
      }

      keyTracker.requestsMadeWithCurrentKey++
    } catch (error) {
      console.log(
        `Error extracting news from article ${article.title || 'unknown'}: ${
          error.message
        }`,
      )
    }
  }

  return allProcessedOutput
}

const getTopArticle = async () => {
  try {
    const articles = await Article.find({ category: 'top' }).sort({
      dateTime: -1,
    })
    const article = articles[0]
    return article
  } catch (error) {
    console.log(error)
  }
}

const getSecondTopArticle = async () => {
  try {
    const articles = await Article.find({ category: 'top' }).sort({
      dateTime: -1,
    })
    const article = articles[1]
    return article
  } catch (error) {
    console.log(error)
  }
}

const getTopThreeRecommendedArticles = async userId => {
  try {
    const userRecommendedArticles = await Recommendation.findOne({
      user_id: userId,
    }).select('recommendations')

    let cnt = 4
    const articlesForMail = []
    for (const article of userRecommendedArticles.recommendations) {
      if (cnt === 0) break
      const articleData = await Article.findById(article._id).select(
        'title imgURL',
      )
      if (
        !articleData ||
        !articleData.imgURL ||
        articleData.imgURL[0] === '' ||
        articleData.title.length > 100
      )
        continue
      articlesForMail.push({
        articleData,
        link: `https://www.rapidrecap.co.in/article/${articleData._id.toString()}`,
      })
      cnt--
    }
    return articlesForMail
  } catch (error) {
    console.error(error)
    throw new Error('Failed to fetch recommended articles')
  }
}

module.exports = {
  hindiConverter,
  breakArticleIntoParagraphs,
  processNews,
  fetchNews,
  extractNewsFromLink,
  processExtractedNews,
  extractNewsUtilityFunc,
  getTopArticle,
  getSecondTopArticle,
  getTopThreeRecommendedArticles,
}
