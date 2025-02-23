// services/quickClashArticleService.js
const { makeGPTRequest } = require('../../utils/openai')
const Article = require('../../model/articleSchema')

const getSourceArticles = async ({ category, session }) => {
  return await Article.find({ category })
    .sort({ quizAttemptCnt: -1, dateTime: -1 })
    .limit(5)
    .session(session)
}

const generateMixedArticle = async ({ articles }) => {
  const sourceContent = articles.map(article => ({
    title: article.title,
    content: article.mainText,
  }))

  // Generate English content
  const englishPrompt = `
    Create an engaging news article (800-1600 chars) by combining these sources:
    ${sourceContent
      .map(a => `Title: ${a.title}\nContent: ${a.content}`)
      .join('\n\n')}

    Requirements:
    1. Maintain factual accuracy and key details from source articles
    2. Create smooth transitions between different pieces of information
    3. Make it engaging and informative while keeping formal news tone
    4. Return JSON with format:
       {
         "title": "Combined article title",
         "content": "Full article content"
       }
  `

  const englishArticle = await makeGPTRequest({
    messages: [
      {
        role: 'system',
        content:
          'You are an expert journalist who specializes in creating engaging news articles.',
      },
      {
        role: 'user',
        content: englishPrompt,
      },
    ],
    temperature: 0.7, // Lower temperature for more factual content
  })

  // Generate Hindi translation
  const hindiPrompt = `
    Translate this English news article to Hindi, maintaining journalistic tone:
    ${JSON.stringify(englishArticle)}

    Requirements:
    1. Natural and fluent Hindi translation
    2. Maintain formal news article style
    3. Keep all factual information accurate
    4. Return JSON with format:
       {
         "title": "शीर्षक",
         "content": "समाचार सामग्री"
       }
  `

  const hindiArticle = await makeGPTRequest({
    messages: [
      {
        role: 'system',
        content: 'You are an expert Hindi news translator.',
      },
      {
        role: 'user',
        content: hindiPrompt,
      },
    ],
    temperature: 0.7,
  })

  return {
    title: {
      english: englishArticle.title,
      hindi: hindiArticle.title,
    },
    content: {
      english: englishArticle.content,
      hindi: hindiArticle.content,
    },
  }
}

module.exports = {
  getSourceArticles,
  generateMixedArticle,
}
