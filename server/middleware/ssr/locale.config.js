// server/middleware/ssr/locale.config.js
const path = require('path')
const fs = require('fs').promises

function setupLocaleMiddleware(app) {
  app.use('/locales/:lang/:namespace.json', async (req, res) => {
    const { lang, namespace } = req.params
    const filePath = path.join(
      __dirname,
      `../../../client/public/locales/${lang}/${namespace}.json`,
    )

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      res.json(JSON.parse(content))
    } catch (error) {
      console.error(`Error loading locale file: ${filePath}`, error)
      res.status(404).send('Not found')
    }
  })
}

module.exports = { setupLocaleMiddleware }
