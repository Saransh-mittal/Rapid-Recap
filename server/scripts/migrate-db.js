const mongoose = require('mongoose')
const { Parser } = require('json2csv')
const fs = require('fs').promises
const path = require('path')
const User = require('../model/userSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })

// Connection URLs
const SOURCE_DB_URI = process.env.SOURCE_DB_URI
const TARGET_DB_URI = process.env.TARGET_DB_URI

// Custom error class for existing collections
class CollectionExistsError extends Error {
  constructor(collectionName) {
    super(`Collection ${collectionName} already exists in target database`)
    this.name = 'CollectionExistsError'
  }
}

// Function to check if collections exist in target database
async function validateTargetDatabase(targetDb) {
  console.log('Validating target database...')

  try {
    // Wait for connection to be ready
    await targetDb.asPromise()

    // Get the native MongoDB connection
    const db = targetDb.getClient().db()

    // List all collections
    const collections = await db.listCollections().toArray()
    const existingCollectionNames = collections.map(col => col.name)

    console.log('Found collections:', existingCollectionNames)

    // Check for Users collection
    if (existingCollectionNames.includes('Users')) {
      const userCount = await db.collection('Users').countDocuments()
      if (userCount > 0) {
        throw new CollectionExistsError('Users')
      }
    }

    // Check for QuizAttempts collection
    if (existingCollectionNames.includes('QUIZ_ATTEMPT')) {
      const attemptCount = await db.collection('QUIZ_ATTEMPT').countDocuments()
      if (attemptCount > 0) {
        throw new CollectionExistsError('QUIZ_ATTEMPT')
      }
    }

    console.log(
      'Target database validation successful - no existing data found',
    )
  } catch (error) {
    if (error instanceof CollectionExistsError) {
      throw error
    }
    console.error('Error during validation:', error)
    throw new Error('Database validation failed')
  }
}

const collections = {
  users: {
    model: 'USER',
    schema: User.schema, // Use the imported schema directly
    fileName: 'users.csv',
  },
  quizAttempts: {
    model: 'QUIZ_ATTEMPT',
    schema: QuizAttempt.schema, // Use the imported schema directly
    fileName: 'quiz_attempts.csv',
  },
}

async function exportToCSV(data, fields, fileName) {
  try {
    const exportDir = path.join(__dirname, 'exports')
    const json2csvParser = new Parser({ fields })
    const csv = json2csvParser.parse(data)

    await fs.writeFile(path.join(exportDir, fileName), csv)

    console.log(`Successfully exported ${fileName}`)
    return true
  } catch (err) {
    console.error(`Error exporting ${fileName}:`, err)
    return false
  }
}

async function migrateCollections() {
  let sourceDb, targetDb

  try {
    await fs.mkdir(path.join(__dirname, 'exports'), { recursive: true })

    // Connect to databases and wait for connections to be ready
    sourceDb = await mongoose.createConnection(SOURCE_DB_URI).asPromise()
    targetDb = await mongoose.createConnection(TARGET_DB_URI).asPromise()

    console.log('Connected to both databases')

    // Validate target database
    await validateTargetDatabase(targetDb)

    // First migrate Users collection
    const UsersSource = sourceDb.model('USER', collections.users.schema)
    const UsersTarget = targetDb.model('USER', collections.users.schema)

    console.log('Fetching users...')
    const users = await UsersSource.find({}).lean()
    console.log(`Found ${users.length} users`)

    // Export users to CSV for backup
    const userFields = Object.keys(collections.users.schema.paths)
    await exportToCSV(users, userFields, collections.users.fileName)

    // Insert users into target database
    console.log('Inserting users into target database...')
    await UsersTarget.insertMany(users)

    // Now migrate QuizAttempts collection
    const QuizAttemptsSource = sourceDb.model(
      'QUIZ_ATTEMPT',
      collections.quizAttempts.schema,
    )
    const QuizAttemptsTarget = targetDb.model(
      'QUIZ_ATTEMPT',
      collections.quizAttempts.schema,
    )

    console.log('Fetching quiz attempts...')
    const quizAttempts = await QuizAttemptsSource.find({
      createdAt: { $gte: new Date('2025-01-01') },
    }).lean()
    console.log(`Found ${quizAttempts.length} quiz attempts`)

    // Export quiz attempts to CSV for backup
    const quizAttemptFields = Object.keys(collections.quizAttempts.schema.paths)
    await exportToCSV(
      quizAttempts,
      quizAttemptFields,
      collections.quizAttempts.fileName,
    )

    // Insert quiz attempts into target database
    console.log('Inserting quiz attempts into target database...')
    await QuizAttemptsTarget.insertMany(quizAttempts)

    console.log('Migration completed successfully')

    // Verify the migration
    const targetUserCount = await UsersTarget.countDocuments()
    const targetQuizAttemptCount = await QuizAttemptsTarget.countDocuments()

    console.log('\nMigration verification:')
    console.log(
      `Source Users: ${users.length} -> Target Users: ${targetUserCount}`,
    )
    console.log(
      `Source Quiz Attempts: ${quizAttempts.length} -> Target Quiz Attempts: ${targetQuizAttemptCount}`,
    )
  } catch (error) {
    if (error instanceof CollectionExistsError) {
      console.error('\nMigration aborted:', error.message)
      console.error(
        'Please clear the target database before running the migration.',
      )
    } else {
      console.error('\nError during migration:', error)
    }
    throw error // Re-throw to be caught by the main error handler
  } finally {
    // Close connections in finally block to ensure they're always closed
    if (sourceDb) await sourceDb.close()
    if (targetDb) await targetDb.close()
    console.log('\nDatabase connections closed')
  }
}

// Add verification function
async function verifyReferences() {
  let targetDb
  try {
    targetDb = await mongoose.createConnection(TARGET_DB_URI)
    const QuizAttemptsTarget = targetDb.model(
      'QUIZ_ATTEMPT',
      collections.quizAttempts.schema,
    )
    const UsersTarget = targetDb.model('USER', collections.users.schema)

    console.log('\nVerifying references...')

    // Check quiz attempts references to users
    const quizAttempts = await QuizAttemptsTarget.find({})
    const userIds = new Set()

    for (const attempt of quizAttempts) {
      userIds.add(attempt.user.toString())
    }

    const existingUsers = await UsersTarget.find({
      _id: { $in: Array.from(userIds) },
    })

    console.log(
      `Found ${existingUsers.length} users referenced in quiz attempts`,
    )
    console.log(
      `Total unique user references in quiz attempts: ${userIds.size}`,
    )

    if (existingUsers.length !== userIds.size) {
      console.warn('Warning: Some quiz attempts reference non-existent users!')
    }
  } catch (error) {
    console.error('Error during reference verification:', error)
    throw error
  } finally {
    if (targetDb) await targetDb.close()
  }
}

// Execute migration with better error handling
async function execute() {
  try {
    await migrateCollections()
    await verifyReferences()
    console.log('Migration and verification completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration process failed')
    process.exit(1)
  }
}

execute()
