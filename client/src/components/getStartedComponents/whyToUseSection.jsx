import React, { useRef, useMemo, useCallback, Suspense } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('whyToUseSection')

  const benefits = useMemo(
    () => [
      {
        id: '0',
        title: t('benefits.0.title'),
        text: t('benefits.0.text'),
        backgroundUrl: card1,
        imageUrl: rrlogo,
      },
      {
        id: '1',
        title: t('benefits.1.title'),
        text: t('benefits.1.text'),
        backgroundUrl: card2,
        imageUrl: rrlogo,
      },
      {
        id: '2',
        title: t('benefits.2.title'),
        text: t('benefits.2.text'),
        backgroundUrl: card3,
        imageUrl: rrlogo,
      },
      {
        id: '3',
        title: t('benefits.3.title'),
        text: t('benefits.3.text'),
        backgroundUrl: card4,
        imageUrl: rrlogo,
      },
      {
        id: '4',
        title: t('benefits.4.title'),
        text: t('benefits.4.text'),
        backgroundUrl: card5,
        imageUrl: rrlogo,
      },
      {
        id: '5',
        title: t('benefits.5.title'),
        text: t('benefits.5.text'),
        backgroundUrl: card6,
        imageUrl: rrlogo,
      },
    ],
    [t],
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
          <Heading tag={t('heading.tag')} title={t('heading.title')} />
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
