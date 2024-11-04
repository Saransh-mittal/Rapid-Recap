const generateMetaAndSchema = baseUrl => {
  const metaTags = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapid Recap - Stay Informed, Stay Ahead | Interactive News Learning Platform</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="Stay updated with the latest news and articles. Test your knowledge with quizzes and see your Information Quotient (IQ) score on Rapid Recap.">
  <meta name="keywords" content="Rapid Recap, news, articles, quizzes, IQ score, leaderboard, knowledge retention, interactive learning">
  <link rel="canonical" href="${baseUrl}">

  <!-- Open Graph Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Rapid Recap - Stay Informed, Stay Ahead">
  <meta property="og:description" content="Stay updated with the latest news and articles. Test your knowledge with quizzes and see your Information Quotient (IQ) score on Rapid Recap.">
  <meta property="og:url" content="${baseUrl}">
  <meta property="og:site_name" content="Rapid Recap">
  <meta property="og:image" content="${baseUrl}/images/rrlogo_512.png">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Rapid Recap - Stay Informed, Stay Ahead">
  <meta name="twitter:description" content="Stay updated with the latest news and articles. Test your knowledge with quizzes.">
  <meta name="twitter:image" content="${baseUrl}/images/rrlogo_512.png">

  <!-- Resource Hints -->
  <meta name="theme-color" content="#1a1527">
  <link rel="preload" href="/images/tourBGDark.webp" as="image">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/images/rrlogo_512.png">
  <link rel="icon" type="image/webp" href="/images/rrlogo.webp">

  <!-- Resource Links -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">

  <link rel="stylesheet" href="/styles/utils/reset.css">
  <link rel="stylesheet" href="/styles/utils/variables.css">
  <link rel="stylesheet" href="/styles/main.css">
  <link rel="stylesheet" href="/styles/components/css-navigation.css">
  <link rel="stylesheet" href="/styles/components/css-hero.css">
  <link rel="stylesheet" href="/styles/components/css-features.css">
  <link rel="stylesheet" href="/styles/components/css-benefits.css">
  <link rel="stylesheet" href="/styles/components/css-sections.css">
  <link rel="stylesheet" href="/styles/components/css-footer.css">
  <link rel="stylesheet" href="/styles/utils/responsive.css">`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Rapid Recap',
        url: baseUrl,
        description:
          'Stay updated with the latest news and articles. Test your knowledge with quizzes.',
      },
      {
        '@type': 'Organization',
        name: 'Rapid Recap',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/rrlogo_512.png`,
          width: '512',
          height: '512',
        },
        sameAs: [
          'https://www.linkedin.com/company/rrapidrecap/',
          'https://www.instagram.com/rrapidrecap/',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'rapidrecap2k23@gmail.com',
        },
      },
      {
        '@type': 'WebPage',
        url: baseUrl,
        name: 'Rapid Recap - Interactive News Learning Platform',
        description:
          'Stay updated with the latest news and articles. Test your knowledge with quizzes.',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Curated News',
              description: 'Access high-quality, tailored news content',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Active Learning',
              description: 'Engage with interactive quizzes',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'Track Progress',
              description: 'Monitor your growing Information Quotient (IQ)',
            },
          ],
        },
      },
    ],
  }

  return { metaTags, schema }
}

module.exports = { generateMetaAndSchema }
