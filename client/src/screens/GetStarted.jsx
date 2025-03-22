import React, { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { ParallaxProvider } from 'react-scroll-parallax'
import { useInView } from 'react-intersection-observer'
import BenefitsMap from '../components/getStartedComponents/BenefitsMap'
import Features from '../components/getStartedComponents/Features'
import HeroV2 from '../components/getStartedComponents/HeroV2'
import QuickClashHighlight from '../components/getStartedComponents/QuickClashHighlight'
import Footer from '../components/Header-Footer/Footer'
import { Helmet } from 'react-helmet'

const GetStarted = () => {
  const { ref: refFooter, inView: inViewFooter } = useInView()

  useEffect(() => {
    const preloadImages = () => {
      const images = [
        '/images/landingPage/featureBg.webp',
        '/images/landingPage/featureBgMobile.webp',
        '/images/landingPage/homeUI.webp',
        '/images/landingPage/articleUI.webp',
        '/images/landingPage/quizUI.webp',
        '/images/landingPage/tournamentUI.webp',
      ]

      images.forEach(src => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = src
        document.head.appendChild(link)
      })
    }

    preloadImages()
  }, [])

  const getStructuredData = () => {
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Rapid Recap',
      url: 'https://rapidrecap.ai',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://rapidrecap.ai/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    }

    const webAppSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Rapid Recap - AI-Powered GK Quiz Platform',
      url: 'https://rapidrecap.ai',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      description:
        'Master general knowledge with AI-enhanced quizzes. Practice daily current affairs and GK questions with instant answers.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1000',
        bestRating: '5',
        worstRating: '1',
      },
      potentialAction: [
        {
          '@type': 'LoginAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://rapidrecap.ai/#signin',
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          description: 'Sign in to access your AI-powered GK quiz platform',
        },
        {
          '@type': 'RegisterAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://rapidrecap.ai/#register',
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          description:
            'Create your free account to start learning with AI-powered GK quizzes',
        },
      ],
      publisher: {
        '@type': 'Organization',
        name: 'Rapid Recap Inc',
        url: 'https://rapidrecap.ai',
        logo: {
          '@type': 'ImageObject',
          url: 'https://rapidrecap.ai/images/rrlogo_512.png',
          width: '512',
          height: '512',
        },
        sameAs: [
          'https://www.instagram.com/rrapidrecap/',
          'https://www.linkedin.com/company/rrapidrecap/',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'team@rapidrecap.ai',
        },
      },
      audience: {
        '@type': 'Audience',
        audienceType: 'Students, Professionals, Knowledge Enthusiasts',
        geographicArea: {
          '@type': 'Country',
          name: 'India',
        },
      },
      applicationSuite: 'Rapid Recap Learning Platform',
      availableLanguage: ['English', 'Hindi'],
      featureList: [
        'AI-Powered GK Questions',
        'Daily Current Affairs Quiz',
        'Interactive Learning System',
        'Competitive Knowledge Tournaments',
        'Bilingual Support (English & Hindi)',
        'Real-time Progress Tracking',
        'Tournament System',
        'Society Rankings',
      ],
      screenshot: {
        '@type': 'ImageObject',
        url: 'https://rapidrecap.ai/images/app-screenshot.webp',
        caption: 'Rapid Recap GK Quiz Interface',
      },
      softwareVersion: '1.0',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      permissions: 'internet',
      educationalUse: [
        'Quiz/Test',
        'Self Assessment',
        'Competitive Exam Preparation',
      ],
    }

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What kind of content does Rapid Recap offer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We offer daily GK quizzes, current affairs updates, interactive learning content, and weekly tournaments to help you master general knowledge through gamification.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is the GK quiz platform free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, our AI-powered GK quiz platform is completely free to access with daily updates, competitive tournaments, and instant answers to help you improve your knowledge.',
          },
        },
        {
          '@type': 'Question',
          name: 'How can this help in competitive exam preparation?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Our AI-powered platform provides daily current affairs updates and general knowledge questions that are essential for competitive exams. Practice with our interactive quizzes to improve your knowledge and test-taking skills.',
          },
        },
      ],
    }

    return [websiteSchema, webAppSchema, faqSchema]
  }

  const structuredData = getStructuredData()

  const renderContent = () => (
    <Box minHeight="100vh">
      <Helmet>
        <link rel="canonical" href="https://rapidrecap.ai" />
        <title>
          GK Quiz Online | AI-Powered Current Affairs & General Knowledge
          Questions
        </title>
        <meta
          name="description"
          content="Master general knowledge questions with our AI-powered online GK quiz platform. Take engaging current affairs quiz, practice general quiz questions & get instant answers. Join 1000+ learners improving daily in just 5-15 minutes!"
        />
        <meta
          name="keywords"
          content="general knowledge questions, gk questions with answers, gk questions in english, general quiz questions, online general knowledge quiz, gk quiz online, general quiz, current affairs quiz, AI learning platform, artificial intelligence quiz, current affairs questions, competitive exam preparation"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rapidrecap.ai" />
        <meta
          property="og:title"
          content="AI-Powered GK Quiz Platform | Current Affairs & General Knowledge Questions"
        />
        <meta
          property="og:description"
          content="Practice daily current affairs and GK questions with our AI-enhanced quiz platform. Master general knowledge with interactive quizzes and compete in knowledge tournaments."
        />
        <meta
          property="og:image"
          content="https://rapidrecap.ai/images/rrlogo_512.png"
        />
        <meta property="og:site_name" content="Rapid Recap" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="hi_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://rapidrecap.ai" />
        <meta
          name="twitter:title"
          content="AI-Powered GK Quiz Platform | Best Online General Knowledge Quiz"
        />
        <meta
          name="twitter:description"
          content="Master general knowledge with AI-enhanced quizzes. Daily current affairs updates and interactive GK questions with answers. Perfect for competitive exam preparation."
        />
        <meta
          name="twitter:image"
          content="https://rapidrecap.ai/images/rrlogo_512.png"
        />

        <meta
          name="application-name"
          content="Rapid Recap - AI GK Quiz Platform"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="Rapid Recap - GK Quiz"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#1a1527" />
        {structuredData.map((schema, index) => (
          <script key={`structured-data-${index}`} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>
      <HeroV2 inViewFooter={inViewFooter} />

      {/* Add the QuickClashHighlight component here */}
      <Box maxW="container.xl" mx="auto" px={{ base: 4, md: 0 }}>
        <QuickClashHighlight />
      </Box>

      <BenefitsMap />

      <Features />
      <Footer refFooter={refFooter} />
    </Box>
  )

  return (
    <>
      <ParallaxProvider>{renderContent()}</ParallaxProvider>
    </>
  )
}

export default GetStarted
