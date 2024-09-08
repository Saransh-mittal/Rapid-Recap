// components/tournamentComponents/TournamentHeader.js
import { Box, Heading } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const TournamentHeader = () => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Heading as="h1" size="2xl" mb={8} textAlign="center">
        Rapid Recap Tournament
      </Heading>
    </MotionBox>
  )
}

export default TournamentHeader
