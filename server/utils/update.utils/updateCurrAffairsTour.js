const mongoose = require('mongoose')

async function updateTournamentQuestions() {
  try {
    await mongoose.connect()
    console.log('Connected to the database')

    const dbName = mongoose.connection.name
    const collectionName = 'tournament_questions'
    console.log(`Connected to database: ${dbName}`)
    console.log(`Querying collection: ${collectionName}`)

    const totalCount = await mongoose.connection.db
      .collection(collectionName)
      .countDocuments()
    console.log(`Total documents in collection: ${totalCount}`)

    const specifiedDate = new Date('2024-09-30')
    console.log(`Searching for questions created after: ${specifiedDate}`)

    const invalidQuestions = await mongoose.connection.db
      .collection(collectionName)
      .find({
        createdAt: { $gte: specifiedDate },
        $or: [
          { question: { $exists: false } },
          { hindiQuestion: { $exists: false } },
          { 'options.a.text': { $exists: false } },
          { 'options.a.hindiText': { $exists: false } },
          { 'options.b.text': { $exists: false } },
          { 'options.b.hindiText': { $exists: false } },
          { 'options.c.text': { $exists: false } },
          { 'options.c.hindiText': { $exists: false } },
          { 'options.d.text': { $exists: false } },
          { 'options.d.hindiText': { $exists: false } },
          { correctAnswer: { $exists: false } },
          { category: { $exists: false } },
          { difficulty: { $exists: false } },
        ],
      })
      .toArray()

    console.log(
      `Found ${invalidQuestions.length} potentially invalid questions:`,
    )
    invalidQuestions.forEach((q, index) => {
      console.log(`\nQuestion ${index + 1}:`)
      console.log(JSON.stringify(q, null, 2))
    })
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from the database')
  }
}

updateTournamentQuestions()
