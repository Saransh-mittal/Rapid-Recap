// scripts/migrateIndexesForGameHub.js
const mongoose = require('mongoose')
require('dotenv').config({ path: './config.env' })

async function migrateIndexesForGameHub() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      'mongodb+srv://rapidrecap2k23:rapidrecaptest@test.e3opspf.mongodb.net/test',
    )

    console.log('Connected to MongoDB')

    const db = mongoose.connection.db
    const collection = db.collection('article_quiz_sessions')

    // 1. First, add gameType field to existing documents that don't have it
    console.log('Adding gameType field to existing documents...')
    const updateResult = await collection.updateMany(
      { gameType: { $exists: false } },
      { $set: { gameType: 'normal_quiz' } },
    )
    console.log(`Updated ${updateResult.modifiedCount} documents with gameType`)

    // 2. Get all existing indexes
    console.log('Checking existing indexes...')
    const indexes = await collection.indexes()
    console.log(
      'Current indexes:',
      indexes.map(idx => ({ name: idx.name, key: idx.key })),
    )

    // 3. Drop the old unique index on { user: 1, article: 1 }
    const oldIndexExists = indexes.some(
      idx =>
        idx.name === 'user_1_article_1' ||
        (idx.key.user === 1 &&
          idx.key.article === 1 &&
          !idx.key.gameType &&
          idx.unique),
    )

    if (oldIndexExists) {
      console.log('Dropping old unique index on { user: 1, article: 1 }...')
      try {
        await collection.dropIndex({ user: 1, article: 1 })
        console.log('Successfully dropped old unique index')
      } catch (error) {
        if (error.code === 27) {
          console.log('Index not found, it may have already been dropped')
        } else {
          console.log('Error dropping index:', error.message)
        }
      }
    } else {
      console.log('Old unique index not found')
    }

    // 4. Create the new unique index on { user: 1, article: 1, gameType: 1 }
    console.log(
      'Creating new unique index on { user: 1, article: 1, gameType: 1 }...',
    )
    try {
      await collection.createIndex(
        { user: 1, article: 1, gameType: 1 },
        { unique: true, name: 'user_1_article_1_gameType_1' },
      )
      console.log('Successfully created new unique index')
    } catch (error) {
      if (error.code === 85) {
        console.log('Index already exists')
      } else {
        console.log('Error creating index:', error.message)
      }
    }

    // 5. Create other useful indexes
    console.log('Creating additional indexes...')

    // Index for finding sessions by user and game type
    try {
      await collection.createIndex(
        { user: 1, gameType: 1 },
        { name: 'user_1_gameType_1' },
      )
      console.log('Created index on { user: 1, gameType: 1 }')
    } catch (error) {
      if (error.code === 85) {
        console.log('Index on { user: 1, gameType: 1 } already exists')
      }
    }

    // Index for finding completed sessions
    try {
      await collection.createIndex(
        { completed: 1, createdAt: 1 },
        { name: 'completed_1_createdAt_1' },
      )
      console.log('Created index on { completed: 1, createdAt: 1 }')
    } catch (error) {
      if (error.code === 85) {
        console.log('Index on { completed: 1, createdAt: 1 } already exists')
      }
    }

    // 6. Verify the new indexes
    console.log('Verifying new indexes...')
    const finalIndexes = await collection.indexes()
    console.log(
      'Final indexes:',
      finalIndexes.map(idx => ({
        name: idx.name,
        key: idx.key,
        unique: idx.unique || false,
      })),
    )

    // 7. Test that we can now create multiple sessions per user-article combination
    console.log('Testing index functionality...')

    // Check if there are any duplicate sessions that would violate the new unique constraint
    const duplicates = await collection
      .aggregate([
        {
          $group: {
            _id: { user: '$user', article: '$article', gameType: '$gameType' },
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
      ])
      .toArray()

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate session groups:`)
      for (const dup of duplicates) {
        console.log(
          `  User: ${dup._id.user}, Article: ${dup._id.article}, GameType: ${dup._id.gameType}, Count: ${dup.count}`,
        )

        // Keep the first document and remove the rest
        const docsToRemove = dup.docs.slice(1)
        if (docsToRemove.length > 0) {
          const removeResult = await collection.deleteMany({
            _id: { $in: docsToRemove },
          })
          console.log(
            `    Removed ${removeResult.deletedCount} duplicate documents`,
          )
        }
      }
    } else {
      console.log('No duplicate sessions found')
    }

    console.log('Index migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log('Database connection closed')
  }
}

// Run migration
if (require.main === module) {
  migrateIndexesForGameHub()
    .then(() => {
      console.log('Migration completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

module.exports = migrateIndexesForGameHub
