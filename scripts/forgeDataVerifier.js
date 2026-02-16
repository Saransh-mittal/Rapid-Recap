const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

require('dotenv').config({ path: path.join(__dirname, '../config.env') })

const Article = require('../model/articleSchema')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')

const CATEGORY_MAP = {
  'gk-prime': 'India & World',
  'science-facts-simplified': 'Science & Technology',
  'everyday-tech': 'Tech Innovations',
  'geography': 'Geography & Environment',
  'india-&-world': 'India & World',
  'general-knowledge-&-current-affairs': 'India & World',
  'science-&-technology': 'Science & Technology',
  'tech-innovations': 'Tech Innovations',
  'geography-&-environment': 'Geography & Environment',
}

// Hard rule: content explicitly requires missing visual context.
const HARD_VISUAL_DEP_RE =
  /\b(see (the )?(image|photo|figure|diagram|table|graph|chart|map)|as shown (above|below)|shown (above|below)|in the (image|photo|figure|diagram|table|graph|chart|map)|table \d+|figure \d+|graph \d+|diagram \d+|map (above|below)|requires? (an?|the) (image|diagram|chart|graph|table|map)|watch the video)\b/i

// Softer signal: visual words appear, but may still be self-contained.
const SOFT_VISUAL_RE =
  /\b(image|images|photo|figure|diagram|table|graph|chart|map|infographic|illustration|screenshot)\b/i

const URL_RE = /https?:\/\//i
const ARTICLE_REF_RE =
  /\b(according to (the )?(article|text|passage)|what does (the )?(article|text|passage)|as mentioned (above|below)|from the article|in this passage|above text|below text)\b/i
const PRECISE_NUM_RE = /\b\d{3,}(?:[,.]\d+)?\b|\b(18|19|20)\d{2}\b/

function parseArgs(argv) {
  const args = {
    db: 'default',
    output: null,
    apply: 'none', // none | archive
    applyCategoryMismatch: false,
    syncSeedStatus: false,
  }
  for (const raw of argv) {
    if (raw.startsWith('--db=')) args.db = raw.split('=')[1]
    else if (raw.startsWith('--output=')) args.output = raw.split('=')[1]
    else if (raw.startsWith('--apply=')) args.apply = raw.split('=')[1]
    else if (raw.startsWith('--apply-category-mismatch=')) {
      args.applyCategoryMismatch = raw.split('=')[1] === 'true'
    } else if (raw.startsWith('--sync-seed-status=')) {
      args.syncSeedStatus = raw.split('=')[1] === 'true'
    }
    else if (raw === '--help' || raw === '-h') args.help = true
  }
  return args
}

function normalize(str) {
  return String(str || '').trim().toLowerCase()
}

function words(str) {
  return String(str || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

function overlapScore(a, b) {
  const A = new Set(tokenize(a))
  const B = new Set(tokenize(b))
  if (!A.size || !B.size) return 0
  let common = 0
  for (const t of A) if (B.has(t)) common++
  return common / A.size
}

function pickDbUri(dbArg) {
  if (dbArg === 'source') return process.env.DATABASE // backward-compatible alias
  return process.env.DATABASE
}

async function dailyCoverage(Model, dateField, match, lookbackDays) {
  const start = new Date()
  start.setUTCDate(start.getUTCDate() - lookbackDays)

  const rows = await Model.aggregate([
    { $match: { ...match, [dateField]: { $gte: start } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: `$${dateField}`, timezone: 'UTC' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return {
    lookbackDays,
    daysWithUpdates: rows.length,
    coveragePct: +((rows.length / lookbackDays) * 100).toFixed(2),
    isDailyUpdate: rows.length === lookbackDays,
    series: rows,
  }
}

async function runAudit() {
  const forge = await ForgeArticle.find({})
    .select('_id title category seedArticleId sections quickClashQuiz status createdAt publishedAt')
    .lean()

  const seedIds = forge.map((f) => f.seedArticleId).filter(Boolean)
  const seeds = await Article.find({ _id: { $in: seedIds } })
    .select('_id title category forgeStatus forgeSeedData.seedSource createdAt')
    .lean()

  const seedMap = new Map(seeds.map((s) => [String(s._id), s]))

  let pairedWithSeed = 0
  let categoryMismatch = 0
  let geographySeedTotal = 0
  let geographySeedMismatch = 0

  let hardVisual = 0
  let softVisual = 0
  let urlSignals = 0

  let sections = 0
  let sectionMcqs = 0
  let questionUnreadRef = 0
  let questionTooLong = 0
  let optionTooLong = 0
  let preciseOption = 0
  let optionsNotFour = 0
  let badCorrectIndex = 0
  let answerNotLexicallyDerivable = 0

  const pairCountMap = new Map()
  const perSeedCategory = {}
  const mismatchBySource = {}
  const geographyBySource = {}

  const mismatchSamples = []
  const geographySamples = []
  const hardVisualSamples = []
  const mcqIssueSamples = []
  const actionCandidates = []

  for (const f of forge) {
    const seed = seedMap.get(String(f.seedArticleId))
    const forgeCategory = f.category || 'unknown'

    let hasCategoryMismatch = false
    if (seed) {
      pairedWithSeed++
      const seedRaw = seed.category || 'unknown'
      const seedMapped = CATEGORY_MAP[normalize(seedRaw)] || seedRaw
      const source = seed?.forgeSeedData?.seedSource || 'unknown'
      const mismatch = normalize(seedMapped) !== normalize(forgeCategory)

      const pair = `${seedMapped} -> ${forgeCategory}`
      pairCountMap.set(pair, (pairCountMap.get(pair) || 0) + 1)

      if (!perSeedCategory[seedMapped]) {
        perSeedCategory[seedMapped] = { total: 0, mismatch: 0 }
      }
      perSeedCategory[seedMapped].total++
      if (mismatch) perSeedCategory[seedMapped].mismatch++

      if (!mismatchBySource[source]) mismatchBySource[source] = { total: 0, mismatch: 0 }
      mismatchBySource[source].total++
      if (mismatch) mismatchBySource[source].mismatch++

      if (mismatch) {
        hasCategoryMismatch = true
        categoryMismatch++
        if (mismatchSamples.length < 15) {
          mismatchSamples.push({
            forgeId: String(f._id),
            seedCategory: seedRaw,
            forgeCategory,
            seedTitle: seed.title,
            forgeTitle: f.title,
            seedSource: source,
          })
        }
      }

      if (normalize(seedRaw) === 'geography') {
        geographySeedTotal++
        if (!geographyBySource[source]) {
          geographyBySource[source] = {
            total: 0,
            mismatch: 0,
            toScience: 0,
            toGK: 0,
            toTech: 0,
            toGeo: 0,
          }
        }

        geographyBySource[source].total++
        const fc = normalize(forgeCategory)
        if (fc === 'science facts simplified') geographyBySource[source].toScience++
        else if (fc === 'gk prime') geographyBySource[source].toGK++
        else if (fc === 'everyday tech') geographyBySource[source].toTech++
        else if (fc === 'geography') geographyBySource[source].toGeo++

        if (mismatch) {
          geographySeedMismatch++
          geographyBySource[source].mismatch++
          if (geographySamples.length < 15) {
            geographySamples.push({
              forgeId: String(f._id),
              seedCategory: seedRaw,
              forgeCategory,
              seedTitle: seed.title,
              forgeTitle: f.title,
              seedSource: source,
            })
          }
        }
      }
    }

    const sec = Array.isArray(f.sections) ? f.sections : []
    sections += sec.length

    const blob = [f.title, ...sec.map((s) => `${s.title || ''} ${s.content || ''}`)].join('\n')

    if (SOFT_VISUAL_RE.test(blob)) softVisual++
    let hasHardVisualDependency = false
    let hasUrl = false
    if (HARD_VISUAL_DEP_RE.test(blob)) {
      hasHardVisualDependency = true
      hardVisual++
      if (hardVisualSamples.length < 15) {
        hardVisualSamples.push({
          forgeId: String(f._id),
          title: f.title,
          category: f.category,
          seedSource: seed?.forgeSeedData?.seedSource || null,
        })
      }
    }
    if (URL_RE.test(blob)) {
      hasUrl = true
      urlSignals++
    }

    for (const s of sec) {
      const mcq = s?.mcq
      if (!mcq) continue
      sectionMcqs++

      const q = mcq.question || ''
      const opts = Array.isArray(mcq.options) ? mcq.options : []
      const ci = Number.isInteger(mcq.correctIndex) ? mcq.correctIndex : -1

      if (ARTICLE_REF_RE.test(q)) {
        questionUnreadRef++
        if (mcqIssueSamples.length < 15) {
          mcqIssueSamples.push({
            forgeId: String(f._id),
            sectionNumber: s.sectionNumber,
            issue: 'question_references_unread_text',
            question: q,
          })
        }
      }

      if (words(q).length > 15) {
        questionTooLong++
        if (mcqIssueSamples.length < 15) {
          mcqIssueSamples.push({
            forgeId: String(f._id),
            sectionNumber: s.sectionNumber,
            issue: 'question_too_long',
            question: q,
          })
        }
      }

      if (opts.length !== 4) {
        optionsNotFour++
      }

      if (opts.some((o) => words(o).length > 7)) {
        optionTooLong++
      }

      if (opts.some((o) => PRECISE_NUM_RE.test(o || ''))) {
        preciseOption++
      }

      if (ci < 0 || ci >= opts.length) {
        badCorrectIndex++
      } else {
        const support = overlapScore(opts[ci], s.content || '')
        if (support < 0.25) {
          answerNotLexicallyDerivable++
          if (mcqIssueSamples.length < 15) {
            mcqIssueSamples.push({
              forgeId: String(f._id),
              sectionNumber: s.sectionNumber,
              issue: 'answer_not_lexically_derivable',
              support,
              correctOption: opts[ci],
            })
          }
        }
      }
    }

    if (hasHardVisualDependency || hasUrl || hasCategoryMismatch) {
      const reasons = []
      if (hasHardVisualDependency) reasons.push('hard_visual_dependency')
      if (hasUrl) reasons.push('url_present')
      if (hasCategoryMismatch) reasons.push('category_mismatch')
      actionCandidates.push({
        forgeId: String(f._id),
        seedId: f.seedArticleId ? String(f.seedArticleId) : null,
        title: f.title,
        category: f.category,
        reasons,
        hasHardVisualDependency,
        hasUrl,
        hasCategoryMismatch,
      })
    }
  }

  const now = new Date()
  const latestForge = await ForgeArticle.findOne({})
    .sort({ publishedAt: -1, createdAt: -1 })
    .select('_id title category status createdAt publishedAt')
    .lean()
  const latestSeed = await Article.findOne({ forgeStatus: { $in: ['pending', 'processing', 'accepted', 'rejected', 'failed'] } })
    .sort({ createdAt: -1 })
    .select('_id title category forgeStatus createdAt')
    .lean()

  const pairTop = [...pairCountMap.entries()]
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25)

  const perSeedCategoryRates = Object.entries(perSeedCategory)
    .map(([seedCategory, v]) => ({
      seedCategory,
      total: v.total,
      mismatch: v.mismatch,
      mismatchRatePct: +((v.mismatch / v.total) * 100).toFixed(2),
    }))
    .sort((a, b) => b.total - a.total)

  const mismatchBySourceTop = Object.entries(mismatchBySource)
    .map(([source, v]) => ({
      source,
      total: v.total,
      mismatch: v.mismatch,
      mismatchRatePct: +((v.mismatch / v.total) * 100).toFixed(2),
    }))
    .sort((a, b) => b.mismatchRatePct - a.mismatchRatePct)
    .slice(0, 25)

  const geographyBySourceTable = Object.entries(geographyBySource)
    .map(([source, v]) => ({
      source,
      ...v,
      mismatchRatePct: +((v.mismatch / v.total) * 100).toFixed(2),
    }))
    .sort((a, b) => b.total - a.total)

  const [seed30d, forge30d] = await Promise.all([
    dailyCoverage(
      Article,
      'createdAt',
      { forgeStatus: { $in: ['pending', 'processing', 'accepted', 'rejected', 'failed'] } },
      30,
    ),
    dailyCoverage(ForgeArticle, 'createdAt', {}, 30),
  ])

  return {
    meta: {
      observedAtUTC: now.toISOString(),
      database: mongoose.connection.name,
    },
    totals: {
      forgeArticles: forge.length,
      forgeArticlesWithSeed: pairedWithSeed,
      sections,
      sectionMcqs,
    },
    categoryAudit: {
      mismatchCount: categoryMismatch,
      mismatchRatePct: pairedWithSeed
        ? +((categoryMismatch / pairedWithSeed) * 100).toFixed(2)
        : 0,
      geographySeedTotal,
      geographySeedMismatch,
      geographyMismatchRatePct: geographySeedTotal
        ? +((geographySeedMismatch / geographySeedTotal) * 100).toFixed(2)
        : 0,
      topSeedToForgePairs: pairTop,
      perSeedCategoryRates,
      mismatchBySourceTop,
      geographyBySource: geographyBySourceTable,
      mismatchSamples,
      geographySamples,
    },
    automaticRejectionRuleSignals: {
      rejectIfHardVisualDependency: hardVisual,
      rejectIfSoftVisualMention: softVisual,
      rejectIfUrlPresent: urlSignals,
      rejectIfCategoryMismatch: categoryMismatch,
      hardVisualSamples,
    },
    verificationSignals: {
      forgeSectionMcq: {
        questionReferencesUnreadText: questionUnreadRef,
        questionTooLongOver15Words: questionTooLong,
        optionTooLongOver7Words: optionTooLong,
        optionsContainPreciseNumbers: preciseOption,
        optionsCountNot4: optionsNotFour,
        invalidCorrectIndex: badCorrectIndex,
        correctAnswerNotLexicallyDerivableFromSectionText:
          answerNotLexicallyDerivable,
        sampleIssues: mcqIssueSamples,
      },
      noMissingAssetsCheck: {
        // ForgeArticle has no image asset field, so hard visual dependency implies missing asset.
        hardVisualDependencyImpliesMissingAsset: hardVisual,
      },
    },
    actionCandidates,
    freshness: {
      latestForge,
      latestSeed,
      forge30d,
      seed30d,
    },
  }
}

function printSummary(report) {
  console.log('\n=== Forge Data Verifier Summary ===')
  console.log(`Observed UTC: ${report.meta.observedAtUTC}`)
  console.log(`DB: ${report.meta.database}`)
  console.log('')
  console.log(`Forge articles: ${report.totals.forgeArticles}`)
  console.log(
    `Category mismatch: ${report.categoryAudit.mismatchCount} (${report.categoryAudit.mismatchRatePct}%)`,
  )
  console.log(
    `Geography mismatch: ${report.categoryAudit.geographySeedMismatch}/${report.categoryAudit.geographySeedTotal} (${report.categoryAudit.geographyMismatchRatePct}%)`,
  )
  console.log('')
  console.log(
    `Hard visual dependency signals: ${report.automaticRejectionRuleSignals.rejectIfHardVisualDependency}`,
  )
  console.log(
    `Soft visual mention signals: ${report.automaticRejectionRuleSignals.rejectIfSoftVisualMention}`,
  )
  console.log(
    `URL signals: ${report.automaticRejectionRuleSignals.rejectIfUrlPresent}`,
  )
  console.log('')
  console.log(
    `MCQ non-derivable (lexical proxy): ${report.verificationSignals.forgeSectionMcq.correctAnswerNotLexicallyDerivableFromSectionText}`,
  )
  console.log(
    `MCQ options too long: ${report.verificationSignals.forgeSectionMcq.optionTooLongOver7Words}`,
  )
  console.log(
    `MCQ precise-number options: ${report.verificationSignals.forgeSectionMcq.optionsContainPreciseNumbers}`,
  )
  if (report.autoAction) {
    console.log('')
    console.log(`Auto action mode: ${report.autoAction.mode}`)
    console.log(`Auto selected: ${report.autoAction.selectedCount}`)
    console.log(`Auto modified: ${report.autoAction.modifiedCount}`)
  }
  console.log('===================================\n')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(`
Usage:
  node scripts/forgeDataVerifier.js [--db=default] [--output=/abs/path.json] [--apply=none|archive] [--apply-category-mismatch=true|false] [--sync-seed-status=true|false]

Examples:
  node scripts/forgeDataVerifier.js --db=default
  node scripts/forgeDataVerifier.js --db=default --output=/tmp/forge_audit.json
  node scripts/forgeDataVerifier.js --db=default --apply=archive --apply-category-mismatch=false
  node scripts/forgeDataVerifier.js --db=default --apply=archive --apply-category-mismatch=true --sync-seed-status=true
    `)
    process.exit(0)
  }

  const uri = pickDbUri(args.db)
  if (!uri) {
    throw new Error('DATABASE is missing')
  }

  await mongoose.connect(uri)

  const report = await runAudit()

  // Optional automation: archive failing forge articles.
  if (args.apply === 'archive') {
    const toArchive = report.actionCandidates.filter((c) => {
      if (c.hasHardVisualDependency || c.hasUrl) return true
      if (args.applyCategoryMismatch && c.hasCategoryMismatch) return true
      return false
    })

    if (toArchive.length > 0) {
      const now = new Date()
      const bulk = toArchive.map((c) => ({
        updateOne: {
          filter: { _id: c.forgeId },
          update: {
            $set: {
              status: 'archived',
              'llmMetadata.verifier': {
                archivedAt: now,
                mode: 'forgeDataVerifier',
                reasons: c.reasons,
              },
            },
          },
        },
      }))

      const res = await ForgeArticle.bulkWrite(bulk)
      report.autoAction = {
        mode: 'archive',
        applyCategoryMismatch: args.applyCategoryMismatch,
        syncSeedStatus: args.syncSeedStatus,
        selectedCount: toArchive.length,
        modifiedCount: res.modifiedCount,
      }

      if (args.syncSeedStatus) {
        const seedIds = toArchive
          .map((c) => c.seedId)
          .filter(Boolean)
        if (seedIds.length > 0) {
          const seedRes = await Article.updateMany(
            { _id: { $in: seedIds } },
            {
              $set: {
                forgeStatus: 'rejected',
                'forgeSeedData.rejectionReason': 'Archived by forgeDataVerifier',
                'forgeSeedData.processedAt': now,
              },
            },
          )
          report.autoAction.seedUpdate = {
            matchedCount: seedRes.matchedCount,
            modifiedCount: seedRes.modifiedCount,
          }
        }
      }
    } else {
      report.autoAction = {
        mode: 'archive',
        applyCategoryMismatch: args.applyCategoryMismatch,
        syncSeedStatus: args.syncSeedStatus,
        selectedCount: 0,
        modifiedCount: 0,
      }
    }
  } else if (args.apply !== 'none') {
    throw new Error(`Unsupported --apply mode: ${args.apply}`)
  }

  printSummary(report)

  if (args.output) {
    const out = path.isAbsolute(args.output)
      ? args.output
      : path.join(process.cwd(), args.output)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, JSON.stringify(report, null, 2))
    console.log(`Report saved to: ${out}`)
  } else {
    console.log(JSON.stringify(report, null, 2))
  }
}

main()
  .catch((err) => {
    console.error('Verifier failed:', err.message)
    process.exitCode = 1
  })
  .finally(async () => {
    try {
      await mongoose.disconnect()
    } catch (_) {}
  })
