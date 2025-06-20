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

// Colors for the shared background section
const COLORS = {
  bg: '#121223',
  primaryGlow: 'rgba(128, 90, 213, 0.25)',
}

const GetStarted = () => {
  const { ref: refFooter, inView: inViewFooter } = useInView()

  useEffect(() => {
    // ... useEffect content remains unchanged
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
    // ... getStructuredData content remains unchanged
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
      <Helmet>{/* ... Helmet content remains unchanged */}</Helmet>

      {/* Wrapper for the sections that share the same background */}
      <Box
        bg={COLORS.bg}
        bgGradient={`radial-gradient(ellipse 80% 60% at 50% -10%, ${COLORS.primaryGlow}, ${COLORS.bg} 100%)`}
        pb={{ base: 6, md: 12 }} // Add some padding at the bottom of the gradient section
      >
        <HeroV2 inViewFooter={inViewFooter} />

        <QuickClashHighlight />
      </Box>

      {/* These sections will have the default solid background */}
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
