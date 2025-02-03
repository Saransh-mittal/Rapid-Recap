const generateMetaAndSchema = baseUrl => {
  const metaTags = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapid Recap - Interactive News Quiz Platform | Boost Your News IQ</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="Transform your daily news consumption with Rapid Recap. Get quick news summaries, test your knowledge with interactive quizzes, and track your News IQ. Join 1000+ active learners enjoying personalized learning.">
  <meta name="keywords" content="quick news summaries, rapid news recaps, smart reading assistant, AI-powered news reading, interactive news definitions, intelligent news highlights, word definitions while reading, news comprehension tool, interactive news quiz app, engage with news and quizzes, daily news recap with quizzes, news IQ booster, quiz based news app, fun news recap, news learning platform, personalized news feed, current affairs quiz, competitive news learning, weekend news tournament">
  <link rel="canonical" href="${baseUrl}">

  <!-- Open Graph Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="Rapid Recap - Interactive News Learning & Quizzes">
  <meta property="og:description" content="Experience smarter news reading with AI-powered highlights and instant word definitions. Test your knowledge with interactive quizzes and track your News IQ progress.">

  <meta property="og:url" content="${baseUrl}">
  <meta property="og:site_name" content="Rapid Recap">
  <meta property="og:image" content="${baseUrl}/images/rrlogo_512.png">
  <meta property="og:locale" content="en_US">
  <meta property="og:locale:alternate" content="hi_IN">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Rapid Recap - Boost Your News IQ">
  <meta name="twitter:description" content="Transform your news learning with quick summaries and interactive quizzes. Track progress, join tournaments, and improve your News IQ with our engaging platform.">
  <meta name="twitter:image" content="${baseUrl}/images/rrlogo_512.png">

  <!-- Additional Meta Tags -->
  <meta name="robots" content="index, follow">
  <meta name="language" content="English">
  <meta name="revisit-after" content="7 days">
  <meta name="author" content="Rapid Recap">

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
          email: 'team@rapidrecap.ai',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Rapid Recap',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      },
      {
        '@type': 'WebPage',
        url: baseUrl,
        name: 'Rapid Recap - Interactive News Learning Platform',
        description:
          'Transform your news consumption with quick summaries and interactive quizzes. Track your News IQ and compete in weekly tournaments.',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Quick News Summaries',
              description: 'Get concise, curated news across 15+ categories',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Interactive Quizzes',
              description: 'Test knowledge with adaptive difficulty quizzes',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'News IQ Tracking',
              description: 'Monitor progress through societies and circles',
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: 'Weekend Tournaments',
              description: 'Compete for badges and top rankings',
            },
          ],
        },
      },
    ],
  }

  return { metaTags, schema }
}

module.exports = { generateMetaAndSchema }
