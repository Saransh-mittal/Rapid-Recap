const Article = require("../../model/articleSchema");

const removeDuplicatesAndCreateIndexes = async () => {
  try {
    // Step 1: Remove duplicates
    const duplicates = await Article.aggregate([
      {
        $group: {
          _id: "$title",
          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    for (const duplicate of duplicates) {
      const [firstId, ...duplicateIds] = duplicate.uniqueIds;
      await Article.deleteMany({ _id: { $in: duplicateIds } });
      console.log(
        `Removed ${duplicateIds.length} duplicate(s) for title: ${duplicate._id}`
      );
    }

    console.log("Duplicate removal complete.");

    // Step 2: Create indexes
    await Article.collection.createIndex({ title: 1 }, { unique: true });
    console.log("Unique index created on title field.");

    await Article.collection.createIndex({ dateTime: 1 });
    console.log("Non-unique index created on dateTime field.");
  } catch (error) {
    console.error("Error:", error);
  }
};

removeDuplicatesAndCreateIndexes();

// async function checkIndexes() {
//   try {
//     // Check indexes
//     const indexes = await Article.collection.getIndexes();
//     console.log("Indexes:", indexes);
//   } catch (error) {
//     console.error("Error checking indexes:", error);
//   }
// }

// checkIndexes();
