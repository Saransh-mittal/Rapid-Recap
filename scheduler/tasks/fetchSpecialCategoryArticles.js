// scheduler/tasks/fetchSpecialCategoryArticles.js
const axios = require('axios')
const SpecialCategory = require('../../model/specialCategorySchema')
const Article = require('../../model/articleSchema')
const { processArticle } = require('../../services/articleProcessor')
const {
  generateHighlightForArticle,
} = require('../../utils/article.highlight.utils')
const { averageReadTime } = require('../../utils/miscellaneous.utils')
const {
  findDuplicateArticles,
} = require('../../services/duplicateCheckService')
const { mailTransporter } = require('../../utils/mail.utils')
const { calculateArticleDifficulty } = require('../../utils/article.utils')

async function fetchSpecialCategoryArticles() {
  try {
    console.log('Checking for special categories to fetch articles for...')

    // Get current time
    const now = new Date()

    // Find active special categories with API endpoints
    const specialCategories = await SpecialCategory.find({
      isActive: true,
      apiEndpoint: { $ne: null },
      startDate: { $lte: now },
      endDate: { $gte: now },
    })

    if (specialCategories.length === 0) {
      console.log('No active special categories with API endpoints found')
      return
    }

    let totalArticlesAdded = 0
    const categoryResults = []

    // Process each category
    for (const [index, category] of specialCategories.entries()) {
      console.log(
        `[${index + 1}] Processing special category: ${category.name} (${
          category.key
        })`,
      )

      try {
        // Check if we should fetch based on schedule
        if (category.fetchSchedule && category.lastFetched) {
          // Simple scheduling - check if it's been at least 6 hours since last fetch
          // In a real implementation, you would use the cron expression in fetchSchedule
          const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)
          if (category.lastFetched > sixHoursAgo) {
            console.log(
              `[${index + 1}] Skipping ${category.name}: Last fetched ${
                category.lastFetched
              }`,
            )
            continue
          }
        }

        // For GNews API, the apiKey needs to be in the query string, not in headers
        let endpoint = category.apiEndpoint
        const queryParams = {}

        // Add the query parameters from configuration
        if (category.apiConfig?.queryParams) {
          Object.assign(queryParams, category.apiConfig.queryParams)
        }

        // For GNews specifically, add the apikey to query params
        if (category.apiConfig?.apiKey && endpoint.includes('gnews.io')) {
          queryParams.apikey = category.apiConfig.apiKey
        }

        // Build the query string
        const queryString = new URLSearchParams(queryParams).toString()
        endpoint = `${endpoint}?${queryString}`

        // Configure request headers (may still be needed for other APIs)
        const requestConfig = {
          headers: category.apiConfig?.headers || {},
        }

        // Use x-api-key header for non-GNews APIs that need it
        if (category.apiConfig?.apiKey && !endpoint.includes('gnews.io')) {
          requestConfig.headers['x-api-key'] = category.apiConfig.apiKey
        }

        // Fetch articles
        console.log(`[${index + 1}] Fetching articles from: ${endpoint}`)
        const response = await axios.get(endpoint, requestConfig)

        // Different APIs might have different response structures
        let articles = []

        // Handle GNews response format
        if (response.data?.articles) {
          articles = response.data.articles
        }
        // Handle other API formats
        else if (response.data?.news) {
          articles = response.data.news
        }
        // If the API returns an array directly
        else if (Array.isArray(response.data)) {
          articles = response.data
        }
        // No recognizable format
        else {
          console.log(
            `[${index + 1}] Unexpected API response format:`,
            response.data,
          )
          console.log(`[${index + 1}] No articles found for ${category.name}`)
          continue
        }

        if (!articles || articles.length === 0) {
          console.log(`[${index + 1}] No articles found for ${category.name}`)
          continue
        }

        console.log(
          `[${index + 1}] Found ${articles.length} articles for ${
            category.name
          }`,
        )

        // Map the GNews response to our application's article format
        const mappedArticles = articles.map(article => {
          // For GNews API
          if (endpoint.includes('gnews.io')) {
            return {
              title: article.title,
              mainText: article.content || article.description,
              url: article.url,
              author: article.source?.name || 'News Source',
              dateTime: article.publishedAt,
              imgURL: [article.image],
              category: category.key,
            }
          }
          // Default mapping (adjust as needed for other APIs)
          return article
        })

        // Process articles
        const processedArticles = []
        const errors = []

        for (const articleData of mappedArticles) {
          try {
            // Skip articles with insufficient data
            if (!articleData.title || !articleData.mainText) {
              console.log(
                `[${
                  index + 1
                }] Skipping article due to missing title or content`,
              )
              continue
            }

            // Process article with existing utilities
            const processedArticle = await processArticle({
              ...articleData,
              text: articleData.mainText,
              category: category.key,
            })

            // Check for duplicates
            const { isDuplicate, contentVector, duplicateArticles } =
              await findDuplicateArticles({
                title: processedArticle.title,
                mainText: processedArticle.mainText,
                keywords: processedArticle.keywords || [],
              })

            if (isDuplicate) {
              console.log(
                `[${index + 1}] Skipping duplicate article: ${
                  processedArticle.title
                }`,
              )
              continue
            }

            // Add additional fields
            const avgReadTime = averageReadTime(processedArticle.mainText)
            const articleDifficulty = calculateArticleDifficulty({
              mainText: processedArticle.mainText,
            })

            console.log(
              'Article difficulty in fetch article:',
              articleDifficulty,
            )
            // Create and save article
            const newArticle = new Article({
              ...processedArticle,
              contentVector,
              vectorized: true,
              avgReadTime,
              articleDifficulty,
              specialCategory: category._id,
              specialCategoryAdded: new Date(),
              category: category.key,
            })

            await newArticle.save()
            console.log(`[${index + 1}] Saved article: ${newArticle.title}`)

            // Generate English highlights asynchronously
            generateHighlightForArticle({
              articleId: newArticle._id,
              lang: 'en',
            }).catch(error => {
              console.error(
                `[${index + 1}] Error generating highlights for "${
                  newArticle.title
                }":`,
                error,
              )
            })

            processedArticles.push(newArticle)
          } catch (error) {
            console.error(
              `[${index + 1}] Error processing article: ${error.message}`,
            )
            errors.push({
              article: articleData.title || 'Unknown article',
              error: error.message,
            })
          }
        }

        // Update lastFetched timestamp
        category.lastFetched = new Date()
        await category.save()

        totalArticlesAdded += processedArticles.length
        categoryResults.push({
          category: category.name,
          articlesAdded: processedArticles.length,
          errors: errors.length,
        })

        console.log(
          `[${index + 1}] Added ${processedArticles.length} articles for ${
            category.name
          }`,
        )
      } catch (error) {
        console.error(
          `[${index + 1}] Error processing category ${category.name}: ${
            error.message
          }`,
        )
        categoryResults.push({
          category: category.name,
          error: error.message,
        })
      }
    }

    // Send notification email if articles were added
    if (totalArticlesAdded > 0) {
      try {
        const transporter = await mailTransporter()

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a2e69; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .category { margin-bottom: 15px; padding: 10px; background-color: #fff; border-radius: 5px; }
    .success { color: #28a745; }
    .error { color: #dc3545; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Special Category Articles Update</h2>
    </div>
    <div class="content">
      <p>The system has fetched articles for special categories. Here's a summary:</p>

      <p><strong>Total Articles Added: ${totalArticlesAdded}</strong></p>

      <h3>Results by Category:</h3>
      ${categoryResults
        .map(
          result => `
        <div class="category">
          <h4>${result.category}</h4>
          ${
            result.error
              ? `<p class="error">Error: ${result.error}</p>`
              : `<p class="success">Articles Added: ${result.articlesAdded}</p>
               ${
                 result.errors > 0
                   ? `<p>Errors encountered: ${result.errors}</p>`
                   : ''
               }`
          }
        </div>
      `,
        )
        .join('')}

      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
        `

        await transporter.sendMail({
          from: 'rapidrecap2k23@gmail.com',
          to: '20ucs174@lnmiit.ac.in', // Change to your admin email
          subject: `Special Category Update: ${totalArticlesAdded} articles added`,
          html: htmlContent,
        })

        console.log('Notification email sent to admin')
      } catch (error) {
        console.error('Error sending notification email:', error)
      }
    }

    console.log(
      `Finished processing special categories. Total articles added: ${totalArticlesAdded}`,
    )
    return { totalArticlesAdded, categoryResults }
  } catch (error) {
    console.error('Error in fetchSpecialCategoryArticles:', error)
    throw error
  }
}

module.exports = fetchSpecialCategoryArticles
