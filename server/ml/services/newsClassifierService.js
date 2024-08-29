// ml/services/newsClassifierService.js
const { spawn } = require('child_process')
const path = require('path')

class NewsClassifierService {
  classifyNews(text) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(__dirname, '..', 'scripts', 'classify_news.py'),
        text,
      ])

      let result = ''

      pythonProcess.stdout.on('data', data => {
        result += data.toString()
      })

      pythonProcess.stderr.on('data', data => {
        console.error(`Python script error: ${data}`)
        reject(new Error(data.toString()))
      })

      pythonProcess.on('close', code => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}`))
        } else {
          resolve(result.trim())
        }
      })
    })
  }
}

module.exports = new NewsClassifierService()
