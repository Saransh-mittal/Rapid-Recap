const { sendNotification } = require('../../services/notificationService')
const {
  getRecommendationsForNotification,
} = require('../../services/recommendationService')
const User = require('../../model/userSchema')
const Article = require('../../model/articleSchema')
const slugify = require('slugify')

async function sendRecommendedNewsNotification() {
  console.log('Processing users for recommendations')
  try {
    const users = await User.find({
      email: { $not: /^dummy\d+@mail\.com$/ },
      inGameName: { $exists: true },
    }).select('_id')
    for (const user of users) {
      const recommendation = await getRecommendationsForNotification(
        user._id,
        20,
      )
      if (recommendation) {
        const article = await Article.findById(recommendation._id)
        if (article) {
          const title = article.title
          const url = `https://www.rapidrecap.co.in/article/${
            article._id
          }/${slugify(title)}`
          const image =
            article.imgURL && article.imgURL.length > 0
              ? article.imgURL[0]
              : null
          await sendNotification({ userId: user._id, title, url, image })
          console.log(
            `Notification sent for recommended article to user ${user._id}`,
          )
        }
      }
    }
    console.log('Processed recommendations for all users')
  } catch (error) {
    console.error('Error processing users for recommendations:', error)
  }
}

module.exports = sendRecommendedNewsNotification
