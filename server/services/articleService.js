// File Path: server/src/services/articleService.js

const Article = require('../model/articleSchema')
const cache = require('memory-cache')
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

class ArticleService {
  static async getArticleContent(articleId) {
    try {
      const cacheKey = `article-${articleId}`
      const cachedArticle = cache.get(cacheKey)
      if (cachedArticle) return cachedArticle

      const article = await Article.findById(articleId)
      if (!article) {
        throw new Error('Article not found')
      }

      const source = article.url
        ? new URL(article.url).hostname.replace('www.', '')
        : 'rapidrecap.co.in'

      const formattedDate = new Date(article.dateTime)
        .toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        .toUpperCase()

      const processedArticle = {
        _id: article._id,
        title: article.title,
        mainText: article.mainText,
        dateTime: article.dateTime, // Keep original date for schema
        displayDate: formattedDate, // Formatted date for display
        source,
        category: article.category,
        tags: article.tags,
        avgReadTime: article.avgReadTime || 3,
        imgURL: article.imgURL?.[0] || null,
        url: article.url,
        author: article.author,
        keywords: article?.keywords || [],
        description: article?.description || '',
      }

      cache.put(cacheKey, processedArticle, CACHE_DURATION)
      return processedArticle
    } catch (error) {
      console.error('Error fetching article:', error)
      throw error
    }
  }

  static generateSEOMetaTags(articleData, baseUrl) {
    const description = articleData.mainText.substring(0, 155) + '...'
    const canonicalUrl = `${baseUrl}/article/${articleData._id}`

    return `
    <meta name="description" content="${description}">
    <meta name="keywords" content="${articleData.category}, ${
      articleData.tags?.join(', ') || 'news'
    }, rapid recap">
    <link rel="canonical" href="${canonicalUrl}">

    <meta property="og:type" content="article">
    <meta property="og:title" content="${articleData.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Rapid Recap">
    <meta property="article:published_time" content="${articleData.dateTime}">
    <meta property="article:section" content="${
      articleData.category || 'News'
    }">
    ${
      articleData.tags
        ? `<meta property="article:tag" content="${articleData.tags.join(
            ', ',
          )}">`
        : ''
    }

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${articleData.title}">
    <meta name="twitter:description" content="${description}">
    ${
      articleData.imgURL
        ? `<meta name="twitter:image" content="${articleData.imgURL}">`
        : ''
    }`
  }

  static replaceArticleContent(template, articleData) {
    // Add schema.org attributes without modifying visual structure
    let content = `<div itemscope itemtype="https://schema.org/NewsArticle">
      ${template}
    </div>`

    content = content
      .replace('{{title}}', articleData.title)
      .replace('{{mainText}}', articleData.mainText)
      .replace('{{dateTime}}', articleData.displayDate)
      .replace('{{source}}', articleData.source)
      .replace('{{readTime}}', articleData.avgReadTime)

    // Handle image section
    if (articleData.imgURL) {
      content = content.replace(
        '{{imageSection}}',
        `<figure class="image-container" style="aspect-ratio: 16/9; margin: 0;">
          <img
            src="${articleData.imgURL}"
            alt="${articleData.title}"
            width="800"
            height="450"
            class="content-image"
            loading="lazy"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
          <meta itemprop="image" content="${articleData.imgURL}">
        </figure>`,
      )
    } else {
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
