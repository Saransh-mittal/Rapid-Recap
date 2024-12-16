const { spawn } = require('child_process')
const User = require('../model/userSchema')
const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const {
  Recommendation,
  NotifiedArticles,
} = require('../model/recommendationSchema')
const path = require('path')
const { hindiConverter } = require('../utils/article.utils')
const { formatPreferredCategories } = require('../utils/user.utils')

const runPythonScript = (scriptPath, userId, userPreferredCategories) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      scriptPath,
      userId,
      userPreferredCategories,
    ])

    pythonProcess.stdout.on('data', data => {
      console.log(`Python script output: ${data}`)
    })

    pythonProcess.stderr.on('data', data => {
      console.error(`Python script error: ${data}`)
    })

    pythonProcess.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Python script exited with code ${code}`))
      }
    })
  })
}

async function generateRecommendations(userId) {
  const pythonScriptPath = path.join(
    __dirname,
    '..',
    'scripts',
    'recommender.py',
  )
  await runPythonScript(pythonScriptPath, userId)
}

const updateRecommendations = async userId => {
  try {
    const user = await User.findById(userId)
    if (!user) {
      console.error('User not found')
      return
    }

    // Convert the preferredCategories to an array of objects
    const userPreferredCategories = formatPreferredCategories(
      user.preferredCategories,
    )

    const pythonScriptPath = path.join(
      __dirname,
      '..',
      'scripts',
      'recommender.py',
    )
    await runPythonScript(
      pythonScriptPath,
      userId,
      JSON.stringify(userPreferredCategories),
    )

    const updatedRecommendations = await Recommendation.findOne({
      user_id: userId,
    })
    return updatedRecommendations
  } catch (error) {
    console.error('Error in updateRecommendations:', error)
    throw error
  }
}

const getRecommendations = async (userId, page = 1, pageSize = 18) => {
  try {
    let userRecommendations = await Recommendation.findOne({ user_id: userId })
    const now = new Date()
    const updateThreshold = new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago

    if (
      !userRecommendations ||
      userRecommendations.lastUpdated < updateThreshold
    ) {
      updateRecommendations(userId)
    }
    // return empry array if no recommendations
    if (!userRecommendations) {
      return []
    }
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    const recommendationsToServe = userRecommendations.recommendations.slice(
      startIndex,
      endIndex,
    )

    // Mark recommendations as served
    await Recommendation.updateOne(
      { user_id: userId },
      { $set: { 'recommendations.$[elem].served': true } },
      {
        arrayFilters: [
          { 'elem._id': { $in: recommendationsToServe.map(rec => rec._id) } },
        ],
      },
    )

    return recommendationsToServe
  } catch (error) {
    console.error('Error in getRecommendations:', error)
    throw error
  }
}

async function getArticlePageRecommendations(
  userId,
  articleId,
  page = 1,
  pageSize = 18,
  lang,
) {
  try {
    let userRecommendations = await Recommendation.findOne({ user_id: userId })

    const now = new Date()
    const updateThreshold = new Date(now.getTime() - 4 * 60 * 60 * 1000) // 4 hours ago

    if (
      !userRecommendations ||
      userRecommendations.lastUpdated < updateThreshold
    ) {
      updateRecommendations(userId) // Trigger an update in the background
    }

    if (
      !userRecommendations ||
      userRecommendations.recommendations.length < pageSize
    ) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait for 5 seconds
      userRecommendations = await Recommendation.findOne({ user_id: userId })
    }

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    const recommendationsToServe = userRecommendations.recommendations
      .filter(rec => !rec.served && rec._id.toString() !== articleId)
      .slice(startIndex, endIndex)

    await Recommendation.updateOne(
      { user_id: userId },
      { $set: { 'recommendations.$[elem].served': true } },
      {
        arrayFilters: [
          { 'elem._id': { $in: recommendationsToServe.map(rec => rec._id) } },
        ],
      },
    )

    const articles = []

    for (let recommendation of recommendationsToServe) {
      // Check if a quiz attempt exists for the user and article
      const quizAttempt = await QuizAttempt.findOne({
        user: userId,
        article: recommendation._id,
      })

      // If no quiz attempt exists, add the article to the articles array
      if (!quizAttempt) {
        const article = await Article.findById(recommendation._id)
        if (article) {
          articles.push(article)
        }
      }
    }
    if (lang === 'hi')
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

    return articles
  } catch (error) {
    console.error('Error in getRecommendations:', error)
    throw error
  }
}

async function getRecommendationsForNotification(userId, topN = 20) {
  try {
    let userRecommendations = await Recommendation.findOne({ user_id: userId })

    if (!userRecommendations) {
      await updateRecommendations(userId)
      userRecommendations = await Recommendation.findOne({ user_id: userId })
    }

    if (
      !userRecommendations ||
      userRecommendations.recommendations.length === 0
    ) {
      return null
    }

    // Get the list of already notified article IDs for this user
    let notifiedArticles = await NotifiedArticles.findOne({ user_id: userId })
    if (!notifiedArticles) {
      notifiedArticles = new NotifiedArticles({
        user_id: userId,
        notified_articles: [],
      })
      await notifiedArticles.save()
    }
    const notifiedArticleIds = new Set(
      notifiedArticles.notified_articles.map(na => na.article_id.toString()),
    )

    // Filter not notified recommendations and take the top N
    const topNotNotifiedRecommendations = userRecommendations.recommendations
      .filter(rec => !notifiedArticleIds.has(rec._id.toString()))
      .slice(0, topN)

    if (topNotNotifiedRecommendations.length === 0) {
      return null
    }

    // Select a random recommendation from the top N
    const randomIndex = Math.floor(
      Math.random() * topNotNotifiedRecommendations.length,
    )
    const selectedRecommendation = topNotNotifiedRecommendations[randomIndex]

    // Add the selected article to the notified articles list
    await NotifiedArticles.updateOne(
      { user_id: userId },
      {
        $push: {
          notified_articles: { article_id: selectedRecommendation._id },
        },
      },
    )
    await Recommendation.updateOne(
      { user_id: userId, 'recommendations._id': selectedRecommendation._id },
      { $set: { 'recommendations.$.notified': true } },
    )

    return selectedRecommendation
  } catch (error) {
    console.error('Error in getRecommendationsForNotification:', error)
    throw error
  }
}

module.exports = {
  getRecommendations,
  updateRecommendations,
  generateRecommendations,
  getRecommendationsForNotification,
  getArticlePageRecommendations,
}
