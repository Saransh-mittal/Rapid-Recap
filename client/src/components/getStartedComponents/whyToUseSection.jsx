import React, { useRef, useMemo, useCallback, Suspense } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import Section from '../miscellaneous/Section'
import Heading from '../miscellaneous/HeadingComponent'
const BenefitCard = React.lazy(() => import('../miscellaneous/CardComponent'))
import rrlogo from '/images/rrlogo.webp'

// Import card images
import card1 from '../../assets/benefits/card-1.svg'
import card2 from '../../assets/benefits/card-2.svg'
import card3 from '../../assets/benefits/card-3.svg'
import card4 from '../../assets/benefits/card-4.svg'
import card5 from '../../assets/benefits/card-5.svg'
import card6 from '../../assets/benefits/card-6.svg'

const WhyToUseSection = () => {
  const parallaxRef = useRef(null)

  const benefits = useMemo(
    () => [
      {
        id: '0',
        title: 'MULTI CATEGORIES NEWS',
        text: `Stay ahead with Rapid Recap! Explore the latest news and trends across Top, General, Business, Technology, Entertainment, Sports, Science, Health, and more.\n Stay informed, stay updated, and never miss out on the latest happenings around the globe. Dive into a world of information!`,
        backgroundUrl: card1,
        imageUrl: rrlogo,
      },
      {
        id: '1',
        title: 'IQ SCORE',
        text: `Boost your Information Quotient (IQ) Score! Your IQ score reflects your knowledge bank, increasing with each quiz you conquer.\n Engage more, score higher, and watch your IQ soar. Challenge yourself and climb the leaderboard!`,
        backgroundUrl: card2,
        imageUrl: rrlogo,
      },
      {
        id: '2',
        title: 'RQM SCORE',
        text: `Master the Rapid Quiz Mastery (RQM) Score! Your RQM score is calculated based on accuracy and speed in answering quizzes.\nSharpen your skills, answer swiftly, and rise to the top. Become the ultimate quiz master!`,
        backgroundUrl: card3,
        imageUrl: rrlogo,
      },
      {
        id: '3',
        title: 'Societies and Circles',
        text: `Join elite Societies and Circles! These groups celebrate different cognitive abilities and foster intellectual growth.\nAdvance through levels like Visionaries and Pioneers in the Mavericks Society, or Scholars and Masters in the Elites Society. Elevate your intellect!`,
        backgroundUrl: card4,
        imageUrl: rrlogo,
      },
      {
        id: '4',
        title: 'Experience Level',
        text: `Earn XP (Experience Points) for your activities! Gain points through quizzes and site engagement.\nUpgrade your Society or Circle with calculated XP based on IQ thresholds. Achieve accurate rewards and celebrate your progress!`,
        backgroundUrl: card5,
        imageUrl: rrlogo,
      },
      {
        id: '5',
        title: 'Streak Systems and Boosts',
        text: `Unlock rewards with our Streak Systems!\nDaily Streaks grant a 1.5x RQM score after 6 days of continuous activity.\nQuin Boost Streaks offer a 1.5x RQM score on the 6th quiz of the same day. Keep the streaks alive!`,
        backgroundUrl: card6,
        imageUrl: rrlogo,
      },
    ],
    [],
  )

  const renderBenefitCard = useCallback(
    ({ id, title, text, backgroundUrl, imageUrl, light }) => (
      <Suspense fallback={<div>Loading...</div>} key={id}>
        <BenefitCard
          id={id}
          title={title}
          text={text}
          backgroundUrl={backgroundUrl}
          imageUrl={imageUrl}
        />
      </Suspense>
    ),
    [],
  )

  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="whyToUse">
      <Flex
        position="relative"
        textAlign="center"
        mx="auto"
        mb={'2rem'}
        ref={parallaxRef}
        flexDirection="column"
      >
        <Box position="relative" zIndex="2">
          <Heading
            tag={'Engage, Learn, and Excel'}
            title={'Discover the Power of Rapid Recap'}
          />
          <Flex
            flexWrap="wrap"
            justifyContent="center"
            gap={6}
            mx={'auto'}
            px={4}
          >
            {benefits.map(renderBenefitCard)}
          </Flex>
        </Box>
      </Flex>
    </Section>
  )
}

export default WhyToUseSection
