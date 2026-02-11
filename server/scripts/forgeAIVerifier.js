const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const OpenAI = require('openai')

require('dotenv').config({ path: path.join(__dirname, '../config.env') })

const Article = require('../model/articleSchema')
const ForgeArticle = require('../model/quickClashSchemas/forgeArticleSchema')

const CATEGORY_MAP = {
  'gk-prime': 'GK Prime',
  'science-facts-simplified': 'Science Facts Simplified',
  'everyday-tech': 'Everyday Tech',
  geography: 'Geography',
}

const HARD_VISUAL_DEP_RE =
  /\b(see (the )?(image|photo|figure|diagram|table|graph|chart|map)|as shown (above|below)|shown (above|below)|in the (image|photo|figure|diagram|table|graph|chart|map)|table \d+|figure \d+|graph \d+|diagram \d+|map (above|below)|requires? (an?|the) (image|diagram|chart|graph|table|map)|watch the video)\b/i

function parseArgs(argv) {
  const args = {
    db: 'default',
    sample: 30,
    output: null,
    model: 'gpt-5-mini',
  }

  for (const raw of argv) {
    if (raw.startsWith('--db=')) args.db = raw.split('=')[1]
    else if (raw.startsWith('--sample=')) args.sample = Number(raw.split('=')[1])
    else if (raw.startsWith('--output=')) args.output = raw.split('=')[1]
    else if (raw.startsWith('--model=')) args.model = raw.split('=')[1]
    else if (raw === '--help' || raw === '-h') args.help = true
  }

  return args
}

function normalize(str) {
  return String(str || '').trim().toLowerCase()
}

function pickDbUri(dbArg) {
  if (dbArg === 'source') return process.env.DATABASE // backward-compatible alias
  return process.env.DATABASE
}

function buildJudgePrompt(item) {
  const sectionPayload = item.sections.map((s) => ({
    sectionNumber: s.sectionNumber,
    title: s.title,
    content: s.content,
    mcq: {
      question: s.mcq?.question || '',
      options: Array.isArray(s.mcq?.options) ? s.mcq.options : [],
      correctIndex:
        Number.isInteger(s.mcq?.correctIndex) ? s.mcq.correctIndex : null,
    },
  }))

  return `
You are auditing one educational article for a Forge-mode pipeline.
Return ONLY valid JSON with this exact shape:
{
  "categoryMatch": true/false,
  "categoryReason": "short reason",
  "requiresVisualAsset": true/false,
  "visualReason": "short reason",
  "sections": [
    {
      "sectionNumber": 1,
      "predictionHookAligned": true/false,
      "answerDerivableFromShownText": true/false,
      "reason": "short reason"
    }
  ],
  "overallPass": true/false
}

Rules:
1) categoryMatch: whether assigned category reasonably fits article content.
2) requiresVisualAsset: true if text depends on missing visual data (images/charts/tables/diagrams/maps).
3) predictionHookAligned: true if section MCQ is a pre-read guess hook (not comprehension of unseen text).
4) answerDerivableFromShownText: true if the marked correct option is reasonably inferable from section content alone.
5) overallPass is true only if:
   - categoryMatch = true
   - requiresVisualAsset = false
   - all sections have predictionHookAligned = true
   - all sections have answerDerivableFromShownText = true

Assigned category: ${item.category}
Seed category: ${item.seedCategory || 'unknown'}
Title: ${item.title}
Sections JSON:
${JSON.stringify(sectionPayload, null, 2)}
  `.trim()
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(`
Usage:
  node scripts/forgeAIVerifier.js [--db=default] [--sample=30] [--model=gpt-5-mini] [--output=/abs/path.json]

Examples:
  node scripts/forgeAIVerifier.js --db=default --sample=40
  node scripts/forgeAIVerifier.js --db=default --sample=25 --output=/tmp/forge_ai_verify.json
    `)
    process.exit(0)
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

  const allForge = await ForgeArticle.find({})
    .select('_id title category seedArticleId sections createdAt')
    .lean()

  const seedIds = allForge.map((f) => f.seedArticleId).filter(Boolean)
  const seeds = await Article.find({ _id: { $in: seedIds } })
    .select('_id category forgeSeedData.seedSource')
    .lean()
  const seedMap = new Map(seeds.map((s) => [String(s._id), s]))

  const flagged = []
  for (const f of allForge) {
    const seed = seedMap.get(String(f.seedArticleId))
    const seedRaw = seed?.category || ''
    const seedMapped = CATEGORY_MAP[normalize(seedRaw)] || seedRaw
    const mismatch = normalize(seedMapped) !== normalize(f.category)
    const blob = [f.title, ...(f.sections || []).map((s) => `${s.title || ''} ${s.content || ''}`)].join('\n')
    const hardVisual = HARD_VISUAL_DEP_RE.test(blob)
    if (mismatch || hardVisual) {
      flagged.push({
        ...f,
        seedCategory: seedRaw,
        seedSource: seed?.forgeSeedData?.seedSource || null,
      })
    }
  }

  const sample = []
  const seen = new Set()
  for (const f of flagged) {
    if (sample.length >= args.sample) break
    sample.push(f)
    seen.add(String(f._id))
  }
  if (sample.length < args.sample) {
    for (const f of allForge) {
      if (sample.length >= args.sample) break
      const id = String(f._id)
      if (seen.has(id)) continue
      const seed = seedMap.get(String(f.seedArticleId))
      sample.push({
        ...f,
        seedCategory: seed?.category || null,
        seedSource: seed?.forgeSeedData?.seedSource || null,
      })
      seen.add(id)
    }
  }

  const results = []
  for (let i = 0; i < sample.length; i++) {
    const item = sample[i]
    console.log(`[${i + 1}/${sample.length}] Verifying ${item._id} ...`)

    const prompt = buildJudgePrompt(item)

    let parsed = null
    try {
      const resp = await openai.chat.completions.create({
        model: args.model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a strict quality verifier. Output valid JSON only, no extra text.',
          },
          { role: 'user', content: prompt },
        ],
      })

      parsed = JSON.parse(resp.choices?.[0]?.message?.content || '{}')
    } catch (err) {
      parsed = {
        error: err.message,
      }
    }

    results.push({
      forgeId: String(item._id),
      title: item.title,
      category: item.category,
      seedCategory: item.seedCategory,
      seedSource: item.seedSource,
      ai: parsed,
    })
  }

  let checked = 0
  let categoryMismatch = 0
  let visualDependency = 0
  let sectionPredictionIssue = 0
  let sectionDerivabilityIssue = 0
  let overallFail = 0
  let errors = 0

  for (const r of results) {
    const ai = r.ai || {}
    if (ai.error) {
      errors++
      continue
    }
    checked++
    if (ai.categoryMatch === false) categoryMismatch++
    if (ai.requiresVisualAsset === true) visualDependency++
    if (Array.isArray(ai.sections)) {
      for (const s of ai.sections) {
        if (s.predictionHookAligned === false) sectionPredictionIssue++
        if (s.answerDerivableFromShownText === false) sectionDerivabilityIssue++
      }
    }
    if (ai.overallPass === false) overallFail++
  }

  const report = {
    meta: {
      observedAtUTC: new Date().toISOString(),
      database: mongoose.connection.name,
      sampleRequested: args.sample,
      sampleActual: sample.length,
      model: args.model,
      source: args.db,
    },
    summary: {
      checked,
      errors,
      aiCategoryMismatch: categoryMismatch,
      aiRequiresVisualAsset: visualDependency,
      aiSectionPredictionHookIssues: sectionPredictionIssue,
      aiSectionDerivabilityIssues: sectionDerivabilityIssue,
      aiOverallFail: overallFail,
    },
    results,
  }

  console.log('\n=== Forge AI Verifier Summary ===')
  console.log(`Checked: ${report.summary.checked}`)
  console.log(`Errors: ${report.summary.errors}`)
  console.log(`AI category mismatch: ${report.summary.aiCategoryMismatch}`)
  console.log(`AI visual dependency: ${report.summary.aiRequiresVisualAsset}`)
  console.log(
    `AI section prediction issues: ${report.summary.aiSectionPredictionHookIssues}`,
  )
  console.log(
    `AI section derivability issues: ${report.summary.aiSectionDerivabilityIssues}`,
  )
  console.log(`AI overall fail: ${report.summary.aiOverallFail}`)
  console.log('=================================\n')

  if (args.output) {
    const out = path.isAbsolute(args.output)
      ? args.output
      : path.join(process.cwd(), args.output)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, JSON.stringify(report, null, 2))
    console.log(`AI report saved to: ${out}`)
  } else {
    console.log(JSON.stringify(report, null, 2))
  }
}

main()
  .catch((err) => {
    console.error('AI verifier failed:', err.message)
    process.exitCode = 1
  })
  .finally(async () => {
    try {
      await mongoose.disconnect()
    } catch (_) {}
  })
