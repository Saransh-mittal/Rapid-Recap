// src/services/articleDetailService.js
const Article = require('../../model/articleSchema')
const {
  hindiConverter,
  breakArticleIntoParagraphs,
} = require('../../utils/article.utils')
const { formatDate } = require('../../utils/miscellaneous.utils')

async function getRelatedArticles(relatedArticleIds) {
  const relatedArticles = await Promise.all(
    relatedArticleIds.map(async relatedArticleID => {
      const relatedArticle = await Article.findById(relatedArticleID).select(
        '_id title imgURL dateTime avgReadTime',
      )

      if (relatedArticle) {
        return {
          _id: relatedArticle._id,
          title: relatedArticle.title,
          imgURL: relatedArticle.imgURL[0],
          date: formatDate(relatedArticle.dateTime),
          dateTime: new Date(relatedArticle.dateTime),
          avgReadTime: relatedArticle.avgReadTime,
        }
      }
      return null
    }),
  )

  return relatedArticles.filter(Boolean).sort((a, b) => b.dateTime - a.dateTime)
}

async function processDetailedArticle(article, highlights, lang, privileges) {
  // Handle Hindi conversion if needed
  if (
    lang === 'hi' &&
    (!article.hindiTitle || !article.hindiMainText || !article.hindiAuthor)
  ) {
    const response = await hindiConverter(article._id)
    article.hindiTitle = response.hindiTitle
    article.hindiMainText = response.hindiMainText
    article.hindiAuthor = response.hindiAuthor
  }

  const paragraphs = await breakArticleIntoParagraphs(article.mainText)
  const relatedArticles = await getRelatedArticles(article.relatedArticles)
  const isArticleCategoryBoosted =
    privileges.hasAnyPrivilege &&
    privileges?.privilegesByCategory?.[article.category]?.rqmBoost

  return {
    category: article.category,
    title: article.title,
    url: article.url,
    quizAttemptCnt: article.quizAttemptCnt,
    mainText: paragraphs,
    author: article.author,
    imgURL: article.imgURL[0],
    hindiTitle: article?.hindiTitle,
    hindiMainText: article?.hindiMainText,
    hindiAuthor: article?.hindiAuthor,
    relatedArticles,
    avgReadTime: article?.avgReadTime,
    date: formatDate(article.dateTime),
    _id: article._id,
    dictionary: highlights?.dictionary || [],
    importantSentences: highlights?.importantSentences || [],
    isArticleCategoryBoosted,
  }
}

module.exports = { processDetailedArticle, getRelatedArticles }
