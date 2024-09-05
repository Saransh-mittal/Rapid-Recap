import React from 'react'
import {
  VStack,
  Text,
  Box,
  Flex,
  Image,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const InstructionModalBody = ({ isQuinBoostAvailable, isBoosted }) => {
  const { t } = useTranslation('InstructionModal')
  const textColor = 'white'
  const headingColor = useColorModeValue('purple.600', 'purple.200')

  const instructions = t('instructions', { returnObjects: true })

  // Debugging: Ensure instructions is an array
  console.log('Instructions:', instructions)

  return (
    <Box
      color={textColor}
      p={4}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color={headingColor}
        textAlign="center"
        mb={6}
      >
        {t('quizInstructions')}
      </Text>
      {isQuinBoostAvailable && (
        <Flex justifyContent="center" mb={4}>
          <Badge colorScheme="purple" fontSize="md" p={2} borderRadius="md">
            {t('quinBoostAvailable')}
          </Badge>
        </Flex>
      )}
      {isBoosted && (
        <Flex justifyContent="center" alignItems="center" gap={2} mb={4}>
          <Image src="/GIFs/starBoost.gif" height="60px" width="60px" />
          <Badge colorScheme="yellow" fontSize="xl" p={2}>
            {t('boosted')}
          </Badge>
        </Flex>
      )}
      <Text fontStyle="italic" fontWeight="bold" mb={4}>
        {t('readInstructions')}
      </Text>
      <VStack spacing={4} align="stretch">
        {Array.isArray(instructions) &&
          instructions.map((instruction, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Flex align="center">
                <Box
                  as="span"
                  fontWeight="bold"
                  fontSize="lg"
                  color={headingColor}
                  mr={3}
                >
                  {index + 1}.
                </Box>
                <Text
                  fontSize="lg"
                  fontWeight={'semibold'}
                  mb={0}
                  color={textColor}
                >
                  {instruction}
                </Text>
              </Flex>
            </MotionBox>
          ))}
      </VStack>
    </Box>
  )
}

export default InstructionModalBody
