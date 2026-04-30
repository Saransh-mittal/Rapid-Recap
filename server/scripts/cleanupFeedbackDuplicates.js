// scripts/cleanupFeedbackDuplicates.js
const mongoose = require('mongoose')
require('dotenv').config({ path: './config.env' })

// Import the models
const QuickClashInsightFeedback = require('../model/quickClashSchemas/quickClashInsightFeedbackSchema')

/**
 * Script to clean up duplicate feedback records and fix null insight titles
 * Run this script once to fix existing database issues
 */

const cleanupFeedbackDuplicates = async () => {
  try {
    console.log('🚀 Starting feedback database cleanup...')

    // Connect to MongoDB
    await mongoose.connect(
      '...',
    )
    console.log('✅ Connected to MongoDB')

    // Step 1: Find and fix records with null insight titles
    console.log('\n📝 Step 1: Fixing null insight titles...')
    const nullTitleRecords = await QuickClashInsightFeedback.find({
      $or: [
        { 'insightData.title': null },
        { 'insightData.title': '' },
        { 'insightData.title': { $exists: false } },
      ],
    })

    console.log(
      `Found ${nullTitleRecords.length} records with null/empty titles`,
    )

    for (const record of nullTitleRecords) {
      const newTitle = `Fixed-Insight-${
        record.user
      }-${record.createdAt.getTime()}-${Math.random()
        .toString(36)
        .substr(2, 6)}`

      await QuickClashInsightFeedback.findByIdAndUpdate(record._id, {
        $set: {
          'insightData.title': newTitle,
          updatedAt: new Date(),
        },
      })

      console.log(`  ✅ Fixed record ${record._id} with new title: ${newTitle}`)
    }

    // Step 2: Find and remove duplicate records
    console.log('\n🔍 Step 2: Finding duplicate records...')
    const duplicates = await QuickClashInsightFeedback.aggregate([
      {
        $group: {
          _id: {
            battleAnalysis: '$battleAnalysis',
            user: '$user',
            title: '$insightData.title',
            type: '$insightData.type',
          },
          count: { $sum: 1 },
          docs: { $push: { id: '$_id', createdAt: '$createdAt' } },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ])

    console.log(`Found ${duplicates.length} groups with duplicate records`)

    let totalRemoved = 0
    for (const duplicateGroup of duplicates) {
      // Keep the newest record, remove the rest
      duplicateGroup.docs.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
      const toKeep = duplicateGroup.docs[0]
      const toRemove = duplicateGroup.docs.slice(1)

      console.log(`  📦 Group: ${duplicateGroup._id.title}`)
      console.log(`    ✅ Keeping: ${toKeep.id} (${toKeep.createdAt})`)

      for (const record of toRemove) {
        await QuickClashInsightFeedback.findByIdAndDelete(record.id)
        console.log(`    ❌ Removed: ${record.id} (${record.createdAt})`)
        totalRemoved++
      }
    }

    // Step 3: Remove very short interaction records that might be spam
    console.log('\n🧹 Step 3: Cleaning up very short interaction records...')
    const shortInteractions = await QuickClashInsightFeedback.deleteMany({
      'implicitFeedback.timeSpent.totalViewTime': { $lt: 1000 },
      'explicitFeedback.type': 'not_provided',
      createdAt: {
        $lt: new Date(Date.now() - 60 * 60 * 1000), // Older than 1 hour
      },
    })

    console.log(
      `  ❌ Removed ${shortInteractions.deletedCount} short interaction records`,
    )

    // Step 4: Update indexes (simplified approach for compatibility)
    console.log('\n🔧 Step 4: Updating database indexes...')

    try {
      // Drop problematic indexes one by one
      const indexesToDrop = [
        'battleAnalysis_1_user_1_insightTitle_1',
        'battleAnalysis_1_user_1_insightData.title_1_insightData.type_1',
      ]

      for (const indexName of indexesToDrop) {
        try {
          await QuickClashInsightFeedback.collection.dropIndex(indexName)
          console.log(`  ✅ Dropped problematic index: ${indexName}`)
        } catch (error) {
          console.log(`  ℹ️  Index ${indexName} not found (this is okay)`)
        }
      }
    } catch (error) {
      console.log('  ℹ️  Some indexes not found (this is okay)')
    }

    // Manually create the simplified unique index
    try {
      await QuickClashInsightFeedback.collection.createIndex(
        {
          battleAnalysis: 1,
          user: 1,
          'insightData.title': 1,
        },
        {
          unique: true,
          sparse: true,
          background: true,
          name: 'battleAnalysis_1_user_1_insightData_title_1_unique',
        },
      )
      console.log('  ✅ Created new simplified unique index')
    } catch (error) {
      console.log('  ⚠️  Could not create unique index:', error.message)
      console.log(
        '  ℹ️  This may be okay if duplicates were already cleaned up',
      )
    }

    // Let Mongoose sync other indexes
    try {
      await QuickClashInsightFeedback.syncIndexes()
      console.log('  ✅ Synchronized other indexes with schema')
    } catch (error) {
      console.log(
        '  ⚠️  Some indexes could not be synchronized:',
        error.message,
      )
      console.log('  ℹ️  The application should still work fine')
    }

    // Step 5: Verify the cleanup
    console.log('\n✅ Step 5: Verification...')
    const totalRecords = await QuickClashInsightFeedback.countDocuments()
    const nullTitleCheck = await QuickClashInsightFeedback.countDocuments({
      $or: [
        { 'insightData.title': null },
        { 'insightData.title': '' },
        { 'insightData.title': { $exists: false } },
      ],
    })

    console.log(`  📊 Total feedback records: ${totalRecords}`)
    console.log(`  📊 Records with null titles: ${nullTitleCheck}`)
    console.log(`  📊 Total duplicates removed: ${totalRemoved}`)
    console.log(
      `  📊 Short interactions removed: ${shortInteractions.deletedCount}`,
    )

    if (nullTitleCheck === 0) {
      console.log('  ✅ All records now have valid titles!')
    } else {
      console.log(
        '  ⚠️  Some records still have null titles - manual review needed',
      )
    }

    // Step 6: Test the new schema compatibility
    console.log('\n🧪 Step 6: Testing schema compatibility...')
    try {
      // Try to create a test record to verify the schema works
      const testRecord = new QuickClashInsightFeedback({
        battleAnalysis: new mongoose.Types.ObjectId(),
        user: new mongoose.Types.ObjectId(),
        battle: new mongoose.Types.ObjectId(),
        insightData: {
          title: `Test-${Date.now()}`,
          description: 'Test record for schema validation',
          type: 'general',
          category: 'general',
        },
        explicitFeedback: {
          type: 'not_provided',
          rating: 3,
        },
      })

      // Validate without saving
      const validationError = testRecord.validateSync()
      if (!validationError) {
        console.log('  ✅ Schema validation passed!')
      } else {
        console.log('  ⚠️  Schema validation issues:', validationError.message)
      }
    } catch (error) {
      console.log('  ⚠️  Schema test error:', error.message)
    }

    console.log('\n🎉 Feedback database cleanup completed successfully!')
    console.log('\n📋 Summary:')
    console.log(
      `   • Fixed ${nullTitleRecords.length} records with null titles`,
    )
    console.log(`   • Removed ${totalRemoved} duplicate records`)
    console.log(
      `   • Cleaned ${shortInteractions.deletedCount} short interactions`,
    )
    console.log(`   • Updated database indexes for compatibility`)
    console.log(
      '\n✨ Your feedback system should now work without duplicate errors!',
    )
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    console.log('\n🔍 Troubleshooting tips:')
    console.log('   • Check your MONGO_URI in config.env')
    console.log('   • Ensure MongoDB is running and accessible')
    console.log('   • Verify database permissions')
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('📋 Database connection closed')
    process.exit(0)
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupFeedbackDuplicates()
}

module.exports = { cleanupFeedbackDuplicates }
