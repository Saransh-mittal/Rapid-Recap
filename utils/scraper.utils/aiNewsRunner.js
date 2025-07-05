// utils/aiNewsRunner.js
const { spawn } = require('child_process')
const path = require('path')
const Article = require('../../model/articleSchema')
const { averageReadTime } = require('../miscellaneous.utils')
const { calculateArticleDifficulty } = require('../article.utils')
const { generateHighlightForArticle } = require('../article.highlight.utils')
const {
  findDuplicateArticles,
} = require('../../services/duplicateCheckService')
const { processArticle } = require('../../services/articleProcessor')

// Run the AI news scraper script and return the results
const runScraper = async categoryKey => {
  try {
    console.log(`Starting AI news scraper for category: ${categoryKey}`)
    // Use a fixed path to the Python script
    const scriptPath = path.join(
      __dirname,
      '../../scripts/web/aiNewsScraper.py',
    )

    return new Promise((resolve, reject) => {
      // Use Python 3 directly
      const pythonProcess = spawn('python3', [scriptPath])

      let dataString = ''
      let errorString = ''

      pythonProcess.stdout.on('data', data => {
        dataString += data.toString()
      })

      pythonProcess.stderr.on('data', data => {
        errorString += data.toString()
        console.error(`Python error: ${data.toString()}`)
      })

      pythonProcess.on('close', code => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`)
          console.error(`Error: ${errorString}`)
          return reject(
            new Error(
              `Python process exited with code ${code}: ${errorString}`,
            ),
          )
        }

        try {
          const articles = JSON.parse(dataString)
          console.log(
            `Scraped ${articles.length} AI news articles successfully`,
          )
          resolve(articles)
        } catch (error) {
          console.error('Error parsing Python output:', error)
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Error running AI news scraper:', error)
    throw error
  }
}

// Process scraped AI articles and save to database
const processScrapedArticles = async (articles, specialCategoryId) => {
  console.log(
    `Processing ${articles.length} scraped AI articles for special category: ${specialCategoryId}`,
  )
  const results = {
    added: 0,
    duplicates: 0,
    errors: 0,
    errorDetails: [],
  }

  for (const article of articles) {
    try {
      // Format the article data for the processor
      const articleData = {
        title: article.title,
        text: article.body,
        url: article.url,
        publish_date: article.published || new Date().toISOString(),
        author: article.source || 'AI News Monitor',
        image: article.imgURL || '',
        category: 'ai-news',
      }

      // Process the article through the article processor
      const processedArticle = await processArticle(articleData)

      // Now check for duplicates after processing
      const { isDuplicate, contentVector, duplicateArticles } =
        await findDuplicateArticles({
          title: processedArticle.title,
          mainText: processedArticle.mainText,
          keywords: processedArticle.keywords || [],
        })

      if (isDuplicate) {
        console.log(`Duplicate found for article: ${processedArticle.title}`)
        if (duplicateArticles && duplicateArticles.length > 0) {
          console.log(`Similar to: ${duplicateArticles[0].title}`)
        }
        results.duplicates++
        continue
      }

      // Calculate metrics
      const avgReadTime = averageReadTime(processedArticle.mainText)
      const articleDifficulty = calculateArticleDifficulty({
        mainText: processedArticle.mainText,
      })

      // Create article with processed data
      const newArticle = new Article({
        ...processedArticle,
        specialCategory: specialCategoryId,
        specialCategoryAdded: new Date(),
        contentVector,
        vectorized: Boolean(contentVector),
        avgReadTime,
        articleDifficulty,
        // Add AI-specific keywords not already in processedArticle.keywords
        keywords: [
          ...(processedArticle.keywords || []),
          'ai-news',
          'artificial intelligence',
          'machine learning',
          'technology',
          'ai research',
        ].filter((value, index, self) => self.indexOf(value) === index), // Remove duplicates
      })

      await newArticle.save()

      // Generate highlights asynchronously
      try {
        await Promise.all([
          generateHighlightForArticle({
            articleId: newArticle._id,
            lang: 'en',
          }),
          generateHighlightForArticle({
            articleId: newArticle._id,
            lang: 'hi',
          }),
        ])
      } catch (highlightError) {
        console.error(
          `Error generating highlights for article ${newArticle._id}:`,
          highlightError,
        )
      }

      results.added++
    } catch (error) {
      console.error('Error processing AI article:', error)
      results.errors++
      results.errorDetails.push({
        title: article.title,
        error: error.message,
      })
    }
  }

  return results
}

module.exports = {
  runScraper,
  processScrapedArticles,
}
