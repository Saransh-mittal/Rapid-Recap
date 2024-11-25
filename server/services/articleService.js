// File: server/src/services/articleService.js

const Article = require('../model/articleSchema')
const cache = require('memory-cache')
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const slugify = require('slugify')
const AuthorProfileService = require('./authorProfileService')

class ArticleService {
  static async getArticleContent(articleId) {
    try {
      const cacheKey = `article-${articleId}`
      const cachedArticle = cache.get(cacheKey)
      if (cachedArticle) return cachedArticle

      const article = await Article.findById(articleId).populate(
        'relatedArticles',
      )

      if (!article) {
        throw new Error(`Article not found : articleId=${articleId}`)
      }
      // Generate author profile based on article category
      const authorProfile = await AuthorProfileService.generateAuthorProfile(
        article.category,
      )
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

      // Format related articles
      const relatedArticles = article.relatedArticles.map(related => ({
        _id: related._id,
        title: related.title,
        description:
          related.description || related.mainText.substring(0, 155) + '...',
        dateTime: new Date(related.dateTime)
          .toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          .toUpperCase(),
        category: related.category,
        imgURL: related.imgURL?.[0] || null,
        slugifiedTitle: slugify(related.title),
      }))

      const processedArticle = {
        _id: article._id,
        title: article.title,
        mainText: article.mainText,
        dateTime: article.dateTime,
        displayDate: formattedDate,
        source,
        category: article.category,
        tags: article.tags,
        avgReadTime: article.avgReadTime || 3,
        imgURL: article.imgURL?.[0] || null,
        url: article.url,
        authorProfile,
        author: article.author,
        keywords: article?.keywords || [],
        description: article?.description || '',
        relatedArticles,
      }

      cache.put(cacheKey, processedArticle, CACHE_DURATION)
      return processedArticle
    } catch (error) {
      console.error('Error fetching article:', error)
      throw error
    }
  }

  static replaceArticleContent(template, articleData) {
    // Add schema.org attributes without modifying visual structure
    let content = `<div itemscope itemtype="https://schema.org/NewsArticle">
      ${template}
    </div>`
    // Add author section
    const authorSection = `
      <div class="author-section" itemscope itemtype="https://schema.org/Person">
        <div class="author-info">
          <h4 class="author-name" itemprop="name">${articleData.authorProfile.name}</h4>
          <p class="author-title" itemprop="jobTitle">${articleData.authorProfile.title}</p>
          <p class="author-bio" itemprop="description">
            ${articleData.authorProfile.experience}.
            ${articleData.authorProfile.yearsInField} years of expertise in ${articleData.authorProfile.expertise}.
            ${articleData.authorProfile.education}
          </p>
        </div>
      </div>
    `
    content = content
      .replace('{{authorSection}}', authorSection)
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

    // Add related articles if available
    if (articleData.relatedArticles && articleData.relatedArticles.length > 0) {
      const relatedArticlesHTML = this.generateRelatedArticlesHTML(
        articleData.relatedArticles,
      )
      content = content.replace(
        '{{relatedArticlesSection}}',
        relatedArticlesHTML,
      )
    } else {
      content = content.replace('{{relatedArticlesSection}}', '')
    }

    return content
  }

  static generateRelatedArticlesHTML(relatedArticles) {
    const cardTemplate = `
      <article class="related-article-card" itemprop="isRelatedTo" itemscope itemtype="https://schema.org/NewsArticle">
        <a href="/article/{{_id}}/{{slugifiedTitle}}" class="card-link">
          <div class="card-image">
            <img src="{{imgURL}}" alt="{{title}}" loading="lazy" itemprop="image">
          </div>
          <div class="card-content">
            <h3 class="card-title" itemprop="headline">{{title}}</h3>
            <div class="card-meta">
              <span class="card-date" itemprop="datePublished">{{dateTime}}</span>
              <span class="card-category">{{category}}</span>
            </div>
            <p class="card-excerpt" itemprop="description">{{description}}</p>
          </div>
        </a>
      </article>
    `

    const cards = relatedArticles
      .map(article => {
        let card = cardTemplate
        Object.keys(article).forEach(key => {
          const value = article[key] || ''
          card = card.replace(new RegExp(`{{${key}}}`, 'g'), value)
        })
        return card
      })
      .join('')

    return `
      <div class="related-articles-section">
        <h2 class="related-title">Related Articles</h2>
        <div class="related-grid">
          ${cards}
        </div>
      </div>
    `
  }

  static extractArticleId(url) {
    try {
      const matches = url.match(/\/article\/([^/?]+)(?:\/[^?]*)?(?:\?.*)?$/)
      return matches ? matches[1] : null
    } catch (error) {
      console.error('Error extracting article ID:', error)
      return null
    }
  }
}

module.exports = ArticleService
