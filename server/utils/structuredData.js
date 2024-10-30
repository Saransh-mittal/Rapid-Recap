// server/utils/structuredData.js

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

const generateListItem = (path, index, baseUrl, paths) => ({
  '@type': 'ListItem',
  position: index + 1,
  name: path.charAt(0).toUpperCase() + path.slice(1),
  item: `${baseUrl}/${paths.slice(0, index + 1).join('/')}`,
})

const generateBreadcrumbSchema = ({ url, baseUrl }) => {
  const paths = url.split('/').filter(Boolean)
  const items = paths.map((path, index) =>
    generateListItem(path, index, baseUrl, paths),
  )

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

  if (articleData) {
    const articleSchema = generateArticleSchema({ articleData, baseUrl })
    updatedTemplate = injectStructuredData(updatedTemplate, articleSchema)
  }

  const websiteSchema = generateWebsiteSchema(baseUrl)
  updatedTemplate = injectStructuredData(updatedTemplate, websiteSchema)

  const breadcrumbSchema = generateBreadcrumbSchema({ url, baseUrl })
  updatedTemplate = injectStructuredData(updatedTemplate, breadcrumbSchema)

  return updatedTemplate
}

module.exports = {
  generateAndInjectSchemas,
  generateArticleSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema,
}
