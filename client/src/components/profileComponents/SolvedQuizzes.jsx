import React, { useState, lazy, Suspense, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  Progress,
  VStack,
  HStack,
  Spinner,
  Badge,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import ProfileButton from './ProfileButton'
import { useSelector } from 'react-redux'
import StarIcon from '../../assets/svg/StarIcon'
import LightbulbIcon from '../../assets/svg/LightbulbIcon'
import SkullIcon from '../../assets/svg/SkullIcon'
import ClockSVG from '../../assets/svg/ClockSVG'

const MotionBox = motion(Box)

// Lazy load the SolvedQuizHistory component
const SolvedQuizHistory = lazy(() =>
  import('./SolvedQuizSubComponents/SolvedQuizHistory'),
)

const DifficultyBar = ({ difficulty, count, beats, color, icon: Icon }) => (
  <HStack spacing={4} w="full" align="center">
    <Box color={color}>
      <Icon />
    </Box>
    <Box flex={1}>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="sm" fontWeight="medium" color="gray.200">
          {difficulty}
        </Text>
        <Text fontSize="sm" color="gray.400">
          {count} Solved
        </Text>
      </Flex>
      <Progress
        value={beats}
        size="xs"
        colorScheme={color}
        borderRadius="full"
      />
      <Text fontSize="xs" color="gray.400" textAlign="right" mt={1}>
        Beats {beats}%
      </Text>
    </Box>
  </HStack>
)

const SolvedQuizzes = ({
  solvedQuizzes,
  privateSolvedQuiz,
  isDisabled = false,
  loginedUserProfile,
  inGameName,
}) => {
  const { user } = useSelector(state => state.auth)
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Memoize solved quizzes data
  const { solvedQuizzesCount, easy, medium, hard } = useMemo(() => {
    return {
      solvedQuizzesCount: solvedQuizzes.solvedQuizzesCount || 0,
      easy: solvedQuizzes.easy || {
        easyQuizzesCount: 0,
        easyBeatsPercentage: 0,
      },
      medium: solvedQuizzes.medium || {
        mediumQuizzesCount: 0,
        medBeatsPercentage: 0,
      },
      hard: solvedQuizzes.hard || {
        hardQuizzesCount: 0,
        hardBeatsPercentage: 0,
      },
    }
  }, [solvedQuizzes])

  if (privateSolvedQuiz) {
    return (
      <Flex
        h={'100%'}
        w={'100%'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Text
          backgroundColor="#0f0d15"
          m={0}
          top={0}
          right={10}
          color={'#9CAFAA'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          w={'60px'}
          height={'30px'}
        >
          Hidden
        </Text>
      </Flex>
    )
  }

  return (
    <Box borderRadius="lg" p={4} boxShadow="xl" w={'100%'}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="bold" color="gray.100">
          Solved Quizzes
        </Text>
        <Tooltip label="Visibility to others">
          {loginedUserProfile && (
            <Badge colorScheme="green">
              {user.profilePrivacy.solvedQuizzes ? 'HIDDEN' : 'VISIBLE'}
            </Badge>
          )}
        </Tooltip>
      </Flex>
      {isLoading ? (
        <Flex justify="center" align="center" h="150px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HStack align="stretch" spacing={4}>
            <Flex direction="column" align="flex-start">
              <Text color="gray.400" fontSize="sm">
                Total Solved Quizzes
              </Text>
              <Text
                fontSize="4xl"
                fontWeight="bold"
                color="blue.400"
                lineHeight="1"
              >
                {solvedQuizzesCount}
              </Text>
              <Text color="gray.500" fontSize="xs">
                Keep it up!
              </Text>
            </Flex>
            <VStack spacing={4} align="stretch" flex={1}>
              <DifficultyBar
                difficulty="Easy"
                count={easy.easyQuizzesCount || 0}
                beats={Math.round(easy.easyBeatsPercentage || 0)}
                color="green"
                icon={LightbulbIcon}
              />
              <DifficultyBar
                difficulty="Medium"
                count={medium.mediumQuizzesCount || 0}
                beats={Math.round(medium.medBeatsPercentage || 0)}
                color="yellow"
                icon={StarIcon}
              />
              <DifficultyBar
                difficulty="Hard"
                count={hard.hardQuizzesCount || 0}
                beats={Math.round(hard.hardBeatsPercentage || 0)}
                color="red"
                icon={SkullIcon}
              />
            </VStack>
          </HStack>
          <ProfileButton
            icon={<ClockSVG width={'20px'} height={'20px'} stroke={'#fff'} />}
            variant="outline"
            colorScheme="blue"
            size="sm"
            w="full"
            mt={4}
            onClick={() => setShowHistory(true)}
            isDisabled={isDisabled}
            buttonText={'View History'}
            notShowVisibility={true}
          />
        </MotionBox>
      )}
      {showHistory && (
        <Suspense fallback={null}>
          <SolvedQuizHistory
            // solvedHistory={history}
            setShowHistory={setShowHistory}
            inGameName={inGameName}
          />
        </Suspense>
      )}
    </Box>
  )
}

export default SolvedQuizzes
