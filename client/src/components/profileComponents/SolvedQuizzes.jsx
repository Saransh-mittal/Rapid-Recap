import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import {
  Box,
  Flex,
  Text,
  Progress,
  Spinner,
  Badge,
  Button,
  useColorModeValue,
  VStack,
  HStack,
  Circle,
  Tooltip,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { InfoIcon } from '@chakra-ui/icons'

// Lazy load the SolvedQuizHistory component
const SolvedQuizHistory = lazy(() =>
  import('./SolvedQuizSubComponents/SolvedQuizHistory'),
)

const MotionBox = motion(Box)

const AwardIcon = props => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28z"
    />
    <path
      fill="currentColor"
      d="M21 11c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V5l9-4 9 4v6m-9 10c3.75-1 7-5.46 7-9.78V6.3l-7-3.12L5 6.3v4.92C5 15.54 8.25 20 12 21z"
    />
  </Icon>
)

const ClockIcon = props => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"
    />
  </Icon>
)

const QuizCategory = ({ title, count, percentage, color }) => (
  <Box w={'100%'}>
    <Flex justify="space-between" align="center" mb={2} w={'100'}>
      <Text fontSize="sm" fontWeight="medium" color="gray.200">
        {title}
      </Text>
      <Text fontSize="xs" color="gray.400">
        {count} Solved
      </Text>
    </Flex>
    <Progress
      value={percentage}
      size="sm"
      colorScheme={color}
      borderRadius="full"
      w={'100%'}
      mb={2}
    />
    <Flex justify="flex-end">
      <Badge variant="subtle" colorScheme={color} fontSize="xs">
        Beats {percentage}%
      </Badge>
    </Flex>
  </Box>
)

const SolvedQuizzes = ({
  solvedQuizzes,
  inGameName,
  privateSolvedQuiz,
  loginedUserProfile,
  isDisabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)

  const bgColor = useColorModeValue('gray.800', 'gray.900')
  const borderColor = useColorModeValue('gray.700', 'gray.800')

  const { solvedQuizzesCount, easySolved, mediumSolved, hardSolved } = useMemo(
    () => ({
      solvedQuizzesCount: solvedQuizzes.solvedQuizzesCount || 0,
      easySolved: solvedQuizzes.easy || {
        easyQuizzesCount: 0,
        easyBeatsPercentage: 0,
      },
      mediumSolved: solvedQuizzes.medium || {
        mediumQuizzesCount: 0,
        medBeatsPercentage: 0,
      },
      hardSolved: solvedQuizzes.hard || {
        hardQuizzesCount: 0,
        hardBeatsPercentage: 0,
      },
    }),
    [solvedQuizzes],
  )

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (privateSolvedQuiz) {
    return (
      <Flex
        bg={bgColor}
        borderColor={borderColor}
        borderWidth={1}
        borderRadius="lg"
        p={6}
        direction="column"
        align="center"
        justify="center"
        h="300px"
        w={'100%'}
      >
        <Badge colorScheme="purple" p={2} borderRadius="full">
          <HStack>
            <InfoIcon />
            <Text>Hidden</Text>
          </HStack>
        </Badge>
      </Flex>
    )
  }

  return (
    <Box borderRadius="lg" p={6} boxShadow="xl" w={'100%'}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl" fontWeight="bold" color="gray.100">
          Solved Quizzes
        </Text>
        {loginedUserProfile && (
          <Tooltip label="Visibility to others" placement="top">
            <Badge colorScheme={privateSolvedQuiz ? 'red' : 'green'}>
              {privateSolvedQuiz ? 'HIDDEN' : 'VISIBLE'}
            </Badge>
          </Tooltip>
        )}
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {showHistory && (
            <Suspense fallback={<Spinner />}>
              <SolvedQuizHistory
                solvedHistory={history}
                setShowHistory={setShowHistory}
              />
            </Suspense>
          )}
          <HStack spacing={6}>
            <Circle size="150px" bg="gray.700" position="relative">
              <AwardIcon
                boxSize={10}
                color="yellow.400"
                position="absolute"
                top={2}
              />
              <VStack spacing={0}>
                <Text fontSize="4xl" fontWeight="bold" color="gray.100">
                  {solvedQuizzesCount}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Solved
                </Text>
              </VStack>
            </Circle>

            <VStack spacing={4} w="full">
              <QuizCategory
                title="Easy"
                count={easySolved.easyQuizzesCount}
                percentage={Math.round(easySolved.easyBeatsPercentage)}
                color="green"
              />
              <QuizCategory
                title="Medium"
                count={mediumSolved.mediumQuizzesCount}
                percentage={Math.round(mediumSolved.medBeatsPercentage)}
                color="yellow"
              />
              <QuizCategory
                title="Hard"
                count={hardSolved.hardQuizzesCount}
                percentage={Math.round(hardSolved.hardBeatsPercentage)}
                color="red"
              />
            </VStack>
          </HStack>
          <Button
            leftIcon={<ClockIcon boxSize={5} />}
            colorScheme="blue"
            variant="outline"
            w="full"
            onClick={() => setShowHistory(true)}
            isDisabled={isDisabled}
            mt={6}
          >
            View History
          </Button>
        </MotionBox>
      )}
    </Box>
  )
}

export default SolvedQuizzes
