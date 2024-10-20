import React from 'react'
import { Box, VStack, Text, Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)

const QuizResult = ({ isCorrect, onNext }) => {
  return (
    <Box h="100vh" display="flex" alignItems="center" justifyContent="center">
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        bg="rgba(255,255,255,0.05)"
        p={12}
        borderRadius="xl"
        boxShadow="xl"
        backdropFilter="blur(10px)"
        maxWidth="600px"
        width="90%"
      >
        <VStack spacing={8} align="stretch">
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            textAlign="center"
          >
            {isCorrect ? 'Impressive Knowledge!' : 'Learning Opportunity!'}
          </Text>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            textAlign="center"
          >
            {isCorrect ? (
              <>
                <CheckIcon color={'green'} />

                <Text as="span" ml={3}>
                  {'Correct!'}
                </Text>
              </>
            ) : (
              <>
                <CloseIcon color={'red'} />
                <Text as="span" ml={3}>
                  {'Wrong!'}
                </Text>
              </>
            )}
          </Text>
          <Text fontSize="xl" color="white" textAlign="center">
            {isCorrect
              ? 'Wow! You have great knowledge about world capitals. Keep it up!'
              : "Don't worry, we're here to learn together. Every question is an opportunity to grow."}
          </Text>
          <Text fontSize="lg" color="white" textAlign="center">
            Next, we'll level up this quizzing experience. You'll read a short
            article and then answer some questions about it.
          </Text>
          <Button
            onClick={onNext}
            bg="purple.600"
            color="white"
            size="lg"
            _hover={{
              bg: 'purple.700',
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            Continue to Article
          </Button>
        </VStack>
      </MotionBox>
    </Box>
  )
}

export default QuizResult
