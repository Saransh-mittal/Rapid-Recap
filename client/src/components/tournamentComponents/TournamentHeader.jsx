import React, { useMemo, Suspense } from 'react'
import { Box, Heading, Spinner } from '@chakra-ui/react'
import { motion } from 'framer-motion'

// Lazy load motion Box for code splitting
const MotionBox = motion(Box)

const TournamentHeader = () => {
  // Memoize animation properties to avoid re-creation on each render
  const motionProps = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.5 },
    }),
    [],
  )

  return (
    <Suspense fallback={<Spinner />}>
      <MotionBox {...motionProps}>
        <Heading as="h1" size="2xl" mb={8} textAlign="center">
          Rapid Recap Tournament
        </Heading>
      </MotionBox>
    </Suspense>
  )
}

export default TournamentHeader
