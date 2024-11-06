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
} = require('../utils/article.utils')
const { sendNotification } = require('../services/notificationService')
const {
  formatDate,
  getFormattedImage,
} = require('../utils/miscellaneous.utils')
const Quiz = require('../model/quizSchema')
const NewsAPI = require('newsapi')
const asyncHandler = require('express-async-handler')
const { default: mongoose } = require('mongoose')
const cache = require('memory-cache')
const Story = require('../model/storySchema')
const User = require('../model/userSchema')
const { generateStory } = require('../services/storyGenerateService')
const LanguageDetect = require('langdetect')
const ArticleHighlight = require('../model/articleHighlightSchema')
const {
  generateHighlightForArticle,
} = require('../utils/article.highlight.utils')

const allArticles = async (req, res) => {
  const { page = 1, pageSize = 9, category = 'general', lang } = req.query
  const cacheKey = `articles_${category}_${lang}_${page}_${pageSize}`
  const cachedArticles = cache.get(cacheKey)

  if (cachedArticles) {
    return res.send(cachedArticles)
  }

  try {
    const articles = await Article.find({
      category: { $regex: new RegExp('^' + category, 'i') },
    })
      .sort({
        dateTime: -1,
        'sentiments.compound': -1,
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)

    if (!articles || articles.length === 0) {
      throw new Error('No articles found')
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

    const processedArticles = await Promise.all(
      articles.map(async article => {
        const paragraphs = await breakArticleIntoParagraphs(article.mainText)
        const highlights = await ArticleHighlight.findOne({
          articleId: article._id,
          processingStatus: 'completed',
          language: lang ? lang : 'en',
        })
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
          // Add highlights if they exist
          dictionary: highlights?.dictionary || [],
          importantSentences: highlights?.importantSentences || [],
        }
      }),
    )

    // Cache the processed articles for 1 hour (3600000 milliseconds)
    cache.put(cacheKey, processedArticles, 3600000)

    res.send(processedArticles)
  } catch (error) {
    res.status(400).json({ error: error.message || 'Something went wrong' })
    console.error(error)
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

// @desc  Get article details
// @route GET /api/articles/article/:id
// @access Public
const getArticle = async (req, res) => {
  const { id } = req.params
  const { lang } = req.query
  try {
    const cacheKey = `article_${lang ? lang : 'en'}_${id}`
    const cachedArticle = cache.get(cacheKey)

    if (
      cachedArticle &&
      !(
        lang === 'hi' &&
        (!cachedArticle.hindiTitle ||
          !cachedArticle.hindiMainText ||
          !cachedArticle.hindiAuthor ||
          !cachedArticle.dictionary ||
          !cachedArticle.importantSentences ||
          cachedArticle.dictionary.length === 0 ||
          cachedArticle.importantSentences.length === 0)
      ) &&
      cachedArticle.dictionary &&
      cachedArticle.importantSentences &&
      cachedArticle.dictionary.length > 0 &&
      cachedArticle.importantSentences.length > 0
    ) {
      return res.json({ quizExpired: false, newArticle: cachedArticle })
    }

    // Fetch article and highlights
    const [article, highlights] = await Promise.all([
      Article.findById(id),
      ArticleHighlight.findOne({
        articleId: id,
        processingStatus: 'completed',
        language: lang ? lang : 'en',
      }),
    ])

    if (!article) {
      throw new Error('Article not found')
    }
    // console.log(highlights)
    // If no highlights exist or they failed, trigger background processing
    let newHighlights = highlights
    if (!highlights || highlights.processingStatus !== 'completed') {
      try {
        newHighlights = await generateHighlightForArticle({
          articleId: id,
          lang: lang ? lang : 'en',
        })
      } catch (error) {
        console.error('Error generating highlights:', error)
      }
    }

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

    // Process related articles
    const relatedArticles = await Promise.all(
      article.relatedArticles.map(async relatedArticleID => {
        const relatedArticleFetch = await Article.findById(
          relatedArticleID,
        ).select('_id title imgURL dateTime avgReadTime')

        if (relatedArticleFetch) {
          return {
            _id: relatedArticleFetch._id,
            title: relatedArticleFetch.title,
            imgURL: relatedArticleFetch.imgURL[0],
            date: formatDate(relatedArticleFetch.dateTime),
            dateTime: new Date(relatedArticleFetch.dateTime),
            avgReadTime: relatedArticleFetch.avgReadTime,
          }
        }
        return null
      }),
    )

    const newArticle = {
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
      relatedArticles: relatedArticles
        .filter(Boolean)
        .sort((a, b) => b.dateTime - a.dateTime),
      avgReadTime: article?.avgReadTime,
      date: formatDate(article.dateTime),
      _id: article._id,
      // Add highlights if they exist
      dictionary: newHighlights?.dictionary || [],
      importantSentences: newHighlights?.importantSentences || [],
    }

    cache.put(cacheKey, newArticle, 3600000 * 1) // Cache for 24 hours
    res.status(201).send({ quizExpired: false, newArticle })
  } catch (error) {
    res.status(400).json({ error: error.message || 'Something went wrong' })
    console.error(error)
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

const hindiTranslation = async (req, res) => {
  const { articleId } = req.params
  try {
    const article = await Article.findById(articleId)
    if (!article) {
      throw new Error('Article not found')
    }
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

    // update the cache memory :
    const cacheKey = `article_${articleId}`
    const cachedArticle = cache.get(cacheKey)
    if (cachedArticle) {
      cache.put(
        cacheKey,
        {
          ...cachedArticle,
          hindiAuthor: article.hindiAuthor,
          hindiMainText: article.hindiMainText,
          hindiTitle: article.hindiTitle,
        },
        3600000 * 24,
      )
    }
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

// @desc    Search articles with pagination
// @route   GET /api/articles/search
// @access  Protected
const searchArticles = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10, category } = req.query
  const pageNumber = parseInt(page)
  const limitNumber = parseInt(limit)

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' })
  }

  const filter = {}
  if (category) {
    filter.category = category
  }

  try {
    const totalArticles = await Article.countDocuments({
      $text: { $search: query },
      ...filter,
      category: { $ne: 'onBoardingArticle' },
    })

    // Get dates for time-based boosting
    const now = new Date()
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)

    const articles = await Article.aggregate([
      // Initial match to filter articles
      {
        $match: {
          $text: { $search: query },
          ...filter,
          category: { $ne: 'onBoardingArticle' },
        },
      },
      // Add text score and parse date
      {
        $addFields: {
          textScore: { $meta: 'textScore' },
          dateObj: { $dateFromString: { dateString: '$dateTime' } },
        },
      },
      // Calculate time-based boost and final score
      {
        $addFields: {
          timeBoost: {
            $switch: {
              branches: [
                // Last 24 hours: 5x boost
                {
                  case: { $gte: ['$dateObj', oneDayAgo] },
                  then: 5,
                },
                // 1-3 days: 3x boost
                {
                  case: { $gte: ['$dateObj', threeDaysAgo] },
                  then: 3,
                },
                // 3-7 days: 2x boost
                {
                  case: { $gte: ['$dateObj', sevenDaysAgo] },
                  then: 2,
                },
                // Older than 7 days: no boost
              ],
              default: 1,
            },
          },
          // Combine scores: recency (90%) + text relevance (10%)
          finalScore: {
            $add: [
              // Time-based score (90% weight)
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$dateObj', new Date(0)] },
                      1000 * 60 * 60 * 24, // Convert to days
                    ],
                  },
                  0.9,
                ],
              },
              // Text relevance score (10% weight)
              {
                $multiply: [{ $meta: 'textScore' }, 0.1],
              },
            ],
          },
        },
      },
      // Multiply final score by time boost
      {
        $addFields: {
          finalScore: { $multiply: ['$finalScore', '$timeBoost'] },
        },
      },
      // Sort by final score
      { $sort: { finalScore: -1 } },
      // Pagination
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
      // Project needed fields
      {
        $project: {
          url: 1,
          dateTime: 1,
          author: 1,
          hindiAuthor: 1,
          title: 1,
          hindiTitle: 1,
          mainText: 1,
          hindiMainText: 1,
          imgURL: 1,
          quiz: 1,
          userQuizStatus: 1,
          category: 1,
          relatedArticles: 1,
          avgReadTime: 1,
          quizAttemptCnt: 1,
          _id: 1,
        },
      },
    ])

    const processedArticles = await Promise.all(
      articles.map(async article => {
        const paragraphs = await breakArticleIntoParagraphs(article.mainText)
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
        }
      }),
    )

    const totalPages = Math.ceil(totalArticles / limitNumber)

    res.json({
      articles: processedArticles,
      currentPage: pageNumber,
      totalPages,
      totalArticles,
      hasMore: pageNumber < totalPages,
    })
  } catch (error) {
    console.error('Error in searchArticles:', error)
    res.status(500).json({ message: 'Server error while searching articles' })
  }
})

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

// @desc    Admin search articles with filters
// @route   GET /api/admin/articles/search?query={query}&category={category}&author={author}&startDate={startDate}&endDate={endDate}&hasQuiz={hasQuiz}
// @access  Admin
const adminSearchArticles = asyncHandler(async (req, res) => {
  const { query, category, author, startDate, endDate, hasQuiz, _id } =
    req.query

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
  if (_id) filter._id = _id
  if (hasQuiz === 'true') filter.quiz = { $exists: true, $ne: [] }
  if (hasQuiz === 'false') filter.quiz = { $exists: true, $eq: [] }

  let articles

  if (filter._id !== '' && filter._id !== undefined) {
    articles = await Article.find({ _id: filter._id })
  } else if (query && query !== '') {
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

// @desc    Add article details for admin
// @route   POST /api/admin/articles
// @access  Admin
const addAdminArticleDetails = asyncHandler(async (req, res) => {
  const newArticle = req.body

  const article = await Article.create({ ...newArticle })

  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }

  res.json(article)
})

// @desc    Delete article details for admin
// @route   DELETE /api/admin/articles/:id
// @access  Admin
const deleteAdminArticleDetails = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Find the article
  const article = await Article.findById(id)

  if (!article) {
    return res.status(404).json({ message: 'Article not found' })
  }

  // Delete associated quizzes
  if (article.quiz && article.quiz.length > 0) {
    await Quiz.deleteMany({ _id: { $in: article.quiz } })
  }

  // Delete the article
  await Article.findByIdAndDelete(id)

  // Remove this article from relatedArticles of other articles
  await Article.updateMany(
    { relatedArticles: id },
    { $pull: { relatedArticles: id } },
  )

  res.status(200).json({ message: 'Article deleted successfully' })
})
// @desc    Get related articles
// @route   GET /api/articles/related/:articleId
// @access  Protected
const getRelatedArticles = asyncHandler(async (req, res) => {
  const { articleId } = req.params
  const { lang } = req.query
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10
  const userId = req.user._id // Assuming `req.user` contains authenticated user info

  // Find the article
  const article = await Article.findById(articleId)
  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }

  const totalArticles = article.relatedArticles.length
  const totalPages = Math.ceil(totalArticles / limit)
  const skip = (page - 1) * limit

  // Find the related articles based on their IDs
  let relatedArticles = await Article.find({
    _id: { $in: article.relatedArticles },
  })
    .select(
      'title author dateTime category imgURL avgReadTime hindiTitle mainText hindiMainText hindiAuthor',
    )
    .skip(skip)
    .limit(limit)

  // Find the quiz attempts by the user for these related articles
  const attemptedArticleIds = await QuizAttempt.find({
    user: userId,
    article: { $in: article.relatedArticles },
  }).distinct('article')

  // Filter out articles that have quiz attempts by the user
  relatedArticles = relatedArticles.filter(
    relatedArticle =>
      !attemptedArticleIds.includes(relatedArticle._id.toString()),
  )
  if (lang === 'hi')
    for (let relatedArticle of relatedArticles) {
      if (
        !relatedArticle.hindiTitle ||
        !relatedArticle.hindiMainText ||
        !relatedArticle.hindiAuthor
      ) {
        const response = await hindiConverter(relatedArticle._id)
        if (!relatedArticle.hindiMainText) {
          relatedArticle.hindiMainText = []
        }
        relatedArticle.hindiTitle = response.hindiTitle

        for (let key in response.hindiMainText) {
          if (!response.hindiMainText[key]) continue
          relatedArticle.hindiMainText.push(response.hindiMainText[key])
        }
        relatedArticle.hindiAuthor = response.hindiAuthor
      }
    }
  // Send the response with filtered related articles
  res.json({
    relatedArticles,
    currentPage: page,
    totalPages,
    totalArticles,
  })
})

// @desc   Create a story from an article
// @route  POST /api/articles/story
// @access Protected
const createStory = asyncHandler(async (req, res) => {
  const { articleId, theme, lang = 'en' } = req.body
  const userId = req.user._id
  const user = await User.findById(userId).select('role')
  if (!user || user.role === 'guest') {
    res.status(401)
    throw new Error('Unauthorized')
  }
  const article = await Article.findById(articleId)
  if (!article) {
    res.status(404)
    throw new Error('Article not found')
  }

  const storyExists = await Story.findOne({
    originalArticle: articleId,
    theme,
    language: lang,
  })
  if (storyExists) {
    return res.status(201).json(storyExists)
  }
  const modifiedArticleForStory = {
    ...article._doc,
    title: lang === 'hi' ? article.hindiTitle : article.title,
    mainText: lang === 'hi' ? article.hindiMainText : article.mainText,
  }
  let retries = 3
  let storyContent = ''
  let detectedLanguages = []
  let dominantLanguage = {}
  while (retries > 0) {
    storyContent = await generateStory(modifiedArticleForStory, theme)
    detectedLanguages = LanguageDetect.detect(storyContent)
    dominantLanguage = detectedLanguages[0]
    if (dominantLanguage.lang === lang) {
      break
    }
    retries--
  }
  if (dominantLanguage.lang !== lang) {
    res.status(400)
    throw new Error('Language mismatch try again later !!')
  }
  const newStory = new Story({
    originalArticle: article._id,
    theme,
    storyContent,
    language: lang,
  })

  await newStory.save()

  res.status(201).json(newStory)
})

// @desc   Get a story by ID
// @route  GET /api/articles/story/:id
// @access Protected
const getStory = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const user = await User.findById(userId).select('role')
  if (!user || user.role === 'guest') {
    res.status(401)
    throw new Error('Unauthorized')
  }
  const story = await Story.findById(req.params.id).populate('originalArticle')
  if (!story) {
    res.status(404)
    throw new Error('Story not found')
  }
  res.json(story)
})

// @desc   Add onboarding article and quiz
// @route  POST /api/admin/onboarding-article
// @access Admin
const addOnBoardingArticle = asyncHandler(async (req, res) => {
  const { article: articleData, quizzes } = req.body

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Validate difficulty values
    const validateDifficulty = difficulty => {
      const difficultyNumber = parseFloat(difficulty)
      if (
        isNaN(difficultyNumber) ||
        difficultyNumber <= 0 ||
        difficultyNumber >= 1
      ) {
        throw new Error(
          `Invalid difficulty value: ${difficulty}. Must be a number string between 0 and 1 (exclusive).`,
        )
      }
    }
    // Create and save the article
    const article = new Article({
      ...articleData,
      category: 'onBoardingArticle', // Make sure this matches your frontend category
    })
    await article.save({ session })

    // Create and save the quizzes
    const savedQuizzes = []
    for (const quizItem of quizzes) {
      validateDifficulty(quizItem.overAllDifficulty)
      const quiz = new Quiz({
        article: article._id,
        para1: quizItem.para1,
        overAllDifficulty: quizItem.overAllDifficulty,
        language: quizItem.language,
      })
      await quiz.save({ session })
      savedQuizzes.push(quiz._id)

      // Update the article with the quiz reference
      article.quiz.push(quiz._id)
    }

    await article.save({ session })

    // Commit the transaction
    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      message: 'Onboarding article and quiz saved successfully',
    })
  } catch (error) {
    // If an error occurred, abort the transaction and roll back any changes
    await session.abortTransaction()
    session.endSession()
    console.error('Error saving onboarding article and quiz:', error)
    // Handle the error appropriately
    res.status(500).json({
      success: false,
      message: 'Error saving onboarding article and quiz',
      error: error.message,
    })
  }
})

// @desc  Get all onboarding articles
// @route  GET /api/admin/onboarding-articles
// @access Admin
const getOnBoardingArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({
    category: 'onBoardingArticle',
  }).populate('quiz')
  res.status(200).json(articles)
})

// @desc   Delete an onboarding article and its associated quizzes
// @route  DELETE /api/admin/onboarding-article/:id
// @access Admin
const deleteOnBoardingArticle = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const articleId = req.params.id

    const article = await Article.findOne({
      _id: articleId,
      category: 'onBoardingArticle',
    }).session(session)

    if (!article) {
      console.log(`Article with ID ${articleId} not found`)
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      })
    }

    const deleteQuizResult = await Quiz.deleteMany({
      article: article._id,
    }).session(session)

    const deleteArticleResult = await Article.deleteOne({
      _id: article._id,
    }).session(session)

    if (deleteArticleResult.deletedCount === 0) {
      throw new Error('Failed to delete the article')
    }

    await session.commitTransaction()
    console.log(
      `Successfully deleted article ${articleId} and its associated quizzes`,
    )

    res.status(200).json({
      success: true,
      message: 'Onboarding article and associated quizzes deleted successfully',
    })
  } catch (error) {
    await session.abortTransaction()
    console.error('Error in deleteOnBoardingArticle:', error)

    res.status(500).json({
      success: false,
      message: 'Error deleting onboarding article and quiz',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    })
  } finally {
    session.endSession()
  }
})

// @desc   Update an onboarding article and its associated quizzes
// @route  PUT /api/admin/onboarding-article/:id
// @access Admin
const updateOnBoardingArticle = asyncHandler(async (req, res) => {
  const { article: articleData, quizzes } = req.body

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const article = await Article.findOne({
      _id: req.params.id,
      category: 'onBoardingArticle',
    })
    if (!article) {
      res.status(404)
      throw new Error('Article not found')
    }

    // Update article
    Object.assign(article, articleData)
    await article.save({ session })

    // Update quizzes
    for (const quizItem of quizzes) {
      if (quizItem._id) {
        // Update existing quiz
        await Quiz.findByIdAndUpdate(quizItem._id, quizItem, { session })
      } else {
        // Create new quiz
        const newQuiz = new Quiz({
          article: article._id,
          ...quizItem,
        })
        await newQuiz.save({ session })
        article.quiz.push(newQuiz._id)
      }
    }

    await article.save({ session })

    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      success: true,
      message: 'Onboarding article and quiz updated successfully',
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    res.status(500).json({
      success: false,
      message: 'Error updating onboarding article and quiz',
      error: error.message,
    })
  }
})

// @desc Get a random onboarding article with one quiz question
// @route GET /api/articles/onboarding
// @access Private
const getRandomOnBoardingArticle = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { userLanguage } = await User.findById(userId).select('userLanguage')

  // Get a random onboarding article
  const article = await Article.aggregate([
    { $match: { category: 'onBoardingArticle' } },
    { $sample: { size: 1 } },
    {
      $project: {
        _id: 1,
        title: userLanguage === 'hi' ? '$hindiTitle' : '$title',
        mainText: userLanguage === 'hi' ? '$hindiMainText' : '$mainText',
        author: userLanguage === 'hi' ? '$hindiAuthor' : '$author',
        dateTime: 1,
        imgURL: 1,
        avgReadTime: 1,
      },
    },
  ])

  if (article.length === 0) {
    return res.status(404).json({ message: 'No onboarding articles found' })
  }

  // Get the quiz for the article
  const quiz = await Quiz.findOne({
    article: article[0]._id,
    language: userLanguage,
  })

  let quizQuestion = null
  if (quiz) {
    const allQuestions = [
      ...(quiz?.para1?.questions || []),
      ...(quiz?.para2?.questions || []),
      ...(quiz?.para3?.questions || []),
    ]

    if (allQuestions.length > 0) {
      quizQuestion =
        allQuestions[Math.floor(Math.random() * allQuestions.length)]
    }
  }

  // If no quiz found in user's language, try to get an English quiz
  if (!quizQuestion) {
    const englishQuiz = await Quiz.findOne({
      article: article[0]._id,
      language: 'en',
    })
    if (englishQuiz) {
      const allQuestions = [
        ...(englishQuiz?.para1?.questions || []),
        ...(englishQuiz?.para2?.questions || []),
        ...(englishQuiz?.para3?.questions || []),
      ]
      if (allQuestions.length > 0) {
        quizQuestion =
          allQuestions[Math.floor(Math.random() * allQuestions.length)]
      }
    }
  }

  // Combine article and quiz question
  const result = {
    ...article[0],
    image: getFormattedImage(article[0].imgURL),
    quizQuestion,
  }

  res.json(result)
})
module.exports = {
  allArticles,
  getArticle,
  getQuiz,
  getArticleQuizStatus,
  startQuiz,
  hindiTranslation,
  getHindiQuiz,
  getWorldNews,
  extractNews,
  testNewsApi,
  getArticleIds,
  getAvgRQMOnArticle,
  updateArticle,
  adminSearchArticles,
  getAdminArticleDetails,
  addAdminArticleDetails,
  deleteAdminArticleDetails,
  searchArticles,
  getRelatedArticles,
  createStory,
  getStory,
  getRandomOnBoardingArticle,
  addOnBoardingArticle,
  getOnBoardingArticles,
  updateOnBoardingArticle,
  deleteOnBoardingArticle,
}
