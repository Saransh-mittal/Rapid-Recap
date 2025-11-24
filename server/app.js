const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const { createSSRMiddleware } = require('./middleware/ssrMiddleware')
dotenv.config({ path: './config.env' })
const express = require('express')
const userRoutes = require('./router/userRoutes')
const articleRoutes = require('./router/articleRoutes')
const quizRoutes = require('./router/quizRoutes')
const gameHubRoutes = require('./router/gameHubRoutes')
const subscriptionRoutes = require('./router/subscriptionRoutes')
const mailRoutes = require('./router/mailRoutes')
const timeSpentRoutes = require('./router/timeSpentRoutes')
const feedbackRoutes = require('./router/feedbackRoutes')
const notificationRoutes = require('./router/notificationRoutes')
const adminRoutes = require('./router/adminRoutes')
const recommendationRoutes = require('./router/recommendationRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const chatsRoutes = require('./router/chatsRoutes')
const messageRoutes = require('./router/messageRoutes')
const friendsRoutes = require('./router/friendsRoutes')
const tournamentRoutes = require('./router/tournamentRoutes')
const leaderboardRoutes = require('./router/leaderboardRoutes')
const abilityRoutes = require('./router/abilityRoutes')
const quickClashRoutes = require('./router/quickClashRoutes')
const publicSpecialCategoryRoutes = require('./router/publicSpecialCategoryRoutes')
const authRouter = express.Router()
const webpush = require('web-push')
const cookieParser = require('cookie-parser')
const { initializeSocket } = require('./socket')
const compression = require('compression')
const helmet = require('helmet')
const i18nMiddleware = require('i18next-http-middleware')
const i18n = require('./i18n')
const { initBotTracking } = require('./utils/botTracker')
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware')
const configureSession = require('./config/sessionConfig')
const {
  generateCsrfToken,
  validateCsrfToken,
} = require('./middleware/csrfMiddleware')
const {
  trackAnalysisInteraction,
} = require('./middleware/feedbackTrackingMiddleware')
const {
  globalErrorHandler,
  notFoundHandler,
} = require('./middleware/globalErrorHandlerMiddleware')
const {
  languageDetectionMiddleware,
} = require('./utils/languageDetection.utils')

const app = express()
// CORS configuration - only needed in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001')
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    )
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Credentials', true)
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })
}
// Apply security middleware first
// app.use(maintenanceMiddleware)
app.use(i18nMiddleware.handle(i18n))

app.use(
  compression({
    level: 6,
    threshold: 0,
    filter: () => true,
  }),
)
app.use(helmet())

// Body parser middleware
app.use(bodyParser.json())
require('./db/conn')

// ADD: Initialize feedback tracking middleware BEFORE routes
console.log('Initializing feedback tracking system...')

// ADD: Apply feedback tracking middleware for all requests
app.use(trackAnalysisInteraction)

webpush.setVapidDetails(
  'mailto:rapidrecap2k23@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY,
)

// Add a pseado middleware to delay responses by 500ms to mimic real-world conditions of far away servers

// app.use((req, res, next) => {
//   setTimeout(() => {
//     next()
//   }, 5000)
// })

// -----Testings-----
//require("./test/conn.test");
//require("./test/index");
// ------------------

// ------Deleteion utils------
//require("./utils/deletion.utils/removeUser.del");
//require("./utils/deletion.utils/removeDailIQField.del");
//require("./utils/deletion.utils/quizGivenByUserDeletion");
//require("./utils/deletion.utils/removeBotUsers.del");
//require("./utils/deletion.utils/removeQuizAttemptForNullUser.del");
// require('./utils/deletion.utils/removeArticle.del')
// require("./utils/deletion.utils/useLessArticle.del");
// require('./utils/deletion.utils/tournaments.del')
// ---------------------------

// -----Update Collection-----
//require("./utils/update.utils/maxIQScore.update.js");
//require("./utils/update.utils/quizActiveStatus.update");
//require("./utils/update.utils/quizCountUpdate.update");
//require("./utils/update.utils/name.update");
//require("./utils/update.utils/rank.update")();
//require("./utils/update.utils/cleanUpBadQuizAttempts.update");
//require("./utils/update.utils/updateUserAppUpdate");
//require("./utils/update.utils/updateAppUpdates.update");
//require("./utils/update.utils/quizLang.update");
//require("./utils/update.utils/generateHindiTrans.update");
//require("./utils/update.utils/genHindiQuizForArticles");
//require("./utils/update.utils/articleCategory.update");
//require("./utils/update.utils/subscription.update");
//require("./utils/update.utils/avg_RQM.update");
//require("./utils/update.utils/userExperienceLevel.update");
// require("./utils/update.utils/season.update");
// require('./utils/update.utils/article.update')
// require("./utils/update.utils/quizAttemptIndex.update");
// require("./utils/update.utils/timeSpentIndexes");
// require('./utils/update.utils/userBadge')
// require('./utils/update.utils/tournamentScore')
// require('./utils/update.utils/updateCurrAffairsTour')
// ---------------------------

// -----Bot utils-----
//require("./utils/bot.utils/generateFakeUsers");
//require("./utils/bot.utils/generateFakeQuizAttempts");
//require("./utils/bot.utils/generatePicForUsers");
//require("./utils/bot.utils/updateBots");

// ------Scripts------
// require("./scripts/usersUsingApp");
// require("./scripts/usersGivingQuizStats");
// require("./scripts/usersLastLoggedInStats");
// require("./scripts/updateUserCurrentSeason");
// require("./scripts/quizAttemptAndDailyIQUpdateSeason");
// require("./scripts/collectionToCSV");
// require('./scripts/script_prepare_article_data')()
// require("./scripts/usersEnabledNotifs");
// require("./scripts/generateCryptoKey");
// require('./scripts/testArticleCat')
// require("./scripts/chatStatus");
// require('./scripts/checkUserScoreOfUser')
// require('./scripts/googlePlayDummyUser')
// require('./scripts/runHighlightTest.js')
// require('./scripts/vectorizeArticles')
// require('./scripts/analyzeUserDistribution')
// require('./scripts/normalizeIQ')
// -------------------

// const { dailyUserIQCalc } = require('./utils/dailyUserIQCalc.utils')
// dailyUserIQCalc()
// const {
//   generateTournamentQuestions,
// } = require('./services/tournamentQuestionService')
// generateTournamentQuestions()
// const { exportDataToCSV } = require("./services/recommendationService");
// exportDataToCSV();

// const {
//   simulateBotQuizParticipation,
// } = require('./scheduler/tasks/dummyUserTournamentTasks')
// simulateBotQuizParticipation()

app.use(express.json())
// Error Handling middlewares
// app.use(notFound);
app.use(errorHandler)
// const generateSitemap = require('./generate-sitemap')
// generateSitemap()
// const generateGoogleNewsSitemap = require('./google-sitemap-generator')
// generateGoogleNewsSitemap()
// const { runCompleteWorkflow } = require('./scripts/runCompleteForgeWorkflow')
// runCompleteWorkflow()
// require('./utils/deletion.utils/removeForgeData.del')
// require('./scripts/generateForgeQuizzes')
require('./scheduler/setupCronJobs')

const PORT = process.env.PORT
authRouter.use(cookieParser())
app.use(configureSession())
app.use('/api', languageDetectionMiddleware)
app.use(generateCsrfToken)
authRouter.use(validateCsrfToken)
authRouter.use('/user', userRoutes)
authRouter.use('/articles', articleRoutes)
authRouter.use('/quiz', quizRoutes)
authRouter.use('/gamehub', gameHubRoutes)
authRouter.use('/subs', subscriptionRoutes)
authRouter.use('/mail', mailRoutes)
authRouter.use('/timeSpent', timeSpentRoutes)
authRouter.use('/contact/feedback', feedbackRoutes)
authRouter.use('/notify', notificationRoutes)
authRouter.use('/admin', adminRoutes)
authRouter.use('/recommendation', recommendationRoutes)
authRouter.use('/chat', chatsRoutes)
authRouter.use('/message', messageRoutes)
authRouter.use('/friends', friendsRoutes)
// authRouter.use('/tournament', tournamentRoutes)
authRouter.use('/leaderboard', leaderboardRoutes)
authRouter.use('/abilities', abilityRoutes)
authRouter.use('/quickClash', quickClashRoutes)
authRouter.use('/special-categories', publicSpecialCategoryRoutes)
app.use('/api', authRouter)



initBotTracking()
async function initializeApp() {
  try {
    const ssrMiddleware = await createSSRMiddleware(app)

    // Apply SSR middleware after API routes but before static files
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next()
      }
      ssrMiddleware(req, res, next)
      ssrMiddleware(req, res, next)
    })

    // Add error handlers AFTER SSR middleware
    app.use(notFoundHandler)
    app.use(globalErrorHandler)
  } catch (err) {
    console.error('Failed to initialize SSR:', err)
    // Fallback to CSR in case of SSR failure
    app.use((req, res) => {
      if (req.path.startsWith('/api/')) {
        return next()
      }
      res.sendFile(path.join(__dirname, '../client/dist/index.html'))
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
    })

    // Add error handlers in fallback case too
    app.use(notFoundHandler)
    app.use(globalErrorHandler)
  }
}
initializeApp().catch(err => {
  console.error('Failed to initialize app:', err)
})
const server = app.listen(PORT, () => {
  console.log(`Listening to port no. ${PORT}`)
})

initializeSocket(server)

module.exports = { app, server }
