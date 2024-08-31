import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChakraProvider,
  extendTheme,
  Box,
  Text,
  Button,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Progress,
  Spinner,
} from '@chakra-ui/react'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import {
  DIFF_COLOR,
  ICONS_ARTICLE_DIFFICULTY,
} from '../../../models/articleDifficulty'
import { useTranslation } from 'react-i18next'

// Lazy load components and assets
const Line = lazy(() =>
  import('react-chartjs-2').then(module => ({ default: module.Line })),
)
const ArrowRightSVG = lazy(() => import('../../../assets/svg/ArrowRightSVG'))

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'transparent',
        color: 'gray.100',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'full',
      },
      variants: {
        solid: {
          bg: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          _hover: {
            bg: 'rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    Progress: {
      baseStyle: {
        filledTrack: {
          bg: 'purple.400',
        },
      },
    },
  },
})

const getReviewText = (field, value, t) => {
  const reviews = {
    score: {
      0: t('needsImprovement'),
      20: t('belowAverage'),
      40: t('average'),
      60: t('goodJob'),
      80: t('greatWork'),
      100: t('excellent'),
    },
    timeTaken: {
      slow: t('tooSlow'),
      average: t('decentSpeed'),
      fast: t('veryQuick'),
    },
    difficulty: {
      Easy: t('keepPracticing'),
      Medium: t('wellDone'),
      Hard: t('impressive'),
    },
    rqmscore: {
      low: t('keepGoing'),
      medium: t('tryHarder'),
      high: t('outstanding'),
    },
  }

  if (field === 'score') {
    const scorePercentage = (value[0] / value[1]) * 100
    const reviewKeys = Object.keys(reviews.score)
      .map(Number)
      .sort((a, b) => a - b)
    for (let i = 0; i < reviewKeys.length; i++) {
      if (scorePercentage <= reviewKeys[i]) {
        return reviews.score[reviewKeys[i]]
      }
    }
  }

  if (field === 'timeTaken') {
    if (value >= 33 && value <= 50) return reviews.timeTaken.slow
    if (value <= 16 && value > 33) return reviews.timeTaken.average
    if (value >= 0 && value < 16) return reviews.timeTaken.fast
  }

  if (field === 'difficulty') {
    return reviews.difficulty[value] || ''
  }

  if (field === 'rqmscore') {
    if (value < 45) return reviews.rqmscore.low
    if (value >= 45 && value < 75) return reviews.rqmscore.medium
    return reviews.rqmscore.high
  }
}

const SubmittedQuizInterface = ({
  submitLoad = false,
  result,
  onViewReport,
}) => {
  const { t } = useTranslation('SubmittedQuizInterface')
  const [scoreArr, setScoreArr] = useState([0, 1])
  const [quizData, setQuizData] = useState([])
  const [labels, setLabels] = useState([])
  const quizNum = t('quiz')

  useEffect(() => {
    if (result?.score && result?.score.includes('/')) {
      setScoreArr(() => {
        const arr = result?.score.split('/')
        return [parseInt(arr[0]), parseInt(arr[1])]
      })
    }
    if (result.pastRQMs && result.pastRQMs.length > 0) {
      setQuizData(result.pastRQMs)
      setLabels(() => {
        const labels = Array.from(
          { length: result.pastRQMs.length - 1 },
          (_, i) => `${quizNum} ${i + 1}`,
        )
        labels.push(t('currentQuiz'))
        return labels
      })
    }
  }, [submitLoad, result?.score, result?.pastRQMs])

  const chartData = useMemo(
    () => ({
      labels: labels,
      datasets: [
        {
          label: t('rqmScore'),
          data: quizData,
          fill: false,
          backgroundColor: 'rgba(138, 43, 226, 0.6)',
          borderColor: 'rgba(138, 43, 226, 1)',
          pointStyle: 'circle',
          pointRadius: 5,
          pointBorderColor: '#8A2BE2',
          pointBorderWidth: 2,
          tension: 0.1,
        },
      ],
    }),
    [labels, quizData],
  )

  const chartOptions = useMemo(
    () => ({
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: {
              weight: 'bold',
            },
          },
        },
        x: {
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: {
              weight: 'bold',
            },
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: {
              weight: 'bold',
            },
          },
        },
      },
    }),
    [],
  )

  const handleViewReport = useCallback(() => {
    onViewReport()
  }, [onViewReport])

  const DifficultyIcon = result?.articleDifficulty
    ? ICONS_ARTICLE_DIFFICULTY[result?.articleDifficulty]
    : null
  const diffColor = result?.articleDifficulty
    ? DIFF_COLOR[result?.articleDifficulty]
    : null

  return (
    <ChakraProvider>
      <Box
        className="SubmittedQuizInterface"
        w={'100%'}
        margin="0 auto"
        padding={{ base: '10px', md: '20px', lg: '30px', xl: '40px' }}
        h={'100%'}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        borderRadius="xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Text fontSize="2xl" fontWeight="bold" mb={6} color="purple.200">
              {t('quizCompleted')}
            </Text>

            {submitLoad ? (
              <Text color="gray.100" fontSize="xl" textAlign="center" mb={4}>
                {t('calculating')}
              </Text>
            ) : (
              <>
                <StatGroup
                  border={{ base: '1px solid white', md: 'none' }}
                  borderRadius={'xl'}
                  color={'white'}
                >
                  <Flex w={'100%'}>
                    <Flex
                      justifyContent={'space-between'}
                      w={'100%'}
                      flexDirection={{ base: 'column', md: 'row' }}
                    >
                      <Stat
                        borderBottom={{ base: '1px solid white', md: 'none' }}
                      >
                        <StatLabel textAlign={'center'} mt={5}>
                          {t('score')}
                        </StatLabel>
                        <StatNumber textAlign={'center'}>
                          {result?.score}
                        </StatNumber>
                        <StatHelpText textAlign={'center'}>
                          {getReviewText(
                            'score',
                            (scoreArr[0] / scoreArr[1]) * 100,
                            t,
                          )}
                        </StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel textAlign={'center'} mt={5}>
                          {t('timeTaken')}
                        </StatLabel>
                        <StatNumber textAlign={'center'}>
                          {result?.timeTaken} {t('seconds')}
                        </StatNumber>
                        <StatHelpText textAlign={'center'}>
                          {getReviewText('timeTaken', result?.timeTaken, t)}
                        </StatHelpText>
                      </Stat>
                    </Flex>

                    <Flex
                      border={{ base: '1px solid white', md: 'none' }}
                      display={{ base: 'black', md: 'none' }}
                      width={'0%'}
                    />
                    <Flex
                      justifyContent={'space-between'}
                      w={'100%'}
                      flexDirection={{ base: 'column', md: 'row' }}
                    >
                      <Stat
                        borderBottom={{ base: '1px solid white', md: 'none' }}
                      >
                        <StatLabel textAlign={'center'} mt={5}>
                          {t('articleDifficulty')}
                        </StatLabel>
                        <StatNumber
                          textAlign={'center'}
                          display={'flex'}
                          w={'100%'}
                        >
                          <Flex
                            color={diffColor}
                            w={'100%'}
                            justifyContent={'center'}
                            alignItems={'center'}
                            position={'relative'}
                          >
                            {result?.articleDifficulty === 'easy'
                              ? t('easy')
                              : result?.articleDifficulty === 'medium'
                              ? t('medium')
                              : t('hard')}
                          </Flex>
                          <Box
                            color={diffColor}
                            position={'absolute'}
                            right={'20%'}
                            top={'48%'}
                          >
                            <DifficultyIcon />
                          </Box>
                        </StatNumber>
                        <StatHelpText textAlign={'center'}>
                          {getReviewText(
                            'difficulty',
                            result?.articleDifficulty,
                            t,
                          )}
                        </StatHelpText>
                      </Stat>

                      <Stat>
                        <StatLabel textAlign={'center'} mt={5}>
                          {t('rqmScore')}
                        </StatLabel>
                        <StatNumber textAlign={'center'}>
                          {result?.RQM_score}
                        </StatNumber>
                        <StatHelpText textAlign={'center'}>
                          {getReviewText('rqmscore', result?.RQM_score, t)}
                        </StatHelpText>
                      </Stat>
                    </Flex>
                  </Flex>
                </StatGroup>

                <Box mb={8} mt={{ base: 10, md: 4 }}>
                  <Text color="gray.300" fontSize="lg" mb={2}>
                    {t('rqmScoreLevel')}
                  </Text>
                  <Progress
                    value={result?.RQM_score}
                    min={0}
                    max={105}
                    size="md"
                    colorScheme="purple"
                    borderRadius="full"
                  />
                  <Flex justifyContent="space-between" mt={1}>
                    <Flex
                      w={'100%'}
                      justifyContent={'center'}
                      color="gray.400"
                      fontSize="xs"
                    >
                      {t('rookie')}
                    </Flex>
                    <Flex
                      w={'100%'}
                      justifyContent={'center'}
                      color="gray.400"
                      fontSize="xs"
                    >
                      {t('amateur')}
                    </Flex>
                    <Flex
                      w={'100%'}
                      justifyContent={'center'}
                      color="gray.400"
                      fontSize="xs"
                    >
                      {t('advanced')}
                    </Flex>
                    <Flex
                      w={'100%'}
                      justifyContent={'center'}
                      color="gray.400"
                      fontSize="xs"
                    >
                      {t('expert')}
                    </Flex>
                    <Flex
                      w={'100%'}
                      justifyContent={'center'}
                      color="gray.400"
                      fontSize="xs"
                    >
                      {t('maestro')}
                    </Flex>
                  </Flex>
                </Box>

                {result.pastRQMs && (
                  <Box mb={8}>
                    <Text
                      color="gray.300"
                      fontSize="xl"
                      fontWeight="bold"
                      mb={4}
                      textAlign={'center'}
                    >
                      {t('todaysRqmUpdate')}
                    </Text>
                    <Suspense
                      fallback={
                        <Text color="gray.300">{t('loadingChart')}</Text>
                      }
                    >
                      <Box
                        display={'flex'}
                        w={'100%'}
                        justifyContent={'center'}
                      >
                        <Line data={chartData} options={chartOptions} />
                      </Box>
                    </Suspense>
                  </Box>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Suspense fallback={<Spinner />}>
                    <Button
                      rightIcon={
                        <ArrowRightSVG
                          width={'20px'}
                          height={'20px'}
                          fill={'#fff'}
                        />
                      }
                      onClick={handleViewReport}
                      size="lg"
                      width="100%"
                      bg="purple.500"
                      _hover={{
                        bg: 'purple.600',
                      }}
                    >
                      {t('viewQuizSummary')}
                    </Button>
                  </Suspense>
                </motion.div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </ChakraProvider>
  )
}

export default SubmittedQuizInterface
