// scripts/vectorizeArticles.js

require('dotenv').config()
const mongoose = require('mongoose')
const Article = require('../model/articleSchema')
const embeddingService = require('../services/embeddingService')

async function vectorizeArticles() {
  try {
    // Get articles created before a certain date and not yet vectorized
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - 6)
    const lastDate = new Date()
    lastDate.setMonth(lastDate.getMonth() - 7)
    // console.log(cutoffDate, lastDate)
    const articles = await Article.find({
      vectorized: { $ne: true },
    })
      .select('_id title mainText keywords')
      .sort({ dateTime: -1 })
      .limit(1)

    // console.log(cutoffDate.toISOString(), lastDate.toISOString())
    console.log(`Found ${articles.length} articles to vectorize`)

    let successCount = 0
    let errorCount = 0

    for (const article of articles) {
      try {
        const textToEmbed = `${article.title} ${
          article.mainText
        } ${article.keywords.join(' ')}`

        const embedding = await embeddingService.generateEmbedding(textToEmbed)

        await Article.findByIdAndUpdate(article._id, {
          contentVector: embedding,
          vectorized: true,
        })

        console.log(`Vectorized article: ${article._id}`)
        successCount++
      } catch (error) {
        console.error(`Error vectorizing article ${article._id}:`, error)
        errorCount++
        continue
      }
    }

    console.log(`Vectorization completed:`)
    console.log(`- Successfully vectorized: ${successCount} articles`)
    console.log(`- Failed: ${errorCount} articles`)
  } catch (error) {
    console.error('Error in vectorization process:', error)
  }
}

// Run the script
// vectorizeArticles()

async function revertVectorization() {
  try {
    // Get articles that were recently vectorized
    // const cutoffDate = new Date()
    // cutoffDate.setMonth(cutoffDate.getMonth() - 6)
    // const lastDate = new Date()
    // lastDate.setMonth(lastDate.getMonth() - 7)

    // console.log(
    //   'Date range:',
    //   lastDate.toISOString(),
    //   'to',
    //   cutoffDate.toISOString(),
    // )

    // // First count the matching documents
    // const count = await Article.countDocuments({
    //   dateTime: {
    //     $lt: cutoffDate.toISOString(),
    //     $gte: lastDate.toISOString(),
    //   },
    //   vectorized: true,
    // })

    // console.log(`Found ${count} articles to devectorize`)

    // // Perform the update
    // const result = await Article.updateMany(
    //   {
    //     dateTime: {
    //       $lt: cutoffDate.toISOString(),
    //       $gte: lastDate.toISOString(),
    //     },
    //     vectorized: true,
    //   },
    //   {
    //     $unset: { contentVector: '' },
    //     $set: { vectorized: false },
    //   },
    // )

    // console.log(`Successfully devectorized ${result.modifiedCount} articles`)
    // await Article.updateMany(
    //   { vectorized: true },
    //   {
    //     $unset: { contentVector: '' },
    //     $set: { vectorized: false },
    //   },
    // )

    // unset all contentVector fields for the only 1000 vectorized oldest articles to test
    console.log('Devectorizing all articles...')
    const oldestArticles = await Article.find({
      vectorized: true,
    })
      .select('_id')
      .sort({ dateTime: 1 })
      .limit(1000)

    for (const article of oldestArticles) {
      await Article.findByIdAndUpdate(article._id, {
        $unset: { contentVector: '' },
        $set: { vectorized: false },
      })
    }

    console.log('Successfully devectorized all articles')
  } catch (error) {
    console.error('Error in devectorization process:', error)
  }
}

// revertVectorization()

async function testVectorSearch() {
  try {
    const randomArticle = await Article.aggregate([
      { $match: { vectorized: true } },
      { $sample: { size: 1 } },
    ]).exec()

    if (!randomArticle.length) {
      console.log('No vectorized articles found')
      return
    }

    const sourceArticle = randomArticle[0]
    console.log('\nSource Article:')
    console.log('Title:', sourceArticle.title)
    console.log('Category:', sourceArticle.category)
    console.log('Text Preview:', sourceArticle.mainText, '...\n')

    const vectorCount = await Article.countDocuments({
      vectorized: true,
      contentVector: { $exists: true },
    })
    console.log('\nTotal articles with vectors:', vectorCount)
    console.log(sourceArticle.contentVector.length)
    // Try search with more relaxed parameters
    const similarArticles = await Article.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'contentVector',
          queryVector: sourceArticle.contentVector,
          numCandidates: 1000,
          limit: 2,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          mainText: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])

    console.log('\nNumber of similar articles found:', similarArticles.length)
    similarArticles.forEach((article, index) => {
      if (article._id.toString() !== sourceArticle._id.toString()) {
        console.log(`\n${index + 1}. Title: ${article.title}`)
        console.log(`   Category: ${article.category}`)
        console.log(`   Score: ${article.score}`)
        console.log(`   Preview: ${article.mainText}...`)
      }
    })
  } catch (error) {
    console.error('Error:', error)
    console.error('Error details:', error.message)
  }
}

// Run the test
// testVectorSearch()

async function run() {
  try {
    // define your Atlas Vector Search index
    const index = {
      name: 'vector_index',
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            numDimensions: 1536,
            path: 'contentVector',
            similarity: 'dotProduct',
          },
        ],
      },
    }
    // run the helper method
    const result = await Article.createSearchIndex(index)
    console.log(`New search index named ${result} is building.`)
    // wait for the index to be ready to query
    console.log(
      'Polling to check if the index is ready. This may take up to a minute.',
    )
    let isQueryable = false
    while (!isQueryable) {
      const cursor = await Article.listSearchIndexes()

      for await (const index of cursor) {
        if (index.name === result) {
          if (index.queryable) {
            console.log(`${result} is ready for querying.`)
            isQueryable = true
          } else {
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}
// run()

const dropSearchIndexFunction = async () => {
  try {
    console.log('Dropping search index...')
    await Article.dropSearchIndex('vector_index')

    let isDeleted = false
    while (!isDeleted) {
      const cursor = await Article.listSearchIndexes()
      let isIndexPresent = false
      // check if the index is still present
      for await (const index of cursor) {
        if (index.name === 'vector_index') {
          isIndexPresent = true
          console.log('Index still present. Waiting for it to be deleted...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }
      if (!isIndexPresent) {
        isDeleted = true
        console.log('Index deleted successfully')
      }
    }
    console.log('Dropping search index...')
    await Article.collection.dropIndex('contentVector_1')
    console.log('Search index dropped successfully')
  } catch (error) {
    console.log('Error:', error)
  }
}

// dropSearchIndexFunction()

// { dateTime: {
//   $lt: '2024-06-12T09:50:13.412Z',
//   $gte: '2024-05-12T09:50:13.413Z',
// }}
