// components/tournamentComponents/EpicQuestGuide.js
import { VStack, Box, Text, Heading } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Star, Clock, Trophy, Crown } from 'lucide-react'

const MotionBox = motion(Box)

const EpicQuestGuide = () => {
  const guideInstructions = [
    { icon: Star, text: 'Conquer epic knowledge realms!' },
    { icon: Clock, text: '48-hour quest window awaits' },
    { icon: Trophy, text: 'Ascend ranks, claim glory' },
    { icon: Crown, text: 'Master the Current Affairs challenge' },
  ]

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Epic Quest Guide
      </Heading>
      <VStack align="start" spacing={4}>
        {guideInstructions.map((instruction, index) => (
          <MotionBox
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            display="flex"
            alignItems="center"
          >
            <Box as={instruction.icon} mr={2} color="pink.400" />
            <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
              {instruction.text}
            </Text>
          </MotionBox>
        ))}
      </VStack>
    </Box>
  )
}

export default EpicQuestGuide
