const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const OpenAI = require('openai')

require('dotenv').config({ path: path.join(__dirname, '../config.env') })

const Article = require('../model/articleSchema')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')

const CATEGORIES = [
  'India & World',
  'Science & Technology',
  'Tech Innovations',
  'Geography & Environment',
  'Unsuitable',
]

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

function normalize(str) {
  return String(str || '').trim().toLowerCase()
}

function pickDbUri(dbArg) {
  if (dbArg === 'source') return (process.env.DATABASE || '').trim() // backward-compatible alias
  return (process.env.DATABASE || '').trim()
}

function parseBool(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue
  return String(value).toLowerCase() === 'true'
}

function parseArgs(argv) {
  const args = {
    db: 'default',
    limit: 25,
    model: 'gpt-5-mini',
    minConfidence: 0.78,
    apply: false,
    onlyAutoArchived: false,
    cooldownHours: 24,
    output: null,
  }

  for (const raw of argv) {
    if (raw.startsWith('--db=')) args.db = raw.split('=')[1]
    else if (raw.startsWith('--limit=')) args.limit = Number(raw.split('=')[1])
    else if (raw.startsWith('--model=')) args.model = raw.split('=')[1]
    else if (raw.startsWith('--min-confidence=')) {
      args.minConfidence = Number(raw.split('=')[1])
    } else if (raw.startsWith('--apply=')) {
      args.apply = parseBool(raw.split('=')[1], false)
    } else if (raw.startsWith('--only-auto-archived=')) {
      args.onlyAutoArchived = parseBool(raw.split('=')[1], true)
    } else if (raw.startsWith('--cooldown-hours=')) {
      args.cooldownHours = Number(raw.split('=')[1])
    } else if (raw.startsWith('--output=')) args.output = raw.split('=')[1]
    else if (raw === '--help' || raw === '-h') args.help = true
  }

  if (!Number.isFinite(args.limit) || args.limit < 1) args.limit = 25
  if (!Number.isFinite(args.minConfidence)) args.minConfidence = 0.78
  args.minConfidence = Math.max(0, Math.min(1, args.minConfidence))
  if (!Number.isFinite(args.cooldownHours) || args.cooldownHours < 0) args.cooldownHours = 24

  return args
}

function canonicalSeedCategory(seedCategory) {
  const key = normalize(seedCategory)
  return CATEGORY_MAP[key] || seedCategory || 'Unknown'
}

function clamp01(value, fallback = 0) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

function sanitizeRecommendedCategory(value) {
  const val = String(value || '').trim()
  return CATEGORIES.includes(val) ? val : 'Unsuitable'
}

function buildPrompt(item) {
  const sections = Array.isArray(item.sections) ? item.sections : []
  const sectionPayload = sections.map((s) => ({
    sectionNumber: s.sectionNumber,
    title: s.title,
    content: s.content,
  }))

  return `
You are re-assessing an ARCHIVED educational Forge article.
Return ONLY valid JSON with this exact shape:
{
  "salvageable": true/false,
  "recommendedCategory": "GK Prime" | "Science Facts Simplified" | "Everyday Tech" | "Geography" | "Unsuitable",
  "confidence": 0.0,
  "reason": "short reason"
}

Rules:
1) salvageable=true only if content is still suitable for Forge and can be correctly categorized.
2) recommendedCategory must be one of the allowed enums.
3) confidence is a number 0..1 for the recommendation.
4) Keep Unsuitable if content should remain archived.
5) Base decision on article text itself, not previous category alone.

Archived forge title: ${item.title}
Current forge category: ${item.currentCategory}
Seed category (canonical): ${item.seedCategory}
Seed source: ${item.seedSource || 'unknown'}
Archive reason context: ${item.archiveReason || 'none'}

Sections JSON:
${JSON.stringify(sectionPayload, null, 2)}

Seed body excerpt:
${String(item.seedBody || '').slice(0, 2000)}
  `.trim()
}

async function runArchivedReassessment(options = {}) {
  const args = {
    db: options.db || 'default',
    limit: Number.isFinite(options.limit) ? options.limit : 25,
    model: options.model || 'gpt-5-mini',
    minConfidence:
      Number.isFinite(options.minConfidence) && options.minConfidence >= 0
        ? Math.min(1, options.minConfidence)
        : 0.78,
    apply: Boolean(options.apply),
    onlyAutoArchived:
      options.onlyAutoArchived === undefined
        ? false
        : Boolean(options.onlyAutoArchived),
    cooldownHours:
      Number.isFinite(options.cooldownHours) && options.cooldownHours >= 0
        ? options.cooldownHours
        : 24,
    output: options.output || null,
  }

  const uri = pickDbUri(args.db)
  if (!uri) {
    throw new Error('DATABASE is missing')
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing')
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  await mongoose.connect(uri)

  const cooldownCutoff = new Date(Date.now() - args.cooldownHours * 3600 * 1000)
  const filter = {
    status: 'archived',
    $or: [
      { 'llmMetadata.reassessment.lastCheckedAt': { $exists: false } },
      { 'llmMetadata.reassessment.lastCheckedAt': { $lte: cooldownCutoff } },
    ],
  }
  if (args.onlyAutoArchived) {
    filter['llmMetadata.verifier.mode'] = { $exists: true }
  }

  const archived = await ForgeArticle.find(filter)
    .sort({ 'llmMetadata.reassessment.lastCheckedAt': 1, createdAt: -1 })
    .limit(args.limit)
    .select(
      '_id title category status seedArticleId sections publishedAt llmMetadata.verifier llmMetadata.reassessment',
    )
    .lean()

  const seedIds = archived.map((a) => a.seedArticleId).filter(Boolean)
  const seeds = await Article.find({ _id: { $in: seedIds } })
    .select('_id title category mainText forgeSeedData.seedSource')
    .lean()
  const seedMap = new Map(seeds.map((s) => [String(s._id), s]))

  const now = new Date()
  const decisions = []
  const updates = []

  for (let i = 0; i < archived.length; i++) {
    const item = archived[i]
    const seed = seedMap.get(String(item.seedArticleId))
    const seedCategory = canonicalSeedCategory(seed?.category)
    const archiveReason =
      Array.isArray(item?.llmMetadata?.verifier?.reasons)
        ? item.llmMetadata.verifier.reasons.join(',')
        : item?.llmMetadata?.verifier?.reason || null

    const prompt = buildPrompt({
      title: item.title,
      currentCategory: item.category,
      seedCategory,
      seedSource: seed?.forgeSeedData?.seedSource || null,
      sections: item.sections || [],
      seedBody: seed?.mainText || '',
      archiveReason,
    })

    let ai = null
    let errMsg = null
    try {
      const resp = await openai.chat.completions.create({
        model: args.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a strict archival reassessor. Output valid JSON only with the required keys.',
          },
          { role: 'user', content: prompt },
        ],
      })
      ai = JSON.parse(resp.choices?.[0]?.message?.content || '{}')
    } catch (err) {
      errMsg = err.message
      ai = null
    }

    const recommendedCategory = sanitizeRecommendedCategory(ai?.recommendedCategory)
    const confidence = clamp01(ai?.confidence, 0)
    const salvageable = Boolean(ai?.salvageable)
    const shouldRestore =
      salvageable &&
      recommendedCategory !== 'Unsuitable' &&
      confidence >= args.minConfidence

    const decision = {
      forgeId: String(item._id),
      title: item.title,
      previousStatus: item.status,
      previousCategory: item.category,
      seedCategory,
      seedSource: seed?.forgeSeedData?.seedSource || null,
      ai: ai || { error: errMsg || 'unknown_error' },
      recommendedCategory,
      confidence,
      salvageable,
      shouldRestore,
      applied: false,
      action: shouldRestore ? 'restore' : 'remain_archived',
    }

    decisions.push(decision)

    if (!args.apply) continue

    if (shouldRestore) {
      updates.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              status: 'published',
              category: recommendedCategory,
              publishedAt: item.publishedAt || now,
              'llmMetadata.reassessment': {
                lastCheckedAt: now,
                model: args.model,
                decision: 'restored',
                confidence,
                recommendedCategory,
                previousCategory: item.category,
                reason: ai?.reason || null,
              },
            },
          },
        },
      })
      decision.applied = true
    } else {
      updates.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              'llmMetadata.reassessment': {
                lastCheckedAt: now,
                model: args.model,
                decision: 'remain_archived',
                confidence,
                recommendedCategory,
                previousCategory: item.category,
                reason: ai?.reason || errMsg || null,
              },
            },
          },
        },
      })
      decision.applied = true
    }
  }

  let modifiedCount = 0
  if (args.apply && updates.length > 0) {
    const res = await ForgeArticle.bulkWrite(updates)
    modifiedCount = res.modifiedCount
  }

  const summary = {
    checked: decisions.length,
    errors: decisions.filter((d) => d.ai?.error).length,
    restoreCandidates: decisions.filter((d) => d.shouldRestore).length,
    restored: decisions.filter((d) => d.applied && d.action === 'restore').length,
    remainedArchived: decisions.filter((d) => d.action === 'remain_archived').length,
    applied: args.apply,
    modifiedCount,
  }

  const report = {
    meta: {
      observedAtUTC: now.toISOString(),
      database: mongoose.connection.name,
      dbSource: args.db,
      model: args.model,
      minConfidence: args.minConfidence,
      apply: args.apply,
      onlyAutoArchived: args.onlyAutoArchived,
      cooldownHours: args.cooldownHours,
      limit: args.limit,
    },
    summary,
    decisions,
  }

  if (args.output) {
    const outPath = path.isAbsolute(args.output)
      ? args.output
      : path.join(process.cwd(), args.output)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2))
  }

  return report
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(`
Usage:
  node scripts/runArchivedForgeReassessment.js [--db=default] [--limit=25] [--model=gpt-5-mini] [--min-confidence=0.78] [--apply=true|false] [--only-auto-archived=true|false] [--cooldown-hours=24] [--output=reports/file.json]

Examples:
  node scripts/runArchivedForgeReassessment.js --db=default --limit=25 --apply=false
  node scripts/runArchivedForgeReassessment.js --db=default --limit=20 --apply=true --min-confidence=0.8 --output=reports/forge_archived_reassessment_latest.json
    `)
    process.exit(0)
  }

  const report = await runArchivedReassessment(args)

  console.log('\n=== Archived Forge Reassessment ===')
  console.log(`Checked: ${report.summary.checked}`)
  console.log(`Errors: ${report.summary.errors}`)
  console.log(`Restore candidates: ${report.summary.restoreCandidates}`)
  console.log(`Restored: ${report.summary.restored}`)
  console.log(`Remain archived: ${report.summary.remainedArchived}`)
  console.log(`Applied: ${report.summary.applied}`)
  console.log(`Modified count: ${report.summary.modifiedCount}`)
  console.log('===================================\n')

  if (args.output) {
    const outPath = path.isAbsolute(args.output)
      ? args.output
      : path.join(process.cwd(), args.output)
    console.log(`Report saved to: ${outPath}`)
  } else {
    console.log(JSON.stringify(report, null, 2))
  }
}

module.exports = { runArchivedReassessment }

if (require.main === module) {
  main()
    .catch((err) => {
      console.error('Archived reassessment failed:', err.message)
      process.exitCode = 1
    })
    .finally(async () => {
      try {
        await mongoose.disconnect()
      } catch (_) {}
    })
}
