const mongoose = require('mongoose')
require('dotenv').config({ path: './config.env' })
require('../db/conn')

const ForgeArticle = require('../model/forgeArticleSchema')
const Article = require('../model/articleSchema')

async function generateQualityReport() {
  console.log('\n📊 FORGE QUALITY REPORT\n')

  // Overall stats
  const total = await ForgeArticle.countDocuments()
  const published = await ForgeArticle.countDocuments({ status: 'published' })
  const draft = await ForgeArticle.countDocuments({ status: 'draft' })

  console.log('📈 Overall:')
  console.log(`   Total articles: ${total}`)
  console.log(`   Published: ${published}`)
  console.log(`   Drafts: ${draft}`)

  // By category
  const byCategory = await ForgeArticle.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ])

  console.log('\n📚 By Category:')
  byCategory.forEach(c => console.log(`   ${c._id}: ${c.count}`))

  // By difficulty
  const byDifficulty = await ForgeArticle.aggregate([
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  ])

  console.log('\n⚡ By Difficulty:')
  byDifficulty.forEach(d => console.log(`   ${d._id}: ${d.count}`))

  // Rejection reasons
  const rejections = await Article.aggregate([
    { $match: { forgeStatus: 'rejected' } },
    {
      $group: {
        _id: '$forgeSeedData.rejectionReason',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ])

  console.log('\n❌ Top Rejection Reasons:')
  rejections.forEach(r => console.log(`   ${r._id}: ${r.count}`))

  // Acceptance rate
  const accepted = await Article.countDocuments({ forgeStatus: 'accepted' })
  const rejected = await Article.countDocuments({ forgeStatus: 'rejected' })
  const rate = ((accepted / (accepted + rejected)) * 100).toFixed(1)

  console.log('\n✅ Acceptance Rate:')
  console.log(`   Accepted: ${accepted}`)
  console.log(`   Rejected: ${rejected}`)
  console.log(`   Rate: ${rate}%`)

  process.exit(0)
}

generateQualityReport()
