// File: server/utils/seoHelper.js

const Article = require('../model/articleSchema')
const OpenAI = require('openai')

const generateMetaTags = (articleData, baseUrl, url) => {
  const description =
    articleData.description || articleData.mainText.substring(0, 155) + '...'
  const canonicalUrl = `${baseUrl}${url}`
  const isoDate = new Date(articleData.dateTime).toISOString()
  const keywords = articleData?.keywords
    ? articleData?.keywords?.join(', ')
    : ''

  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleData.title} | Rapid Recap</title>

    <meta name="description" content="${description}">
    <meta name="keywords" content="${
      articleData.category
    } news, rapid recap, ${keywords}">
    <link rel="canonical" href="${canonicalUrl}">

    <meta property="og:type" content="article">
    <meta property="og:title" content="${articleData.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Rapid Recap">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:section" content="${
      articleData.category || 'News'
    }">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${articleData.title}">
    <meta name="twitter:description" content="${description}">
    ${
      articleData.imgURL
        ? `<meta name="twitter:image" content="${articleData.imgURL}">`
        : ''
    }

    <link rel="preload" href="/images/tourBGDark.webp" as="image">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/images/rrlogo_512.png">
    <link rel="icon" type="image/webp" href="/images/rrlogo.webp">
  `
}

const generateKeywordsAndDescription = async articleId => {
  try {
    const articleData = await Article.findById(articleId)
    const instructions = `I have a title and main text from an article. Based on the information provided, please generate:

A list of 5-8 highly relevant keywords that would be beneficial for search engine optimization (SEO), targeting phrases that users might search for to find this article. Keywords should include both primary and long-tail phrases that align with the main topics.

A meta description that captures the core of the article in a compelling way, is under 150 characters, and incorporates 2-3 of the most relevant keywords. The description should be written to attract clicks by clearly conveying the article’s key points.

Title: ${articleData.title}

Main Text: ${articleData.mainText}

Please ensure that the keywords and meta description are highly relevant to the content and target terms that would help this article rank well in search engines for related searches.

Output format (json_object) :
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "description": "Your meta description here"
}
`

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    const output = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: instructions }],
    })
    const res = JSON.parse(output.choices[0].message.content)
    articleData.keywords = res.keywords
    articleData.description = res.description
    await articleData.save({ validateBeforeSave: false })
  } catch (error) {
    console.error(error)
  }
}

module.exports = { generateMetaTags, generateKeywordsAndDescription }
