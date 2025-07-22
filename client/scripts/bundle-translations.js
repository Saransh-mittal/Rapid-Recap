// scripts/bundle-translations.js
// This file should ONLY contain file system operations, no i18next imports!

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const bundleTranslations = () => {
  const projectRoot = path.resolve(__dirname, '..')
  const localesDir = path.join(projectRoot, 'public/locales')
  const outputDir = path.join(projectRoot, 'public/locales/bundled')

  // Process both English and Hindi
  const languages = ['en', 'hi']

  languages.forEach(lang => {
    const langDir = path.join(localesDir, lang)
    const langOutputDir = path.join(outputDir, lang)

    if (!fs.existsSync(langDir)) {
      console.log(`⚠️ Language directory not found: ${langDir}`)
      return
    }

    // Ensure output directory exists
    if (!fs.existsSync(langOutputDir)) {
      fs.mkdirSync(langOutputDir, { recursive: true })
    }

    const allTranslations = {}

    // Walk through all translation files
    const walkDir = (dir, bundle, prefix = '') => {
      const files = fs.readdirSync(dir)

      files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          walkDir(filePath, bundle, `${prefix}${file}.`)
        } else if (file.endsWith('.json')) {
          try {
            const key = `${prefix}${file.replace('.json', '')}`
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
            bundle[key] = content
          } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message)
          }
        }
      })
    }

    // Bundle all translations into a single file per language
    walkDir(langDir, allTranslations)

    // Write bundled file
    const bundledFilePath = path.join(langOutputDir, 'all.json')
    fs.writeFileSync(bundledFilePath, JSON.stringify(allTranslations, null, 2))

    console.log(
      `✅ Bundled ${
        Object.keys(allTranslations).length
      } translations for ${lang}`,
    )
    console.log(`📁 Saved to: ${bundledFilePath}`)
  })

  console.log('🎉 Translation bundling complete!')
}

bundleTranslations()
