const Article = require('../model/articleSchema')
const VECTOR_CONSTANTS = require('../config/vectorConstants')

const dropSearchIndexes = async () => {
  try {
    console.log('Dropping vector search indexes...')

    // Drop the search index
    await Article.dropSearchIndex(VECTOR_CONSTANTS.VECTOR_INDEX_NAME)

    let isDeleted = false
    while (!isDeleted) {
      const cursor = await Article.listSearchIndexes()
      let isIndexPresent = false

      for await (const index of cursor) {
        if (index.name === VECTOR_CONSTANTS.VECTOR_INDEX_NAME) {
          isIndexPresent = true
          console.log('Index still present, waiting for deletion...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }

      if (!isIndexPresent) {
        isDeleted = true
        console.log('Vector search index deleted successfully')
      }
    }

    // Drop the content vector index
    await Article.collection.dropIndex('contentVector_1')
    console.log('Content vector index dropped successfully')
  } catch (error) {
    console.error('Error dropping search indexes:', error)
    throw error
  }
}

const devectorizeOldArticles = async () => {
  try {
    console.log('Starting devectorization of old articles...')

    // Count total vectorized articles
    const vectorizedCount = await Article.countDocuments({ vectorized: true })

    if (vectorizedCount <= VECTOR_CONSTANTS.MAX_VECTORIZED_ARTICLES) {
      console.log('No devectorization needed - within article limit')
      return
    }

    // Calculate how many articles need to be devectorized
    const articlesToDevectorize =
      vectorizedCount - VECTOR_CONSTANTS.MAX_VECTORIZED_ARTICLES

    // Get the oldest vectorized articles up to the calculated amount
    const oldestArticles = await Article.find({ vectorized: true })
      .select('_id')
      .sort({ dateTime: 1 })
      .limit(articlesToDevectorize)

    console.log(`Devectorizing ${oldestArticles.length} articles`)

    // Process in batches to avoid memory issues
    for (
      let i = 0;
      i < oldestArticles.length;
      i += VECTOR_CONSTANTS.DEVECTORIZATION_BATCH_SIZE
    ) {
      const batch = oldestArticles.slice(
        i,
        i + VECTOR_CONSTANTS.DEVECTORIZATION_BATCH_SIZE,
      )

      await Article.updateMany(
        { _id: { $in: batch.map(article => article._id) } },
        {
          $unset: { contentVector: '' },
          $set: { vectorized: false },
        },
      )

      console.log(
        `Processed batch ${
          i / VECTOR_CONSTANTS.DEVECTORIZATION_BATCH_SIZE + 1
        }`,
      )
    }

    console.log('Devectorization completed successfully')
  } catch (error) {
    console.error('Error devectorizing old articles:', error)
    throw error
  }
}

const recreateSearchIndex = async () => {
  try {
    console.log('Creating new vector search index...')

    const index = {
      name: VECTOR_CONSTANTS.VECTOR_INDEX_NAME,
      type: 'vectorSearch',
      definition: {
        fields: [
          {
            type: 'vector',
            numDimensions: VECTOR_CONSTANTS.VECTOR_DIMENSIONS,
            path: 'contentVector',
            similarity: VECTOR_CONSTANTS.SIMILARITY_METRIC,
          },
        ],
      },
    }

    const result = await Article.createSearchIndex(index)
    console.log(`New search index '${result}' is building`)

    // Wait for index to be queryable
    let isQueryable = false
    while (!isQueryable) {
      const cursor = await Article.listSearchIndexes()

      for await (const index of cursor) {
        if (index.name === result && index.queryable) {
          console.log(`${result} is ready for querying`)
          isQueryable = true
          break
        }
      }

      if (!isQueryable) {
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  } catch (error) {
    console.error('Error creating search index:', error)
    throw error
  }
}

module.exports = {
  dropSearchIndexes,
  devectorizeOldArticles,
  recreateSearchIndex,
}
