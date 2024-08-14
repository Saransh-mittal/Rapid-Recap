const Article = require('../model/articleSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const {
  genQuiz,
  generateQuestionsForQuiz,
  generateQuestionsForHindiQuiz,
  findQuizByLanguage,
} = require('../utils/quiz.utils')
const {
  breakArticleIntoParagraphs,
  hindiConverter,
  fetchNews,
  processNews,
  extractNewsUtilityFunc,
  loadTfidfModel,
} = require('../utils/article.utils')
const { sendNotification } = require('../services/notificationService')
const { formatDate } = require('../utils/miscellaneous.utils')
const Quiz = require('../model/quizSchema')
const NewsAPI = require('newsapi')
const asyncHandler = require('express-async-handler')
const { TfIdf } = require('natural')
const cosineDistances = require('compute-cosine-distance')
const {
  startSession,
  commitSession,
  abortSession,
  endSession,
} = require('../db/session')
const { default: mongoose } = require('mongoose')

const allArticles = async (req, res) => {
  const { page = 1, pageSize = 9, category = 'general' } = req.query
  //console.log(page, pageSize, category);
  try {
    const article = await Article.find({
      category: { $regex: new RegExp('^' + category, 'i') },
    })
      .sort({
        dateTime: -1,
        'sentiments.compound': -1,
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)

    if (!article) {
      throw new Error('No articles found')
    }
    res.send(article)
  } catch (error) {
    res.status(400).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const getAvgRQMOnArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.query
  try {
    const quizAttempts = await QuizAttempt.find({ article: articleId })
    if (!quizAttempts) {
      res.status(201).json({ avgRQM: 0 })
    }
    let totalRQM = 0
    quizAttempts.forEach(attempt => {
      totalRQM += attempt.RQM_score
    })
    const avgRQM = Math.floor(totalRQM / quizAttempts.length)
    res.status(201).json(avgRQM)
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error)
  }
})

const getArticleIds = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query
  try {
    const articles = await Article.find({}, '_id')
      .sort({ dateTime: -1 })
      .limit(parseInt(limit))
    if (!articles) {
      res.status(422).json({ error: 'No articles found' })
      throw new Error('No articles found')
    }
    const articleIds = articles.map(article => article._id)
    res.status(201).send(articleIds)
  } catch (error) {
    throw new Error(error.message)
  }
})

const getArticle = async (req, res) => {
  const { id } = req.params
  try {
    const article = await Article.findById(id)
    if (!article) {
      throw new Error('Article not found')
    }
    const paragraphs = await breakArticleIntoParagraphs(article.mainText)
    const relatedArticles = []
    for (let relatedArticleID of article.relatedArticles) {
      const relatedArticleFetch = await Article.findById(
        relatedArticleID,
      ).select('_id title imgURL dateTime avgReadTime')
      if (relatedArticleFetch) {
        const relatedArticle = {
          _id: relatedArticleFetch._id,
          title: relatedArticleFetch.title,
          imgURL: relatedArticleFetch.imgURL[0],
          date: formatDate(relatedArticleFetch.dateTime),
          dateTime: new Date(relatedArticleFetch.dateTime),
          avgReadTime: relatedArticleFetch.avgReadTime,
        }
        relatedArticles.push(relatedArticle)
      }
    }
    relatedArticles.sort((a, b) => b.dateTime - a.dateTime)
    const newArticle = {
      category: article.category,
      title: article.title,
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
    }
    let quizExpired = false
    // if (article.quiz) {
    //   const quizId = article.quiz;
    //   const fullQuiz = await Quiz.findById(quizId);
    //   if (!fullQuiz) {
    //     article.quiz = null;
    //     await article.save();
    //     throw new Error("Quiz not found, Please try again.");
    //   }
    //   if (fullQuiz.createdAt.getTime() + 24 * 60 * 60 * 1000 < Date.now()) {
    //     if (fullQuiz.isActive) {
    //       await updatePercentilesOnQuizDeactivation({ id: article._id });
    //       fullQuiz.isActive = false;
    //       await fullQuiz.save();
    //     }
    //     quizExpired = true;
    //   }
    // }
    res.status(201).send({ quizExpired, newArticle })
  } catch (error) {
    res.status(400).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const getQuizTitan = async (req, res) => {
  const { id } = req.params
  try {
    const totalUsersGivenQuiz = await QuizAttempt.find({
      article: id,
    }).countDocuments()
    res.status(200).send({ totalUsersGivenQuiz })
  } catch (error) {
    res.status(400).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const getQuiz = async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id
  //console.log(articleId);
  try {
    if (!articleId) {
      throw new Error('No article provided')
    }
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }
    //console.log(article);

    const { title, author, mainText } = article
    //console.log(title, author, mainText);
    if (!title || !mainText) {
      throw new Error('Please provide all the details')
    }
    if (
      article.userQuizStatus.find(
        status => status.userId.toString() === userId && status.status === true,
      )
    ) {
      throw new Error('Quiz already started')
    }
    let fullQuiz
    if (article.quiz && article.quiz.length > 0) {
      fullQuiz = await findQuizByLanguage({
        language: 'en',
        articleId,
      })
      if (!fullQuiz) {
        fullQuiz = await generateQuestionsForQuiz({
          title,
          author,
          mainText,
          articleId,
        })
      }
    } else {
      fullQuiz = await generateQuestionsForQuiz({
        title,
        author,
        mainText,
        articleId,
      })
    }
    const timer =
      Math.min(
        5,
        fullQuiz.para1.questions.length +
          fullQuiz.para2.questions.length +
          fullQuiz.para3.questions.length,
      ) * 10
    const quiz = await genQuiz({ fullQuiz, title })
    if (quiz.questions.length <= 2) {
      throw new Error('Article is too short for a quiz')
    }
    return res.status(200).json({
      expired: false,
      message: 'Quiz Questions generated successfully',
      timer,
      quiz,
      quizId: fullQuiz._id,
    })
  } catch (error) {
    res.status(400).json({ error: 'Something went wrong! Please try again' })
    console.log(error)
  }
}

const getHindiQuiz = async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id
  //console.log(articleId);
  try {
    if (!articleId) {
      throw new Error('No article provided')
    }
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }
    //console.log(article);

    const { hindiTitle, hindiAuthor, hindiMainText } = article
    //console.log(title, author, mainText);
    if (!hindiTitle || !hindiMainText || !hindiAuthor) {
      throw new Error('Please the select the hindi article first')
    }
    if (
      article.userQuizStatus.find(
        status => status.userId.toString() === userId && status.status === true,
      )
    ) {
      throw new Error('Quiz already started')
    }
    let fullQuiz
    if (article.quiz && article.quiz.length > 0) {
      fullQuiz = await findQuizByLanguage({
        language: 'hi',
        articleId,
      })
      if (!fullQuiz) {
        fullQuiz = await generateQuestionsForHindiQuiz({
          title: hindiTitle,
          author: hindiAuthor,
          mainText: hindiMainText,
          articleId,
        })
      }

      // Now you have a valid fullQuiz
      // Proceed with your code...
    } else {
      fullQuiz = await generateQuestionsForHindiQuiz({
        title: hindiTitle,
        author: hindiAuthor,
        mainText: hindiMainText,
        articleId,
      })
    }
    const timer =
      Math.min(
        5,
        fullQuiz.para1.questions.length +
          fullQuiz.para2.questions.length +
          fullQuiz.para3.questions.length,
      ) * 10
    const quiz = await genQuiz({ fullQuiz, title: hindiTitle })
    if (quiz.questions.length <= 2) {
      throw new Error('Article is too short for a quiz')
    }

    return res.status(200).json({
      expired: false,
      message: 'Quiz Questions generated successfully',
      timer,
      quiz,
      quizId: fullQuiz._id,
    })
  } catch (error) {
    res.status(400).json({
      error: error || 'Something went wrong! Please try again',
    })
    console.log(error)
  }
}

const startQuiz = async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id
  //console.log(userId);
  try {
    if (!articleId) {
      throw new Error('No article provided')
    }
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }
    const quiz = await Quiz.find({ article: articleId })
    if (!quiz || quiz.length === 0) {
      throw new Error('Quiz not found, Please try again!!')
    }
    if (
      article.userQuizStatus.find(
        status => status.userId.toString() === userId && status.status === true,
      )
    ) {
      throw new Error('Quiz already started')
    }
    article.userQuizStatus.push({ userId, status: true })
    await article.save()
    res.status(200).json({ message: 'Quiz started successfully' })
  } catch (error) {
    res.status(400).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const getArticleQuizStatus = async (req, res) => {
  const { articleId } = req.params
  const userId = req.user._id
  try {
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }
    const userStatus = article.userQuizStatus.find(
      status => status.userId.toString() === userId,
    )
    if (!userStatus) {
      return res.status(200).json({ status: false })
    }
    res.status(200).json({ status: userStatus.status })
  } catch (error) {
    res.status(400).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const getTopRankers = async (req, res) => {
  const { articleId } = req.query
  try {
    const quizAttempts = await QuizAttempt.find({ article: articleId })
      .sort({ RQM_score: -1 })
      .limit(3)
      .populate({
        path: 'user',
        select: 'name inGameName IQ_score maxIQScore', // Specify the fields you want to select
      })

    const rankers = []
    let rank = 1
    quizAttempts.forEach((attempt, index) => {
      //console.log(attempt);
      if (!attempt.user) {
        return
      }
      rankers.push({
        rank: rank,
        name: attempt.user.name,
        inGameName: attempt.user.inGameName,
        IQ_score: attempt.user.IQ_score,
        maxIQScore: attempt.user.maxIQScore,
      })
      rank++
    })
    res.status(200).json({ rankers })
  } catch (error) {
    res.status(500).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const hindiTranslation = async (req, res) => {
  const { articleId } = req.params
  try {
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }
    const response = await hindiConverter(article)
    if (!article.hindiMainText) {
      article.hindiMainText = []
      await article.save()
    }
    article.hindiTitle = response.hindiTitle

    for (let key in response.hindiMainText) {
      if (!response.hindiMainText[key]) continue
      article.hindiMainText.push(response.hindiMainText[key])
    }
    article.hindiAuthor = response.hindiAuthor
    await article.save()
    res.status(200).json({ status: 'ok', article })
  } catch (error) {
    res.status(500).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const testNewsApi = async (req, res) => {
  const newsapi = new NewsAPI('d934f2488faf498aa6ba4a3be52bb439')
  console.log('Testing news api')
  try {
    let options = {
      category: 'general',
      language: 'en',
      pageSize: 10,
      country: 'in',
    }
    let articles = []
    // const entertainmentQueries = ['movies', 'music', 'bollywood']
    // options.pageSize = 5

    // for (let query of entertainmentQueries) {
    //   options.q = query
    //   const response = await newsapi.v2.topHeadlines(options)
    //   articles = articles.concat(response.articles)
    // }
    // // remove q parameter to get general entertainment news
    // delete options.q
    const response = await newsapi.v2.topHeadlines(options)
    articles = articles.concat(response.articles)
    //console.log(response.articles[1]);
    res.status(200).json(articles)
  } catch (error) {
    console.log(error)
  }
}

const getWorldNews = async (req, res) => {
  try {
    const queries = [
      'source-countries=in&text=IPL OR T20WorldCup',
      'source-countries=in&text=elections OR dhruv OR rathee OR Modi OR ashok OR gehlot',
      'text=Ramayan OR pakistani OR gandi OR krishna OR astrology',
    ]

    let allProcessedOutput = []

    for (let query of queries) {
      const news = await fetchNews(query)

      if (news.length === 0) {
        console.log('No news articles found for query:', query)
        continue
      }

      console.log('\nProcessing news articles for query:', query, '\n')

      const processedOutput = await processNews(news)

      console.log(
        '\nNews articles processed successfully for query:',
        query,
        '\n',
      )
      allProcessedOutput = allProcessedOutput.concat(processedOutput)
    }
    let genCnt = 0
    let entCnt = 0
    let techCnt = 0
    let sportsCnt = 0
    let scienceCnt = 0
    let healthCnt = 0
    let busiCnt = 0

    for (let article of allProcessedOutput) {
      if (article.category.toLowerCase() === 'general') genCnt++
      if (article.category.toLowerCase() === 'entertainment') entCnt++
      if (article.category.toLowerCase() === 'technology') techCnt++
      if (article.category.toLowerCase() === 'sports') sportsCnt++
      if (article.category.toLowerCase() === 'science') scienceCnt++
      if (article.category.toLowerCase() === 'health') healthCnt++
      if (article.category.toLowerCase() === 'business') busiCnt++
    }
    res.status(200).json({
      message: `No. of news fetched for DB : ${allProcessedOutput.length}\n General : ${genCnt}\n Entertainment : ${entCnt}\n Technology : ${techCnt}\n Sports : ${sportsCnt}\n Science : ${scienceCnt}\n Health : ${healthCnt}\n Business : ${busiCnt}`,
    })
    // send notification to all users
    const title = '📢 New Content Alert! 📰'
    const body =
      'Exciting news just in! Explore our latest articles and breaking news updates to stay ahead of the curve. Tap to discover now!'
    const url = 'https://www.rapidrecap.co.in/'
    sendNotification({ title, body, url })
  } catch (error) {
    res.status(500).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

const extractNews = async (req, res) => {
  try {
    const { result, articlesSavedPerCategory, notificationCategories } =
      await extractNewsUtilityFunc()

    res.status(200).json({
      message: `No. of news fetched for DB : ${result.length}`,
      articlesSavedPerCategory: articlesSavedPerCategory,
    })

    // if (result.length > 0) {
    //   const title = `📢 New ${notificationCategories} Content Alert! 📰`;
    //   const body =
    //     "Exciting news just in! Explore our latest articles and breaking news updates to stay ahead of the curve. Tap to discover now!";
    //   const url = "https://www.rapidrecap.co.in/";
    //   await sendNotification({ title, body, url });
    // }
  } catch (error) {
    res.status(500).json({ error: error || 'Something went wrong' })
    console.log(error)
  }
}

// @desc    Update an article
// @route   PUT /api/admin/articles/:id
// @access  Admin
const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updatedData = req.body

  // Find the article by ID
  const article = await Article.findById(id)

  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }

  // Start a transaction
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Update main article fields
    Object.keys(updatedData).forEach(key => {
      if (key !== 'quiz' && key !== 'userQuizStatus') {
        article[key] = updatedData[key]
      }
    })

    if (updatedData.quiz && updatedData.quiz.length > 0) {
      console.log(updatedData.quiz)
      const quizData = updatedData.quiz[0] // Get the first (and only) quiz object
      let quiz

      if (article.quiz && article.quiz.length > 0) {
        // Update existing quiz
        quiz = await Quiz.findByIdAndUpdate(
          article.quiz[0],
          {
            overAllDifficulty: quizData.overAllDifficulty,
            para1: quizData.para1,
            para2: quizData.para2,
            para3: quizData.para3,
          },
          { new: true, session },
        )
      }
    }
    // update the article\
    article.title = updatedData.title
    article.author = updatedData.author
    article.totalQuizAttempts = updatedData.totalQuizAttempts
    article.mainText = updatedData.mainText
    article.userQuizStatus = updatedData.userQuizStatus
    article.relatedArticles = updatedData.relatedArticles
    article.avgReadTime = updatedData.avgReadTime
    // Save the updated article
    await article.save({ session })

    // Commit the transaction
    await session.commitTransaction()

    // Fetch the updated article with populated fields
    const updatedArticle = await Article.findById(id)
      .populate('quiz')
      .populate('relatedArticles', 'title author category dateTime')
      .populate('userQuizStatus.userId', 'name email')

    res.status(200).json({
      message: 'Article updated successfully',
      article: updatedArticle,
    })
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction()
    throw error
  } finally {
    // End the session
    session.endSession()
  }
})

// @desc    Search  article
// @route   GET /api/articles/search?query={query}
// @access  Protected
const searchArticles = asyncHandler(async (req, res) => {
  const { query } = req.query

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' })
  }

  // Load TF-IDF model
  const tfidfModel = await loadTfidfModel()
  const tfidfVectorizer = new TfidfVectorizer()
  tfidfVectorizer.setVocabulary(tfidfModel.vocabulary)

  // Transform query
  const queryVector = tfidfVectorizer.transform([query])

  // Get all articles
  const articles = await Article.find(
    {},
    'title mainText category author dateTime',
  )

  // Calculate similarity
  const similarities = articles.map(article => {
    const articleVector = tfidfVectorizer.transform([
      `${article.title} ${article.mainText}`,
    ])
    return {
      article,
      similarity: 1 - cosineDistances(queryVector[0], articleVector[0]),
    }
  })

  // Sort by similarity
  similarities.sort((a, b) => b.similarity - a.similarity)

  // Return top 10 results
  const results = similarities.slice(0, 10).map(item => item.article)

  res.json(results)
})

// @desc    Admin search articles with filters
// @route   GET /api/admin/articles/search?query={query}&category={category}&author={author}&startDate={startDate}&endDate={endDate}&hasQuiz={hasQuiz}
// @access  Admin
const adminSearchArticles = asyncHandler(async (req, res) => {
  const { query, category, author, startDate, endDate, hasQuiz } = req.query

  // Build filter object
  const filter = {}
  if (category) filter.category = category
  if (author) filter.author = author
  if (startDate && endDate) {
    filter.dateTime = {
      $gte: new Date(startDate).toISOString(),
      $lte: new Date(endDate).toISOString(),
    }
  }
  if (hasQuiz === 'true') filter.quiz = { $exists: true, $ne: [] }
  if (hasQuiz === 'false') filter.quiz = { $exists: true, $eq: [] }

  let articles
  if (query && query !== '') {
    // Use text search if query is provided
    articles = await Article.find(
      { $text: { $search: query }, ...filter },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(50)
      .select(
        'url dateTime author hindiAuthor title hindiTitle mainText hindiMainText imgURL quiz userQuizStatus category relatedArticles avgReadTime quizAttemptCnt',
      )
  } else {
    // If no query provided, return all filtered articles
    articles = await Article.find(filter)
      .limit(50)
      .select(
        'url dateTime author hindiAuthor title hindiTitle mainText hindiMainText imgURL quiz userQuizStatus category relatedArticles avgReadTime quizAttemptCnt',
      )
  }

  // Fetch related articles for the top result
  let relatedArticles = []
  if (articles.length > 0) {
    const topArticle = articles[0]
    relatedArticles = await Article.find({
      _id: { $in: topArticle.relatedArticles },
    })
      .select(
        'url dateTime author hindiAuthor title hindiTitle mainText hindiMainText imgURL quiz userQuizStatus category relatedArticles avgReadTime quizAttemptCnt',
      )
      .limit(10)
  }

  res.json({
    searchResults: articles,
    relatedArticles: relatedArticles,
  })
})

// @desc    Get article details for admin
// @route   GET /api/admin/articles/:articleId
// @access  Admin
const getAdminArticleDetails = asyncHandler(async (req, res) => {
  const { articleId } = req.params

  const article = await Article.findById(articleId)
    .populate({
      path: 'quiz',
      select: 'para1 para2 para3 overAllDifficulty',
    }) // Populate quiz details
    .populate('userQuizStatus.userId', 'name email') // Populate user details for quiz status
    .lean() // Use lean() for better performance as we don't need Mongoose document methods

  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }

  const enrichedArticle = {
    ...article,
    quizAttemptCnt: article.quizAttemptCnt,
    totalRelatedArticles: article.relatedArticles.length,
  }

  res.json(enrichedArticle)
})
module.exports = {
  allArticles,
  getArticle,
  getQuiz,
  getArticleQuizStatus,
  startQuiz,
  getTopRankers,
  hindiTranslation,
  getHindiQuiz,
  getWorldNews,
  extractNews,
  testNewsApi,
  getQuizTitan,
  getArticleIds,
  getAvgRQMOnArticle,
  updateArticle,
  searchArticles,
  adminSearchArticles,
  getAdminArticleDetails,
}
