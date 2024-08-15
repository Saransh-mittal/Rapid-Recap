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

const MotionBox = motion(Box)

const InstructionModalBody = ({
  isQuinBoostAvailable,
  isBoosted,
  language,
}) => {
  const textColor = 'white'
  const headingColor = useColorModeValue('purple.600', 'purple.200')

  const instructions = [
    'Quiz will contain utmost five questions.',
    'All questions will be from the given article only.',
    'All questions are compulsory to attempt.',
    'At last, you will get your score and your percentile.',
    "You can't leave the quiz in between.",
    'Attempting the quiz will affect your IQ score.',
  ]
  const hindiInstructions = [
    'क्विज में अधिकतम पाँच प्रश्न होंगे।',
    'सभी प्रश्न दिए गए लेख से ही होंगे।',
    'सभी प्रश्न को हल करना अनिवार्य है।',
    'अंत में, आपको अपना स्कोर और प्रतिशत प्राप्त होगा।',
    'आप क्विज को बीच में छोड़ नहीं सकते।',
    'क्विज का प्रयास करने से आपका आईक्यू स्कोर प्रभावित होगा।',
  ]

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
        {language === 'english' ? 'Quiz Instructions' : 'क्विज निर्देश'}
      </Text>
      {isQuinBoostAvailable && (
        <Flex justifyContent="center" mb={4}>
          <Badge colorScheme="purple" fontSize="md" p={2} borderRadius="md">
            {language === 'english'
              ? 'Quin Boost Available!'
              : 'क्विन बूस्ट उपलब्ध है!'}
          </Badge>
        </Flex>
      )}
      {isBoosted && (
        <Flex justifyContent="center" alignItems="center" gap={2} mb={4}>
          <Image src="/GIFs/starBoost.gif" height="60px" width="60px" />
          <Badge colorScheme="yellow" fontSize="xl" p={2}>
            1.5x Score Multiplier Active!
          </Badge>
        </Flex>
      )}
      <Text fontStyle="italic" fontWeight="bold" mb={4}>
        {language === 'english'
          ? 'Please read all instructions carefully before starting the quiz:'
          : 'क्विज का प्रयास करने से पहले सभी निर्देशों को ध्यानपूर्वक पढ़ें'}
      </Text>
      <VStack spacing={4} align="stretch">
        {(language === 'english' ? instructions : hindiInstructions).map(
          (instruction, index) => (
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
          ),
        )}
      </VStack>
    </Box>
  )
}

export default InstructionModalBody
