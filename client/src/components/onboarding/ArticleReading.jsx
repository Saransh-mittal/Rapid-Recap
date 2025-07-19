import React, { useCallback, useEffect } from 'react'
import {
  Box,
  VStack,
  Flex,
  useBreakpointValue,
  Button,
  HStack,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import OnboardingArticleHeader from './OnboardingArticleHeader'
import MajesticLoading from './MajesticLoading'
import { useTranslation } from 'react-i18next'
import MainArticleContent from '../articleComponents/MainArticleContent'
import GameHubButton from '../articleComponents/GameHubButton'
import QuizSkeletonWrapper from '../articleComponents/loaders/QuizSkeletonWrapper'
import GivenQuiz from '../articleComponents/GivenQuiz'
import { useSelector } from 'react-redux'
import axios from 'axios'

const MotionBox = motion(Box)

const ArticleReading = ({
  onNext,
  article,
  isArticleFetching,
  fetchOnBoardingArticle,
}) => {
  const { t } = useTranslation('OnboardingProcess')
  const articleRef = React.useRef()
  const padding = useBreakpointValue({ base: 4, md: 8 })
  const maxWidth = useBreakpointValue({ base: '100%', md: '800px' })
  const fontSize = useBreakpointValue({ base: 'md', md: 'lg' })
  const [givenQuiz, setGivenQuiz] = React.useState(null)
  const [isQuizGivenLoading, setIsQuizGivenLoading] = React.useState(false)
  const [percentile, setPercentile] = React.useState(null)
  const [RQM_score, setRQM_score] = React.useState(null)
  const [onGoingQuiz, setOnGoingQuiz] = React.useState(false)
  const { user, loginCheckStatus } = useSelector(state => state.auth)
  const id = article?._id || article?.id

  const isQuizGiven = useCallback(async () => {
    const userId = user?._id
    if ((!userId || !id) && loginCheckStatus === 'fulfilled') {
      setGivenQuiz(false)
      setIsQuizGivenLoading(false)
      return
    }
    setIsQuizGivenLoading(true)
    try {
      // Use the new GameHub endpoint that checks for any game type completion
      const response = await axios.get(
        `/api/gamehub/completion/${id}/${userId}`,
      )
      console.log('Game completion response:', response.data)

      if (response.data.hasPlayed) {
        setPercentile(response.data.percentile)
        setRQM_score(response.data.bestScore)
        setGivenQuiz(response.data) // Store the full response for more detailed info
        console.log(
          `User has played ${
            response.data.gamesPlayed.length
          } game(s): ${response.data.gamesPlayed.join(', ')}`,
        )
        console.log(
          `Best score: ${response.data.bestScore} from ${response.data.bestGameType}`,
        )
      } else {
        setGivenQuiz(false)
      }
    } catch (error) {
      console.log('Error checking game completion:', error.message)
      setGivenQuiz(false)
    } finally {
      setIsQuizGivenLoading(false)
    }
  }, [id, user, loginCheckStatus])

  const checkOnGoingQuiz = useCallback(async () => {
    try {
      const response = await axios.get(`/api/articles/quizStatus/${id}`)
      setOnGoingQuiz(response.data.status)
    } catch (error) {
      console.log(error.message)
      setOnGoingQuiz(false)
    } finally {
      localStorage.setItem('isQuizGivenCalled', true)
    }
  }, [id])

  useEffect(() => {
    if (article === null && !isArticleFetching) fetchOnBoardingArticle()
  }, [])

  useEffect(() => {
    if (article) {
      isQuizGiven()
      checkOnGoingQuiz()
    }
  }, [id, user?._id])

  if (isArticleFetching) {
    return (
      <Box
        maxH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        w="100%"
        h="100vh"
      >
        <MajesticLoading />
      </Box>
    )
  }

  return (
    <Box
      maxH="90vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      w="100%"
    >
      <Box w="95%" maxW={maxWidth} mt={{ base: '0.5rem', md: '1.5rem' }}>
        <OnboardingArticleHeader
          title={article?.title}
          author={article?.author}
          readTime={article?.avgReadTime}
          t={t}
        />
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          bg="rgba(26, 21, 39, 0.8)"
          p={padding}
          borderBottomRadius="xl"
          width="100%"
          overflowY="auto"
        >
          <VStack spacing={6} align="stretch">
            <MainArticleContent
              imgURL={article?.image}
              mainText={article?.mainText}
              articleRef={articleRef}
              articleLoading={isArticleFetching}
              themedContent={''}
              dictionary={article?.dictionary}
              importantSentences={article?.importantSentences}
            />
            <Flex justifyContent="center" mt={4}>
              {isQuizGivenLoading ? (
                <QuizSkeletonWrapper />
              ) : givenQuiz ? (
                <VStack spacing={4} align="center" w={'100%'}>
                  <GivenQuiz
                    onBoarding={true}
                    articleId={article?._id}
                    percentile={percentile}
                    RQM_score={RQM_score}
                    gameData={givenQuiz} // Pass the full game data object
                  />
                  <Button
                    onClick={onNext}
                    size="lg"
                    height="56px"
                    px={8}
                    bgGradient="linear(135deg, #8B5CF6, #A855F7, #C084FC)"
                    color="white"
                    borderRadius="xl"
                    fontSize="lg"
                    fontWeight="bold"
                    boxShadow="0 8px 32px rgba(139, 92, 246, 0.4)"
                    border="1px solid"
                    borderColor="rgba(168, 85, 247, 0.3)"
                    _hover={{
                      bgGradient: 'linear(135deg, #7C3AED, #8B5CF6, #A855F7)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(139, 92, 246, 0.6)',
                      borderColor: 'rgba(168, 85, 247, 0.5)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                      boxShadow: '0 6px 24px rgba(139, 92, 246, 0.4)',
                    }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    }}
                    _hover_before={{
                      left: '100%',
                    }}
                  >
                    <HStack spacing={2}>
                      <Text>Continue Journey</Text>
                      <Box
                        as="span"
                        fontSize="lg"
                        animation="bounce 1s infinite"
                        sx={{
                          '@keyframes bounce': {
                            '0%, 20%, 50%, 80%, 100%': {
                              transform: 'translateY(0)',
                            },
                            '40%': {
                              transform: 'translateY(-4px)',
                            },
                            '60%': {
                              transform: 'translateY(-2px)',
                            },
                          },
                        }}
                      >
                        🚀
                      </Box>
                    </HStack>
                  </Button>
                </VStack>
              ) : onGoingQuiz ? (
                <Heading
                  size="md"
                  margin={'5px'}
                  mb={5}
                  height={'100px'}
                  color={'red'}
                >
                  {t('quizAlreadyOngoing')}
                </Heading>
              ) : (
                <Box position={'relative'}>
                  <Box
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    {/* NEW: Use GameHub button instead of TakeQuizButton */}
                    <GameHubButton articleId={id} />
                  </Box>
                </Box>
              )}
            </Flex>
          </VStack>
        </MotionBox>
      </Box>
    </Box>
  )
}

export default ArticleReading
