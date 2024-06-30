const QuizAttempt = require("../../model/quizAttemptSchema");

async function createIndexes() {
  try {
    // List all existing indexes
    const indexes = await QuizAttempt.collection.indexes();
    console.log("Existing indexes:", indexes);

    // Drop existing conflicting indexes if they exist
    for (const index of indexes) {
      if (index.name === "user_1" || index.name === "user_1_autocreated") {
        await QuizAttempt.collection.dropIndex(index.name);
        console.log(`Dropped index '${index.name}'`);
      }
      if (
        index.name === "createdAt_1" ||
        index.name === "createdAt_1_autocreated"
      ) {
        await QuizAttempt.collection.dropIndex(index.name);
        console.log(`Dropped index '${index.name}'`);
      }
    }

    // Create new indexes
    await QuizAttempt.collection.createIndex({ user: 1 });
    console.log("Created index on 'user'");

    await QuizAttempt.collection.createIndex({ createdAt: 1 });
    console.log("Created index on 'createdAt'");

    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}

createIndexes();
