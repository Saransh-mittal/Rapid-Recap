// scripts/migrateToGameHub.js
const mongoose = require('mongoose')
const QuizAttempt = require('../model/quizAttemptSchema')
const ArticleQuizSession = require('../model/articleQuizSessionSchem')
const GameData = require('../model/gameDataSchema')
const Article = require('../model/articleSchema')
const Quiz = require('../model/quizSchema')
require('dotenv').config({ path: './config.env' })

async function migrateToGameHub() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      'mongodb+srv://rapidrecap2k23:rapidrecaptest@test.e3opspf.mongodb.net/test',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )

    console.log('Connected to MongoDB')

    // 1. Add gameType field to existing QuizAttempts (default to 'normal_quiz')
    console.log('Updating existing QuizAttempts...')
    const quizAttemptUpdateResult = await QuizAttempt.updateMany(
      { gameType: { $exists: false } },
      {
        $set: {
          gameType: 'normal_quiz',
          performance: {
            accuracy: 0.5,
            difficulty: 0.5,
            correctCount: 0,
            totalItems: 5,
          },
        },
      },
    )
    console.log(`Updated ${quizAttemptUpdateResult.modifiedCount} QuizAttempts`)

    // 2. Add gameType field to existing ArticleQuizSessions
    console.log('Updating existing ArticleQuizSessions...')
    const sessionUpdateResult = await ArticleQuizSession.updateMany(
      { gameType: { $exists: false } },
      { $set: { gameType: 'normal_quiz' } },
    )
    console.log(
      `Updated ${sessionUpdateResult.modifiedCount} ArticleQuizSessions`,
    )

    // 3. Create indexes for better performance
    console.log('Creating indexes...')

    // GameData indexes
    await GameData.collection.createIndex({ article: 1, language: 1 })
    await GameData.collection.createIndex({ category: 1 })
    await GameData.collection.createIndex({ isActive: 1 })

    // Enhanced QuizAttempt indexes
    await QuizAttempt.collection.createIndex({
      user: 1,
      article: 1,
      gameType: 1,
    })
    await QuizAttempt.collection.createIndex({ gameType: 1 })

    // Enhanced ArticleQuizSession indexes
    await ArticleQuizSession.collection.createIndex({
      user: 1,
      article: 1,
      gameType: 1,
    })

    console.log('Indexes created successfully')

    // 4. Migrate some existing quiz data to GameData format (optional)
    console.log('Creating sample GameData entries...')

    const articles = await Article.find({
      quiz: { $exists: true, $ne: [] },
    }).limit(10)
    let gameDataCreated = 0

    for (const article of articles) {
      const existingGameData = await GameData.findOne({
        article: article._id,
        language: 'en',
      })

      if (!existingGameData) {
        try {
          // Get the first quiz for this article
          const quiz = await Quiz.findById(article.quiz[0])
          if (quiz && quiz.para1?.questions?.length > 0) {
            // Create basic GameData structure from existing quiz
            const gameData = new GameData({
              title: article.title,
              description: article.title,
              category: article.category || 'general',
              article: article._id,
              normal_quiz: {
                questions: quiz.para1.questions.slice(0, 5).map(q => ({
                  question: q.question,
                  options: q.options,
                  correct: q.answer,
                  explanation: q.explanation || 'No explanation available',
                  difficulty: parseFloat(q.difficulty) || 0.5,
                })),
              },
              true_false: {
                statements: [
                  {
                    text: 'This article contains accurate information.',
                    correct: true,
                    explanation:
                      'Articles are fact-checked before publication.',
                    difficulty: 0.3,
                  },
                  {
                    text: 'All the content in this article is opinion-based.',
                    correct: false,
                    explanation:
                      'Articles typically contain factual information.',
                    difficulty: 0.4,
                  },
                ],
              },
              word_weaver: {
                questions: [
                  {
                    context: 'This article discusses important topics.',
                    blank: 'This _______ discusses important topics.',
                    answer: 'ARTICLE',
                    difficulty: 0.3,
                  },
                ],
              },
              connections: {
                concepts: [
                  'Topic',
                  'Article',
                  'Information',
                  'Knowledge',
                  'Learning',
                  'Education',
                ],
                validConnections: [
                  {
                    from: 'Article',
                    to: 'Information',
                    reasoning: 'Articles contain information',
                  },
                  {
                    from: 'Information',
                    to: 'Knowledge',
                    reasoning: 'Information contributes to knowledge',
                  },
                  {
                    from: 'Knowledge',
                    to: 'Learning',
                    reasoning: 'Knowledge is gained through learning',
                  },
                ],
              },
              language: 'en',
            })

            await gameData.save()
            gameDataCreated++
          }
        } catch (error) {
          console.log(
            `Error creating GameData for article ${article._id}:`,
            error.message,
          )
        }
      }
    }

    console.log(`Created ${gameDataCreated} GameData entries`)

    // 5. Update QuizAttempts to ensure they have articleQuizSession references
    console.log('Updating QuizAttempt references...')

    const quizAttemptsWithoutSession = await QuizAttempt.find({
      articleQuizSession: { $exists: false },
    }).limit(100)

    for (const attempt of quizAttemptsWithoutSession) {
      // Try to find or create a corresponding session
      let session = await ArticleQuizSession.findOne({
        user: attempt.user,
        article: attempt.article,
        completed: true,
      })

      if (!session) {
        // Create a basic session for backward compatibility
        session = new ArticleQuizSession({
          user: attempt.user,
          article: attempt.article,
          quiz: attempt.quiz,
          gameType: 'normal_quiz',
          questions: [],
          responses: attempt.responses || [],
          completed: true,
          language: 'en',
          startTime: attempt.createdAt,
          endTime: attempt.createdAt,
        })
        await session.save()
      }

      attempt.articleQuizSession = session._id
      await attempt.save()
    }

    console.log(
      `Updated ${quizAttemptsWithoutSession.length} QuizAttempt references`,
    )

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

// Run migration
if (require.main === module) {
  migrateToGameHub()
}

module.exports = migrateToGameHub
