const { spawn } = require('child_process')
const path = require('path')

/**
 * Run the Forge content scraper Python script
 *
 * LEARNING NOTE: We use spawn instead of exec because:
 * - Handles large output better (streaming)
 * - Better error handling
 * - Can capture stdout and stderr separately
 *
 * @param {number} maxSources - Optional limit on number of sources to scrape
 * @returns {Promise<Object>} - Scraping results
 */
async function runForgeScraper(maxSources = null) {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Forge content scraper...\n')

    const scriptPath = path.join(__dirname, 'web', 'forgeContentScraper.py')

    // Build args
    const args = [scriptPath]
    if (maxSources) {
      args.push(maxSources.toString())
    }

    // Spawn Python process
    const pythonProcess = spawn('python3', args, {
      env: {
        ...process.env,
        MONGODB_URI: process.env.MONGODB_URI || process.env.DATABASE,
      },
    })

    let stdoutData = ''
    let stderrData = ''

    // Capture stdout (JSON results)
    pythonProcess.stdout.on('data', data => {
      stdoutData += data.toString()
    })

    // Capture stderr (progress logs)
    pythonProcess.stderr.on('data', data => {
      const text = data.toString()
      stderrData += text
      // Print progress to console
      process.stderr.write(text)
    })

    // Handle process completion
    pythonProcess.on('close', code => {
      if (code !== 0) {
        console.error(`\n❌ Python process exited with code ${code}`)
        return reject(new Error(`Scraper failed with code ${code}`))
      }

      try {
        // Parse JSON result from stdout
        const result = JSON.parse(stdoutData.trim())
        console.log('\n✅ Scraper completed successfully')
        resolve(result)
      } catch (error) {
        console.error('\n❌ Error parsing scraper output:', error.message)
        reject(error)
      }
    })

    // Handle errors
    pythonProcess.on('error', error => {
      console.error('\n❌ Failed to start Python process:', error.message)
      reject(error)
    })
  })
}

/**
 * CLI interface for running the scraper manually
 */
async function main() {
  try {
    // Get max sources from command line
    const maxSources = process.argv[2] ? parseInt(process.argv[2]) : null

    if (maxSources) {
      console.log(`Scraping up to ${maxSources} sources...\n`)
    }

    // Run scraper
    const result = await runForgeScraper(maxSources)

    // Print results
    console.log('\n' + '='.repeat(80))
    console.log('📊 FINAL RESULTS')
    console.log('='.repeat(80))
    console.log(JSON.stringify(result.stats, null, 2))

    process.exit(0)
  } catch (error) {
    console.error('Error running scraper:', error.message)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

module.exports = { runForgeScraper }
