const ArticleHighlight = require('../../model/articleHighlightSchema')
const { formatDate } = require('../../utils/miscellaneous.utils')
const {
  hindiConverter,
  breakArticleIntoParagraphs,
  calculateArticleDifficulty,
} = require('../../utils/article.utils')
const Article = require('../../model/articleSchema')

async function batchUpdateArticleDifficulties(articles) {
  const updates = articles
    .filter(
      article =>
        !article.articleDifficulty || article.articleDifficulty === 0.5,
    )
    .map(async article => {
      try {
        const difficulty = calculateArticleDifficulty({
          mainText: article.mainText,
        })
        await Article.findByIdAndUpdate(article._id, {
          articleDifficulty: difficulty,
        })
      } catch (error) {
        console.error(
          `Error in batch update for article ${article._id}:`,
          error,
        )
      }
    })

  // Run updates in background
  Promise.all(updates).catch(error => {
    console.error('Error in batch difficulty updates:', error)
  })
}

async function processArticles(articles, lang, isPrivileged = null) {
  if (!articles) return null
  batchUpdateArticleDifficulties(articles)
  if (lang === 'hi') {
    for (let article of articles) {
      if (
        !article.hindiTitle ||
        !article.hindiMainText ||
        !article.hindiAuthor
      ) {
        const response = await hindiConverter(article._id)
        if (!article.hindiMainText) {
          article.hindiMainText = []
        }
        article.hindiTitle = response.hindiTitle

        for (let key in response.hindiMainText) {
          if (!response.hindiMainText[key]) continue
          article.hindiMainText.push(response.hindiMainText[key])
        }
        article.hindiAuthor = response.hindiAuthor
      }
    }
  }

  return Promise.all(
    articles.map(async article => {
      const paragraphs = await breakArticleIntoParagraphs(article.mainText)
      const highlights = await ArticleHighlight.findOne({
        articleId: article._id,
        processingStatus: 'completed',
        language: lang || 'en',
      })
      let difficulty = article.articleDifficulty
      if (isPrivileged && !article.articleDifficulty) {
        difficulty = calculateArticleDifficulty({ mainText: article.mainText })
      }
      return {
        category: article.category,
        title: article.title,
        quizAttemptCnt: article.quizAttemptCnt,
        mainText: paragraphs,
        author: article.author,
        imgURL: Array.isArray(article.imgURL) ? article.imgURL[0] : '',
        hindiTitle: article?.hindiTitle,
        hindiMainText: article?.hindiMainText,
        hindiAuthor: article?.hindiAuthor,
        avgReadTime: article?.avgReadTime,
        date: formatDate(article.dateTime),
        dateTime: article.dateTime,
        _id: article._id,
        dictionary: highlights?.dictionary || [],
        importantSentences: highlights?.importantSentences || [],
        articleDifficulty: isPrivileged ? difficulty || 0.5 : undefined,
      }
    }),
  )
}

module.exports = { processArticles, batchUpdateArticleDifficulties }
