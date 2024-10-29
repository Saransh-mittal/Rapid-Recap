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

    if (articleData.imgURL) {
      // Set default dimensions that maintain a common aspect ratio
      const defaultWidth = 800
      const defaultHeight = 450 // 16:9 aspect ratio

      // Create an image section with explicit width and height
      // Using loading="lazy" for better performance
      // Using aspect-ratio CSS to maintain proportions
      content = content.replace(
        '{{imageSection}}',
        `<div class="image-container" style="aspect-ratio: ${defaultWidth}/${defaultHeight};">
            <img
              src="${articleData.imgURL}"
              alt="${articleData.title}"
              width="${defaultWidth}"
              height="${defaultHeight}"
              class="content-image"
              loading="lazy"
              style="width: 100%; height: 100%; object-fit: cover;"
            >
          </div>`,
      )
    } else {
      // Placeholder with explicit dimensions
      content = content.replace(
        '{{imageSection}}',
        `<div class="image-container" style="aspect-ratio: 16/9;">
            <img
              src="/placeholder-image.jpg"
              alt="Content image placeholder"
              width="800"
              height="450"
              class="content-image"
              loading="lazy"
              style="width: 100%; height: 100%; object-fit: cover;"
            >
          </div>`,
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
