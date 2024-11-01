const generateLogoObject = baseUrl => ({
  '@type': 'ImageObject',
  url: `${baseUrl}/images/rrlogo_512.png`,
})

const generatePublisher = baseUrl => ({
  '@type': 'Organization',
  name: 'Rapid Recap',
  logo: generateLogoObject(baseUrl),
})

const generateArticleSchema = ({ articleData, baseUrl }) => ({
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: articleData.title,
  datePublished: articleData.dateTime,
  dateModified: articleData.dateTime,
  author: {
    '@type': 'Organization',
    name: articleData.author || 'Rapid Recap Team',
  },
  publisher: generatePublisher(baseUrl),
  image: articleData.imgURL?.[0] || `${baseUrl}/images/rrlogo_512.png`,
  articleSection: articleData.category,
  timeRequired: `PT${articleData.avgReadTime || 3}M`,
  isAccessibleForFree: 'True',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${baseUrl}/article/${articleData._id}`,
  },
  description: articleData.mainText.substring(0, 150) + '...',
})

const generateWebsiteSchema = baseUrl => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Rapid Recap',
  description:
    'Stay informed through friendly competition - Latest news, quizzes, and knowledge enhancement platform',
  url: baseUrl,
})

const getPathSegments = url => {
  // Remove query parameters and trailing slashes
  const cleanUrl = url.split('?')[0].replace(/\/+$/, '')
  const segments = cleanUrl.split('/').filter(Boolean)

  // Special handling for different routes
  if (segments.length === 0) return []

  // Handle article URLs - only keep article/id
  if (segments[0] === 'article' && segments.length > 2) {
    return [segments[0], segments[1]]
  }

  // Handle home with category
  if (segments[0] === 'home' && segments.length > 1) {
    return segments
  }

  return segments
}

const generateListItems = (paths, baseUrl) => {
  const items = []
  let position = 1

  // For root URL, just return Home
  if (paths.length === 0) {
    return [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
    ]
  }

  // Add Home as first item for all non-root pages
  items.push({
    '@type': 'ListItem',
    position: position++,
    name: 'Home',
    item: baseUrl,
  })

  // Process remaining path segments
  paths.forEach((path, index) => {
    let name
    let itemUrl

    switch (path) {
      case 'article':
        name = 'Article'
        itemUrl = `${baseUrl}/article/${paths[index + 1]}`
        break
      case 'home':
        name = paths[index + 1]
          ? `${paths[index + 1].charAt(0).toUpperCase()}${paths[
              index + 1
            ].slice(1)}`
          : 'Home'
        itemUrl = paths[index + 1]
          ? `${baseUrl}/home/${paths[index + 1]}`
          : `${baseUrl}/home`
        break
      case 'tournament':
        name = 'Tournament'
        itemUrl = `${baseUrl}/tournament`
        break
      case 'leaderboard':
        name = 'Leaderboard'
        itemUrl = `${baseUrl}/leaderboard`
        break
      case 'contact':
        name = paths[index + 1] === 'feedback' ? 'Feedback' : 'Contact'
        itemUrl =
          paths[index + 1] === 'feedback'
            ? `${baseUrl}/contact/feedback`
            : `${baseUrl}/contact`
        break
      default:
        // Skip if it's an article ID or already handled path
        if (
          paths[index - 1] === 'article' ||
          paths[index - 1] === 'home' ||
          paths[index - 1] === 'contact'
        ) {
          return
        }
        name = path.charAt(0).toUpperCase() + path.slice(1)
        itemUrl = `${baseUrl}/${paths.slice(0, index + 1).join('/')}`
    }

    items.push({
      '@type': 'ListItem',
      position: position++,
      name: name,
      item: itemUrl,
    })
  })

  return items
}

const generateBreadcrumbSchema = ({ url, baseUrl }) => {
  const paths = getPathSegments(url)
  const items = generateListItems(paths, baseUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

const injectStructuredData = (template, structuredData) => {
  const scriptTag = `<script type="application/ld+json">${JSON.stringify(
    structuredData,
  )}</script>`
  return template.replace('</head>', `${scriptTag}</head>`)
}

const generateAndInjectSchemas = ({ template, articleData, url, baseUrl }) => {
  let updatedTemplate = template

  // Generate and inject all schemas
  const schemas = []

  // Always include website schema
  schemas.push(generateWebsiteSchema(baseUrl))

  // Add article schema if article data exists
  if (articleData) {
    schemas.push(generateArticleSchema({ articleData, baseUrl }))
  }

  // Always include breadcrumb schema
  schemas.push(generateBreadcrumbSchema({ url, baseUrl }))

  // Inject all schemas at once
  const scriptTag = `<script type="application/ld+json">${JSON.stringify(
    schemas,
  )}</script>`
  updatedTemplate = template.replace('</head>', `${scriptTag}</head>`)

  return updatedTemplate
}

module.exports = {
  generateAndInjectSchemas,
  // generateArticleSchema,
  // generateWebsiteSchema,
  // generateBreadcrumbSchema,
}
