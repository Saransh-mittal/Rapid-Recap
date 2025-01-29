const mongoose = require('mongoose')
const { Parser } = require('json2csv')
const fs = require('fs').promises
const path = require('path')
const User = require('../model/userSchema')
const QuizAttempt = require('../model/quizAttemptSchema')
const dotenv = require('dotenv')
const Tournament = require('../model/tournamentSchema')
const {
  TournamentRegistration,
} = require('../model/tournamentRegistrationSchema')
dotenv.config({ path: './config.env' })

// Connection URLs remain the same
const SOURCE_DB_URI = process.env.SOURCE_DB_URI
const TARGET_DB_URI = process.env.TARGET_DB_URI

// Update the validateTargetDatabase function to include new collections
async function validateTargetDatabase(targetDb) {
  console.log('Validating target database...')

  try {
    await targetDb.asPromise()
    const db = targetDb.getClient().db()
    const collections = await db.listCollections().toArray()
    const existingCollectionNames = collections.map(col => col.name)

    console.log('Found collections:', existingCollectionNames)

    // Add checks for new collections
    const collectionsToCheck = [
      // 'Users',
      // 'QUIZ_ATTEMPT',
      // 'TOURNAMENT',
      // 'TOURNAMENT_REGISTRATION',
      // 'QUIZ_SESSION',
    ]

    for (const collectionName of collectionsToCheck) {
      if (existingCollectionNames.includes(collectionName)) {
        const count = await db.collection(collectionName).countDocuments()
        if (count > 0) {
          throw new CollectionExistsError(collectionName)
        }
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

// Keep the CollectionExistsError class
class CollectionExistsError extends Error {
  constructor(collectionName) {
    super(`Collection ${collectionName} already exists in target database`)
    this.name = 'CollectionExistsError'
  }
}

// Collection configurations
const collections = {
  users: {
    model: 'USER',
    schema: User.schema,
    fileName: 'users.csv',
  },
  quizAttempts: {
    model: 'QUIZ_ATTEMPT',
    schema: QuizAttempt.schema,
    fileName: 'quiz_attempts.csv',
  },
  tournaments: {
    model: 'TOURNAMENT',
    schema: Tournament.schema,
    fileName: 'tournaments.csv',
  },
  tournamentRegistrations: {
    model: 'TOURNAMENT_REGISTRATION',
    schema: TournamentRegistration.schema,
    fileName: 'tournament_registrations.csv',
  },
}

// Utility function for CSV export
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

// Function to migrate tournaments
async function migrateTournaments(sourceDb, targetDb) {
  console.log('\nStarting tournament migration...')

  const TournamentsSource = sourceDb.model(
    'TOURNAMENT',
    collections.tournaments.schema,
  )
  const TournamentsTarget = targetDb.model(
    'TOURNAMENT',
    collections.tournaments.schema,
  )

  // Fetch tournaments
  console.log('Fetching tournaments...')
  const tournaments = await TournamentsSource.find({}).lean()
  console.log(`Found ${tournaments.length} tournaments`)

  // Export tournaments to CSV
  const tournamentFields = Object.keys(collections.tournaments.schema.paths)
  await exportToCSV(
    tournaments,
    tournamentFields,
    collections.tournaments.fileName,
  )

  // Insert tournaments into target
  console.log('Inserting tournaments into target database...')
  await TournamentsTarget.insertMany(tournaments)

  // Verify migration
  const targetTournamentCount = await TournamentsTarget.countDocuments()
  console.log(
    `Source Tournaments: ${tournaments.length} -> Target Tournaments: ${targetTournamentCount}`,
  )

  return tournaments.length
}

// Function to migrate tournament registrations
async function migrateTournamentRegistrations(sourceDb, targetDb) {
  console.log('\nStarting tournament registration migration...')

  const RegistrationsSource = sourceDb.model(
    'TOURNAMENT_REGISTRATION',
    collections.tournamentRegistrations.schema,
  )
  const RegistrationsTarget = targetDb.model(
    'TOURNAMENT_REGISTRATION',
    collections.tournamentRegistrations.schema,
  )

  // Fetch registrations
  console.log('Fetching tournament registrations...')
  const registrations = await RegistrationsSource.find({}).lean()
  console.log(`Found ${registrations.length} tournament registrations`)

  // Export registrations to CSV
  const registrationFields = Object.keys(
    collections.tournamentRegistrations.schema.paths,
  )
  await exportToCSV(
    registrations,
    registrationFields,
    collections.tournamentRegistrations.fileName,
  )

  // Insert registrations into target
  console.log('Inserting tournament registrations into target database...')
  await RegistrationsTarget.insertMany(registrations)

  // Verify migration
  const targetRegistrationCount = await RegistrationsTarget.countDocuments()
  console.log(
    `Source Registrations: ${registrations.length} -> Target Registrations: ${targetRegistrationCount}`,
  )

  return registrations.length
}

// Function to migrate quiz sessions
async function migrateQuizSessions(sourceDb, targetDb) {
  console.log('\nStarting quiz session migration...')

  const QuizSessionsSource = sourceDb.model(
    'QUIZ_SESSION',
    collections.quizSessions.schema,
  )
  const QuizSessionsTarget = targetDb.model(
    'QUIZ_SESSION',
    collections.quizSessions.schema,
  )

  // Fetch quiz sessions
  console.log('Fetching quiz sessions...')
  const quizSessions = await QuizSessionsSource.find({}).lean()
  console.log(`Found ${quizSessions.length} quiz sessions`)

  // Export quiz sessions to CSV
  const sessionFields = Object.keys(collections.quizSessions.schema.paths)
  await exportToCSV(
    quizSessions,
    sessionFields,
    collections.quizSessions.fileName,
  )

  // Insert quiz sessions into target
  console.log('Inserting quiz sessions into target database...')
  await QuizSessionsTarget.insertMany(quizSessions)

  // Verify migration
  const targetSessionCount = await QuizSessionsTarget.countDocuments()
  console.log(
    `Source Quiz Sessions: ${quizSessions.length} -> Target Quiz Sessions: ${targetSessionCount}`,
  )

  return quizSessions.length
}

// Separate function for user migration
async function migrateUsers(sourceDb, targetDb) {
  console.log('\nStarting user migration...')

  const UsersSource = sourceDb.model('USER', collections.users.schema)
  const UsersTarget = targetDb.model('USER', collections.users.schema)

  // Fetch users
  console.log('Fetching users...')
  const users = await UsersSource.find({}).lean()
  console.log(`Found ${users.length} users`)

  // Export users to CSV
  const userFields = Object.keys(collections.users.schema.paths)
  await exportToCSV(users, userFields, collections.users.fileName)

  // Insert users into target
  console.log('Inserting users into target database...')
  await UsersTarget.insertMany(users)

  // Verify migration
  const targetUserCount = await UsersTarget.countDocuments()
  console.log(
    `Source Users: ${users.length} -> Target Users: ${targetUserCount}`,
  )

  return users.length
}

// Separate function for quiz attempts migration
async function migrateQuizAttempts(sourceDb, targetDb) {
  console.log('\nStarting quiz attempts migration...')

  const QuizAttemptsSource = sourceDb.model(
    'QUIZ_ATTEMPT',
    collections.quizAttempts.schema,
  )
  const QuizAttemptsTarget = targetDb.model(
    'QUIZ_ATTEMPT',
    collections.quizAttempts.schema,
  )

  // Fetch quiz attempts
  console.log('Fetching quiz attempts...')
  const quizAttempts = await QuizAttemptsSource.find({
    createdAt: { $gte: new Date('2025-01-01') },
  }).lean()
  console.log(`Found ${quizAttempts.length} quiz attempts`)

  // Export quiz attempts to CSV
  const quizAttemptFields = Object.keys(collections.quizAttempts.schema.paths)
  await exportToCSV(
    quizAttempts,
    quizAttemptFields,
    collections.quizAttempts.fileName,
  )

  // Insert quiz attempts into target
  console.log('Inserting quiz attempts into target database...')
  await QuizAttemptsTarget.insertMany(quizAttempts)

  // Verify migration
  const targetQuizAttemptCount = await QuizAttemptsTarget.countDocuments()
  console.log(
    `Source Quiz Attempts: ${quizAttempts.length} -> Target Quiz Attempts: ${targetQuizAttemptCount}`,
  )

  return quizAttempts.length
}

// Update the main migrateCollections function
async function migrateCollections() {
  let sourceDb, targetDb

  try {
    await fs.mkdir(path.join(__dirname, 'exports'), { recursive: true })

    sourceDb = await mongoose.createConnection(SOURCE_DB_URI).asPromise()
    targetDb = await mongoose.createConnection(TARGET_DB_URI).asPromise()
    console.log('Connected to both databases')

    await validateTargetDatabase(targetDb)

    // Perform migrations in order (users first, then related collections)
    const userCount = await migrateUsers(sourceDb, targetDb)
    // const tournamentCount = await migrateTournaments(sourceDb, targetDb)
    // const registrationCount = await migrateTournamentRegistrations(
    //   sourceDb,
    //   targetDb,
    // )
    // const sessionCount = await migrateQuizSessions(sourceDb, targetDb)
    // const quizAttemptCount = await migrateQuizAttempts(sourceDb, targetDb)

    console.log('\nMigration completed successfully')
    console.log(`Total users migrated: ${userCount}`)
    // console.log(`Total tournaments migrated: ${tournamentCount}`)
    // console.log(`Total tournament registrations migrated: ${registrationCount}`)
    // console.log(`Total quiz sessions migrated: ${sessionCount}`)
    // console.log(`Total quiz attempts migrated: ${quizAttemptCount}`)
  } catch (error) {
    if (error instanceof CollectionExistsError) {
      console.error('\nMigration aborted:', error.message)
      console.error(
        'Please clear the target database before running the migration.',
      )
    } else {
      console.error('\nError during migration:', error)
    }
    throw error
  } finally {
    if (sourceDb) await sourceDb.close()
    if (targetDb) await targetDb.close()
    console.log('\nDatabase connections closed')
  }
}

// Keep the verification function and execute function the same
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

async function execute() {
  try {
    await migrateCollections()
    // await verifyReferences()
    console.log('Migration and verification completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration process failed')
    process.exit(1)
  }
}

execute()
