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

    // Get image metadata if image exists
    const imageMetadata = articleData.imgURL
      ? {
          url: articleData.imgURL,
          alt: articleData.title, // Use title as alt text for SEO
          type: 'image',
        }
      : null

    // Replace image section with semantic HTML and metadata
    if (imageMetadata) {
      content = content.replace(
        '{{imageSection}}',
        `<figure class="image-container" style="aspect-ratio: 16/9; margin: 0;">
          <img
            src=""
            alt="${imageMetadata.alt}"
            width="800"
            height="450"
            class="content-image"
            loading="lazy"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <!-- SEO metadata -->
          <meta itemprop="image" content="${imageMetadata.url}">
          <meta itemprop="thumbnailUrl" content="${imageMetadata.url}">
          <meta itemprop="image:alt" content="${imageMetadata.alt}">
        </figure>`,
      )
    } else {
      // If no image, remove the image section entirely
      content = content.replace('{{imageSection}}', '')
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
