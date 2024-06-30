const TimeSpent = require("../../model/timeSpentSchema");

async function createIndexes() {
  try {
    // List all existing indexes
    const indexes = await TimeSpent.collection.indexes();
    console.log("Existing indexes:", indexes);

    // Drop existing conflicting indexes if they exist
    for (const index of indexes) {
      if (index.name === "userId_1" || index.name === "userId_1_autocreated") {
        await TimeSpent.collection.dropIndex(index.name);
        console.log(`Dropped index '${index.name}'`);
      }
      if (index.name === "date_1" || index.name === "date_1_autocreated") {
        await TimeSpent.collection.dropIndex(index.name);
        console.log(`Dropped index '${index.name}'`);
      }
    }

    // Create new indexes
    await TimeSpent.collection.createIndex({ userId: 1 });
    console.log("Created index on 'userId'");

    await TimeSpent.collection.createIndex({ date: 1 });
    console.log("Created index on 'date'");

    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}

createIndexes();
