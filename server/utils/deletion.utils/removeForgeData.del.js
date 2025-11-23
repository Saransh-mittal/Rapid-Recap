/**
 * Complete Forge Data Deletion Utility
 *
 * Deletes:
 * - All ForgeArticles
 * - All seed articles
 * - All forge fields from remaining articles
 *
 * ⚠️ IRREVERSIBLE - Use with caution!
 */

const Article = require('../../model/articleSchema')
const ForgeArticle = require('../../model/quickClashSchemas/forgeArticleSchema')

async function removeAllForgeData() {
  console.log('\n' + '='.repeat(80))
  console.log('🗑️  REMOVING ALL FORGE DATA')
  console.log('='.repeat(80))

  try {
    // Step 1: Count what we're deleting
    const forgeArticleCount = await ForgeArticle.countDocuments()
    const seedArticleCount = await Article.countDocuments({
      forgeStatus: { $ne: 'not_seed' },
    })

    console.log('\n📊 Found:')
    console.log(`   ForgeArticles: ${forgeArticleCount}`)
    console.log(`   Seed Articles: ${seedArticleCount}`)

    // Step 2: Delete all ForgeArticles
    console.log('\n🗑️  Step 1: Deleting ForgeArticles...')
    const forgeResult = await ForgeArticle.deleteMany({})
    console.log(`   ✅ Deleted ${forgeResult.deletedCount} ForgeArticles`)

    // Step 3: Delete all seed articles
    console.log('\n🗑️  Step 2: Deleting seed articles...')
    const seedResult = await Article.deleteMany({
      forgeStatus: { $ne: 'not_seed' },
    })
    console.log(`   ✅ Deleted ${seedResult.deletedCount} seed articles`)

    // Step 4: Clean forge fields from remaining articles (just in case)
    console.log('\n🧹 Step 3: Cleaning forge fields from remaining articles...')
    const cleanResult = await Article.updateMany(
      {},
      {
        $set: { forgeStatus: 'not_seed' },
        $unset: {
          forgeSeedData: '',
          forgeArticleRef: '',
        },
      },
    )
    console.log(`   ✅ Cleaned ${cleanResult.modifiedCount} articles`)

    // Step 5: Verify cleanup
    console.log('\n✅ Verification:')
    const remainingForge = await ForgeArticle.countDocuments()
    const remainingSeeds = await Article.countDocuments({
      forgeStatus: { $ne: 'not_seed' },
    })

    console.log(`   Remaining ForgeArticles: ${remainingForge}`)
    console.log(`   Remaining seed articles: ${remainingSeeds}`)

    console.log('\n' + '='.repeat(80))
    console.log('✅ FORGE DATA DELETION COMPLETE')
    console.log('='.repeat(80))
    console.log('\nSummary:')
    console.log(`   ForgeArticles deleted: ${forgeResult.deletedCount}`)
    console.log(`   Seed articles deleted: ${seedResult.deletedCount}`)
    console.log(`   Articles cleaned: ${cleanResult.modifiedCount}`)
    console.log('='.repeat(80))
  } catch (error) {
    console.error('\n❌ Error during forge data deletion:', error)
    throw error
  }
}

// Auto-execute when required
;(async () => {
  try {
    await removeAllForgeData()
    console.log('\n✅ Script completed successfully')
  } catch (error) {
    console.error('\n💥 Script failed:', error.message)
    process.exit(1)
  }
})()

module.exports = { removeAllForgeData }
