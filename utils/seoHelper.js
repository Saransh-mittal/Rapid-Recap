// File: server/utils/seoHelper.js

const generateMetaTags = (articleData, baseUrl) => {
  const description = articleData.mainText.substring(0, 155) + '...'
  const canonicalUrl = `${baseUrl}/article/${articleData._id}`
  const isoDate = new Date(articleData.dateTime).toISOString()

  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleData.title} | Rapid Recap</title>

    <meta name="description" content="${description}">
    <meta name="keywords" content="${articleData.category}, news, rapid recap">
    <link rel="canonical" href="${canonicalUrl}">

    <meta property="og:type" content="article">
    <meta property="og:title" content="${articleData.title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="Rapid Recap">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:section" content="${
      articleData.category || 'News'
    }">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${articleData.title}">
    <meta name="twitter:description" content="${description}">
    ${
      articleData.imgURL
        ? `<meta name="twitter:image" content="${articleData.imgURL}">`
        : ''
    }

    <link rel="preload" href="/images/tourBGDark.webp" as="image">
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/images/rrlogo_512.png">
    <link rel="icon" type="image/webp" href="/images/rrlogo.webp">
  `
}

module.exports = { generateMetaTags }
