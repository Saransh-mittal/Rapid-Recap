// File Path: server/src/services/articleService.js

const Article = require('../model/articleSchema')

class ArticleService {
  static async getArticleContent(articleId) {
    try {
      const article = await Article.findById(articleId)
      if (!article) {
        throw new Error('Article not found')
      }

      // Extract domain from URL for source
      const source = article.url
        ? new URL(article.url).hostname.replace('www.', '')
        : 'rapidrecap.co.in'

      // Format date
      const formattedDate = new Date(article.dateTime)
        .toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        .toUpperCase()

      return {
        title: article.title,
        mainText: article.mainText,
        dateTime: formattedDate,
        source,
        readTime: article.avgReadTime || 3,
        imgURL:
          article.imgURL && article.imgURL.length > 0
            ? article.imgURL[0]
            : null,
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      throw error
    }
  }

  static replaceArticleContent(template, articleData) {
    let content = template
      .replace('{{title}}', articleData.title)
      .replace('{{mainText}}', articleData.mainText)
      .replace('{{dateTime}}', articleData.dateTime)
      .replace('{{source}}', articleData.source)
      .replace('{{readTime}}', articleData.readTime)

    if (!articleData.imgURL) {
      content = content.replace(
        '{{imageSection}}',
        `<img src="${articleData.imgURL}" alt="${articleData.title}" class="content-image">`,
      )
    } else {
      content = content.replace(
        '{{imageSection}}',
        '<img src="" alt="Content image" class="content-image">',
      )
    }

    return content
  }

  static extractArticleId(url) {
    try {
      const matches = url.match(/\/article\/([^/]+)/)
      return matches ? matches[1] : null
    } catch (error) {
      console.error('Error extracting article ID:', error)
      return null
    }
  }
}

module.exports = ArticleService
