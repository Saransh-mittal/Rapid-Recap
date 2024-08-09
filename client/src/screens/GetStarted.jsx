// /pages/GetStarted.jsx
import React from 'react'
import { Flex } from '@chakra-ui/react'
import { Suspense, useMemo, useCallback } from 'react'

const HeroSection = React.lazy(() =>
  import('../components/getStartedComponents/heroSection'),
)
const WhyToUseSection = React.lazy(() =>
  import('../components/getStartedComponents/whyToUseSection'),
)
const CommingSoonSection = React.lazy(() =>
  import('../components/getStartedComponents/commingSoonSection'),
)

const GetStarted = () => {
  // Memoize the Flex container styles to prevent unnecessary re-renders.
  const flexStyles = useMemo(
    () => ({
      mt: { base: '4rem', lg: '5rem' },
      flexDirection: 'column',
      overflow: 'hidden',
      letterSpacing: '2px',
    }),
    [],
  )

  // Memoize the rendering of sections to prevent unnecessary re-renders.
  const renderHeroSection = useCallback(() => <HeroSection />, [])
  const renderWhyToUseSection = useCallback(() => <WhyToUseSection />, [])
  const renderCommingSoonSection = useCallback(() => <CommingSoonSection />, [])

  return (
    <Flex {...flexStyles}>
      <Suspense fallback={<div>Loading...</div>}>
        {renderHeroSection()}
        {renderWhyToUseSection()}
        {renderCommingSoonSection()}
      </Suspense>
    </Flex>
  )
}

export default GetStarted
