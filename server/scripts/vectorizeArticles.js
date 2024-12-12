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
    console.log(cutoffDate, lastDate)
    const articles = await Article.find({
      dateTime: {
        $lt: cutoffDate.toISOString(),
        $gte: lastDate.toISOString(),
      },
      vectorized: { $ne: true },
    })
      .select('_id title mainText keywords')
      .sort({ dateTime: 1 })
      .limit(20)

    console.log(cutoffDate.toISOString(), lastDate.toISOString())
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
    await Article.updateMany(
      { vectorized: true },
      {
        $unset: { contentVector: '' },
        $set: { vectorized: false },
      },
    )
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

async function updateVectorSubtypes() {
  try {
    // Get all vectorized articles
    const articles = await Article.find({ vectorized: true })
    console.log(`Found ${articles.length} articles to update`)

    for (const article of articles) {
      if (article.contentVector) {
        // Convert existing binary data to Float32Array
        const base64Data = article.contentVector.buffer.toString('base64')
        const buffer = Buffer.from(base64Data, 'base64')
        const vector = Array.from(
          new Float32Array(buffer.buffer.slice(0, 1536 * 4)),
        )

        // Convert back to binary with correct subtype
        const newVector = new mongoose.Types.Buffer(
          Buffer.from(new Float32Array(vector).buffer),
          9, // vector subtype
        )

        // Update the document
        await Article.findByIdAndUpdate(article._id, {
          contentVector: newVector,
        })

        console.log(`Updated article: ${article._id}`)
      }
    }

    console.log('Vector subtype update completed')
  } catch (error) {
    console.error('Error updating vectors:', error)
  }
}

// Run the update
// updateVectorSubtypes()

async function rebuildVectorIndex() {
  const ATLAS_API_KEY = process.env.ATLAS_API_KEY
  const ATLAS_PROJECT_ID = process.env.ATLAS_PROJECT_ID
  const CLUSTER_NAME = process.env.CLUSTER_NAME

  try {
    // 1. Delete existing index
    const deleteResponse = await fetch(
      `https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_PROJECT_ID}/clusters/${CLUSTER_NAME}/fts/indexes/contentVector_1`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ATLAS_API_KEY}`,
        },
      },
    )

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete index: ${deleteResponse.statusText}`)
    }

    // 2. Create new index
    const createResponse = await fetch(
      `https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_PROJECT_ID}/clusters/${CLUSTER_NAME}/fts/indexes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ATLAS_API_KEY}`,
        },
        body: JSON.stringify({
          name: 'contentVector_1',
          database: 'your_database_name',
          collectionName: 'Articles',
          mappings: {
            dynamic: true,
            fields: {
              contentVector: {
                type: 'vector',
                dimensions: 1536,
                similarity: 'cosine',
              },
            },
          },
        }),
      },
    )

    if (!createResponse.ok) {
      throw new Error(`Failed to create index: ${createResponse.statusText}`)
    }

    console.log('Vector search index rebuilt successfully')
  } catch (error) {
    console.error('Error rebuilding vector index:', error)
    throw error
  }
}

// Combined function to maintain vectors and rebuild index
async function maintainVectorStorage() {
  try {
    // 1. Find cutoff date for latest 10000 articles
    const cutoffArticle = await Article.find()
      .sort({ dateTime: -1 })
      .skip(10000)
      .limit(1)

    const cutoffDate = cutoffArticle[0]?.dateTime

    // 2. Remove vectors from older articles
    const result = await Article.updateMany(
      {
        dateTime: { $lt: cutoffDate },
        vectorized: true,
      },
      {
        $unset: { contentVector: '' },
        $set: { vectorized: false },
      },
    )

    console.log(`Removed vectors from ${result.modifiedCount} old articles`)

    // 3. Rebuild the index
    await rebuildVectorIndex()
  } catch (error) {
    console.error('Error in vector maintenance:', error)
  }
}

// maintainVectorStorage()

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
    console.log('Search index dropped successfully')

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
