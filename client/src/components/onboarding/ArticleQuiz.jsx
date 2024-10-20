import React, { useState } from 'react'
import { Box, VStack, Text, Button, RadioGroup, Radio } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

const ArticleQuiz = ({ onComplete }) => {
  const [answers, setAnswers] = useState({ q1: '', q2: '' })
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = () => {
    setShowResults(true)
    setTimeout(() => {
      onComplete()
    }, 3000)
  }

  return (
    <Box
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        bg="rgba(255,255,255,0.05)"
        p={8}
        borderRadius="xl"
        boxShadow="xl"
        backdropFilter="blur(10px)"
        maxWidth="800px"
        width="90%"
      >
        <VStack spacing={6} align="stretch">
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            textAlign="center"
          >
            Test Your Knowledge
          </Text>
          <RadioGroup
            onChange={value => setAnswers({ ...answers, q1: value })}
            value={answers.q1}
          >
            <VStack align="stretch" spacing={4}>
              <Text fontSize="xl" color="white">
                What river runs through Paris?
              </Text>
              <Radio value="seine" colorScheme="purple">
                <Text color="white">Seine</Text>
              </Radio>
              <Radio value="thames" colorScheme="purple">
                <Text color="white">Thames</Text>
              </Radio>
              <Radio value="rhine" colorScheme="purple">
                <Text color="white">Rhine</Text>
              </Radio>
            </VStack>
          </RadioGroup>
          <RadioGroup
            onChange={value => setAnswers({ ...answers, q2: value })}
            value={answers.q2}
          >
            <VStack align="stretch" spacing={4}>
              <Text fontSize="xl" color="white">
                Which museum houses the Mona Lisa?
              </Text>
              <Radio value="louvre" colorScheme="purple">
                <Text color="white">Louvre</Text>
              </Radio>
              <Radio value="orsay" colorScheme="purple">
                <Text color="white">Musée d'Orsay</Text>
              </Radio>
              <Radio value="pompidou" colorScheme="purple">
                <Text color="white">Centre Pompidou</Text>
              </Radio>
            </VStack>
          </RadioGroup>
          <Button
            onClick={handleSubmit}
            bg="purple.600"
            color="white"
            size="lg"
            _hover={{
              bg: 'purple.700',
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
            isDisabled={!answers.q1 || !answers.q2}
          >
            Submit Quiz
          </Button>
          {showResults && (
            <Box bg="green.700" p={4} borderRadius="md" mt={4}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="white"
                textAlign="center"
              >
                Great job on completing the quiz!
              </Text>
              <Text fontSize="md" color="white" mt={2} textAlign="center">
                You're making excellent progress in your learning journey.
              </Text>
            </Box>
          )}
        </VStack>
      </MotionBox>
    </Box>
  )
}

export default ArticleQuiz
