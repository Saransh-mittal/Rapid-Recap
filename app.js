const dotenv = require('dotenv')
const bodyParser = require('body-parser')
dotenv.config({ path: './config.env' })
const express = require('express')
const userRoutes = require('./router/userRoutes')
const articleRoutes = require('./router/articleRoutes')
const quizRoutes = require('./router/quizRoutes')
const subscriptionRoutes = require('./router/subscriptionRoutes')
const mailRoutes = require('./router/mailRoutes')
const timeSpentRoutes = require('./router/timeSpentRoutes')
const feedbackRoutes = require('./router/feedbackRoutes')
const notificationRoutes = require('./router/notificationRoutes')
const adminRoutes = require('./router/adminRoutes')
const recommendationRoutes = require('./router/recommendationRoutes')
const chatsRoutes = require('./router/chatsRoutes')
const messageRoutes = require('./router/messageRoutes')
const friendsRoutes = require('./router/friendsRoutes')
const tournamentRoutes = require('./router/tournamentRoutes')
const { errorHandler } = require('./middleware/errorMiddleware')
const authRouter = express.Router()
const webpush = require('web-push')
const cookieParser = require('cookie-parser')
const path = require('path')
const http = require('http')
// const compression = require('compression')
// const helmet = require('helmet')

const i18nMiddleware = require('i18next-http-middleware')
const i18n = require('./i18n')

const app = express()

app.use(i18nMiddleware.handle(i18n))
// app.use(
//   compression({
//     level: 6,
//     threshold: 0,
//     filter: () => true,
//   }),
// )
// app.use(helmet())
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// })
// app.use(limiter)
const server = http.createServer(app)

// Body parser middleware
app.use(bodyParser.json())
const connectDB = require('./db/conn')
const { initializeSocket } = require('./socket')

webpush.setVapidDetails(
  'mailto:rapidrecap2k23@gmail.com',
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY,
)

app.use(express.json())
// Error Handling middlewares
app.use(errorHandler)

const PORT = process.env.PORT
authRouter.use(cookieParser())
authRouter.use('/user', userRoutes)
authRouter.use('/articles', articleRoutes)
authRouter.use('/quiz', quizRoutes)
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
authRouter.use('/tournament', tournamentRoutes)
app.use('/api', authRouter)

// -----Production-----
app.use(express.static(path.join(__dirname, './client/dist')))
app.get('*', function (_, res) {
  res.sendFile(
    path.join(__dirname, './client/dist/index.html'),
    function (err) {
      res.status(500).send(err)
    },
  )
})
// ---------------------

// Scheduler
require('./scheduler/setupCronJobs')

initializeSocket(server)

// Connect to the database before starting the server
const startServer = async () => {
  try {
    await connectDB()
    server.listen(PORT, () => {
      console.log(`Listening to port no. ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
  }
}

startServer()

module.exports = { app, server }
