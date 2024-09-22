const mongoose = require('mongoose')

const startSession = async () => {
  const session = await mongoose.startSession()
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
  })
  return session
}

const commitSession = async session => {
  if (session && session.inTransaction()) {
    await session.commitTransaction()
  }
}

const abortSession = async session => {
  if (session && session.inTransaction()) {
    await session.abortTransaction()
  }
}

const endSession = async session => {
  if (session) {
    await session.endSession()
  }
}

module.exports = {
  startSession,
  commitSession,
  abortSession,
  endSession,
}
