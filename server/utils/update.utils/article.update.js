const Article = require('../../model/articleSchema')

const { progressBar } = require('../progress.utils')

// const removeDuplicatesAndCreateIndexes = async () => {
//   try {
//     // Step 1: Remove duplicates
//     const duplicates = await Article.aggregate([
//       {
//         $group: {
//           _id: "$title",
//           uniqueIds: { $addToSet: "$_id" },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $match: {
//           count: { $gt: 1 },
//         },
//       },
//     ]);

//     for (const duplicate of duplicates) {
//       const [firstId, ...duplicateIds] = duplicate.uniqueIds;
//       await Article.deleteMany({ _id: { $in: duplicateIds } });
//       console.log(
//         `Removed ${duplicateIds.length} duplicate(s) for title: ${duplicate._id}`
//       );
//     }

//     console.log("Duplicate removal complete.");

//     // Step 2: Create indexes
//     await Article.collection.createIndex({ title: 1 }, { unique: true });
//     console.log("Unique index created on title field.");

//     await Article.collection.createIndex({ dateTime: 1 });
//     console.log("Non-unique index created on dateTime field.");
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

// removeDuplicatesAndCreateIndexes();

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

// const updateAverageReadTime = async () => {
//   console.log("Updating average read time for articles...");

//   // Fetch all articles from the database without an average read time or with a null value or zero value
//   const articles = await Article.find({ avgReadTime: { $in: [null, 0] } });
//   const updateProgress = progressBar(articles.length);
//   for (const article of articles) {
//     const text = article.mainText;

//     // Remove the article if it has no text
//     if (!text || text.length === 0 || text === "") {
//       await Article.deleteOne({ _id: article._id });
//       updateProgress();
//       continue;
//     }

//     // Calculate reading time in minutes
//     const wordsPerMinute = 100;
//     const plainText = text.replace(/<[^>]+>/g, ""); // Remove HTML tags
//     const wordCount = plainText.split(/\s+/).length;
//     const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

//     // Update the article's average read time
//     article.avgReadTime = readingTimeMinutes;
//     await article.save();
//     updateProgress();
//   }

//   console.log("Average read time updated successfully!");
// };

// // Execute the function to update average read times
// updateAverageReadTime();

// const changeDomesticAndOthersToGeneralCategory = async () => {
//   try {
//     const articles = await Article.find({
//       category: { $in: ["domestic", "other"] },
//     });

//     const updateProgress = progressBar(articles.length);
//     for (const article of articles) {
//       article.category = "general";
//       await article.save();
//       updateProgress();
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

// changeDomesticAndOthersToGeneralCategory();

const createIndexes = async () => {
  try {
    // Create the text index
    console.log('Creating text index...')
    // Get existing indexes
    const indexes = await Article.collection.indexes()
    const textIndexes = indexes.filter(index => index.key._fts === 'text')

    if (textIndexes.length > 0) {
      console.log('Text index already exists:')
      console.log(JSON.stringify(textIndexes, null, 2))

      // Check if the existing index covers all the fields we want
      const desiredFields = ['title', 'hindiTitle', 'mainText', 'hindiMainText']
      const existingFields = Object.keys(textIndexes[0].weights)
      const missingFields = desiredFields.filter(
        field => !existingFields.includes(field),
      )

      if (missingFields.length === 0) {
        console.log('Existing text index covers all desired fields.')
      } else {
        console.log('Existing text index does not cover all desired fields.')
        console.log('Missing fields:', missingFields)
        console.log(
          'To update the index, you need to drop the existing one and create a new one.',
        )
        console.log(
          'Caution: This operation can be resource-intensive on large collections.',
        )
      }
    } else {
      // Create the text index if it doesn't exist
      await Article.collection.createIndex(
        {
          title: 'text',
          hindiTitle: 'text',
          mainText: 'text',
          hindiMainText: 'text',
        },
        {
          name: 'ArticleTextIndex',
          default_language: 'english',
          language_override: 'language',
        },
      )
      console.log('Text index created successfully')
    }
  } catch (error) {
    console.log(error)
  }
}

createIndexes()
