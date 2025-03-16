import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Flex,
  Spinner,
  useToast,
  Heading,
  useBreakpointValue,
  Button,
  Icon,
} from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import UserCard from '../components/leaderBoardComponents/UserCard'
import SearchBar from '../components/leaderBoardComponents/SearchBar'
import LeaderboardRow from '../components/leaderBoardComponents/LeaderBoardRow'
import InfoButton, {
  InfoButtonProvider,
} from '../components/miscellaneous/InfoButton'
import RefreshTimer from '../components/leaderBoardComponents/RefreshTimer'
import { useInView } from 'react-intersection-observer'
import CircleAndSocietyData from '../assets/CircleAndSocietyData'
// import FebruaryRewardsPromo from '../components/leaderBoardComponents/FebruaryRewardsPromo'

const INITIAL_RENDER_COUNT = 500
const RENDER_BATCH_SIZE = 500
const RENDER_INTERVAL = 100 // ms

const Leaderboard = () => {
  const { t } = useTranslation('LeaderBoard')
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const toast = useToast()
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: false })
  const { ref: firstLeaderboardRowRef, inView: firstLeaderboardRowInView } =
    useInView({ threshold: 0, triggerOnce: false })

  const [leaders, setLeaders] = useState([])
  const [initialTime, setInitialTime] = useState({})
  const [searchResults, setSearchResults] = useState([])
  const [searchLoad, setSearchLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialRenderComplete, setIsInitialRenderComplete] = useState(false)
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false)
  const textColor = useColorModeValue('gray.100', 'gray.200')
  const accentColor = 'pink.400'

  const renderIndexRef = useRef(INITIAL_RENDER_COUNT)
  const allLeadersRef = useRef([])
  const renderTimeoutRef = useRef(null)

  // Responsive values for row height and gap
  const ROW_HEIGHT = useBreakpointValue({ base: 140, md: 120, lg: 100 })
  const ROW_GAP = useBreakpointValue({ base: 8, md: 12, lg: 16 })
  const scrollbarHiddenStyle = {
    '::WebkitScrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  }

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/leaderboard?limit=500')
      allLeadersRef.current = response.data.users
      setLeaders(response.data.users.slice(0, INITIAL_RENDER_COUNT))
      setInitialTime(response.data.nextRefresh)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast({
        title: t('toastErrorTitle'),
        description: t('toastErrorDescription'),
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, t])

  useEffect(() => {
    fetchLeaderboard()
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoading && allLeadersRef.current.length > INITIAL_RENDER_COUNT) {
      const renderNextBatch = () => {
        if (renderIndexRef.current < allLeadersRef.current.length) {
          setLeaders(prevLeaders => [
            ...prevLeaders,
            ...allLeadersRef.current.slice(
              renderIndexRef.current,
              renderIndexRef.current + RENDER_BATCH_SIZE,
            ),
          ])
          renderIndexRef.current += RENDER_BATCH_SIZE
          renderTimeoutRef.current = setTimeout(
            renderNextBatch,
            RENDER_INTERVAL,
          )
        } else {
          setIsInitialRenderComplete(true)
        }
      }
      renderTimeoutRef.current = setTimeout(renderNextBatch, RENDER_INTERVAL)
    } else if (
      !isLoading &&
      allLeadersRef.current.length <= INITIAL_RENDER_COUNT
    ) {
      setIsInitialRenderComplete(true)
    }
  }, [isLoading])

  useEffect(() => {
    const body = document.querySelector('body')
    if (firstLeaderboardRowInView) body.style.overflow = 'auto'
    else if (!inView && !firstLeaderboardRowInView)
      body.style.overflow = 'hidden'
    else body.style.overflow = 'auto'

    return () => {
      body.style.overflow = 'auto'
    }
  }, [inView, firstLeaderboardRowInView])

  const handleRowClick = useCallback(
    inGameName => {
      navigate(`/profile/${inGameName}`)
    },
    [navigate],
  )

  const Row = useCallback(
    ({ index, style }) => {
      const leader = (searchResults.length > 0 ? searchResults : leaders)[index]
      return (
        <Box
          style={{
            ...style,
            height: `${ROW_HEIGHT - ROW_GAP}px`,
          }}
          ref={index === 0 ? firstLeaderboardRowRef : null}
        >
          <LeaderboardRow
            user={leader}
            rank={index + 1}
            isCurrentUser={leader._id === user?._id}
            onClick={() => {
              if (user.needsOnboarding) return
              handleRowClick(leader.inGameName)
            }}
          />
        </Box>
      )
    },
    [searchResults, leaders, user, handleRowClick, ROW_HEIGHT, ROW_GAP],
  )

  const itemCount =
    searchResults.length > 0 ? searchResults.length : leaders.length

  const getStructuredData = useMemo(() => {
    const topLeaders = leaders.slice(0, 10).map((leader, index) => {
      const society = CircleAndSocietyData.find(
        item =>
          item.IQ_Lower <= leader.IQ_score &&
          (item.IQ_Upper === null || item.IQ_Upper > leader.IQ_score),
      )

      return {
        '@type': 'Person',
        name: leader.inGameName,
        identifier: {
          '@type': 'PropertyValue',
          propertyID: 'IQ_Score',
          value: leader.IQ_score,
        },
        member: {
          '@type': 'Organization',
          name: society?.society || 'Explorer Society',
        },
      }
    })

    return {
      '@context': 'https://schema.org',
      '@type': 'Table',
      about: {
        '@type': 'CreativeWork',
        name: 'Rapid Recap Global Rankings',
        description:
          'Real-time leaderboard showing top performers in AI-powered GK quizzes and knowledge tournaments',
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: leaders.length,
        itemListElement: topLeaders,
      },
      significantLinks: [
        {
          '@type': 'WebPage',
          name: 'Tournament',
          url: 'https://rapidrecap.ai/tournament',
        },
        {
          '@type': 'WebPage',
          name: 'Hall of Champions',
          url: 'https://rapidrecap.ai/hall-of-champions',
        },
      ],
      provider: {
        '@type': 'Organization',
        name: 'Rapid Recap',
        url: 'https://rapidrecap.ai',
        logo: {
          '@type': 'ImageObject',
          url: 'https://rapidrecap.ai/images/rrlogo_512.png',
        },
      },
      dataset: {
        '@type': 'Dataset',
        name: 'Rapid Recap Performance Metrics',
        description:
          'Comprehensive rankings based on Information Quotient (IQ) scores and quiz performance',
        creator: {
          '@type': 'Organization',
          name: 'Rapid Recap',
        },
        temporalCoverage: 'Real-time updates',
        includedInDataCatalog: {
          '@type': 'DataCatalog',
          name: 'GK Performance Rankings',
        },
        measurementTechnique: [
          'Information Quotient (IQ) Score System',
          'Tournament Performance',
          'Quiz Completion Rate',
          'Knowledge Society Progress',
        ],
      },
    }
  }, [leaders])

  return (
    <Box
      p={{ base: 4, md: 8 }}
      mt={{
        base: user?.needsOnboarding ? '18%' : '16%',
        md: user?.needsOnboarding ? '6.5%' : '5.5%',
        lg: user?.needsOnboarding ? '4.5%' : '3.5%',
      }}
      w={'100%'}
    >
      <Helmet>
        <title>{t('helmet.title')}</title>
        <meta name="description" content={t('helmet.metaDescription')} />
        <meta name="keywords" content={t('helmet.metaKeywords')} />
        <link rel="canonical" href="https://rapidrecap.com/leaderboard" />
        <meta property="og:title" content={t('helmet.metaOgTitle')} />
        <meta
          property="og:description"
          content={t('helmet.metaOgDescription')}
        />
        <meta property="og:url" content={t('helmet.metaOgUrl')} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(getStructuredData)}
        </script>
      </Helmet>
      <VStack
        spacing={{ base: 4, md: 6, lg: 8 }}
        align="stretch"
        maxW="1200px"
        mx="auto"
      >
        <Flex width={'100%'} direction="column" alignItems={'center'} gap={2}>
          <Flex
            width={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
            position="relative"
          >
            <Flex
              justifyContent={'center'}
              alignItems={'center'}
              flexDirection={'column'}
            >
              <Heading
                as="h1"
                fontSize={{ base: 'xl', md: '2xl', lg: '4xl' }}
                fontWeight="bold"
                color={textColor}
                letterSpacing="wide"
                textAlign="center"
              >
                {t('title')}
              </Heading>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                fontWeight="semibold"
                color={accentColor}
                textAlign="center"
              >
                SEASON 2
              </Text>
            </Flex>
            <Box
              position="absolute"
              right={{ base: 12, md: 440 }}
              top={{ base: -1, md: 9 }}
            >
              <InfoButtonProvider>
                <InfoButton
                  id="leaderboardCacheInfo"
                  text={t('infoForLeaderboard')}
                />
              </InfoButtonProvider>
            </Box>
          </Flex>

          {/* <Button
            leftIcon={<Icon as={StarIcon} color="yellow.400" />}
            bg="yellow.500"
            color="gray.900"
            _hover={{ bg: 'yellow.300' }}
            variant="solid"
            onClick={() => setIsRewardsModalOpen(true)}
            size={{ base: 'sm', md: 'md' }}
            fontWeight="bold"
            animation="pulse 2s infinite"
          >
            <Text textAlign="center">Win Cash Prizes</Text>
          </Button> */}
        </Flex>

        <Box ref={ref}>
          <RefreshTimer initialTime={initialTime} />
        </Box>

        <Flex justifyContent="center">
          <Box
            w={{ base: '100%', md: '75%', lg: '60%' }}
            maxW="600px"
            position="relative"
          >
            <SearchBar
              setSearchResults={setSearchResults}
              setSearchLoad={setSearchLoad}
              w="100%"
            />
          </Box>
        </Flex>

        <UserCard user={user} t={t} />

        <Box
          height={{ base: 'calc(100vh - 150px)', md: 'calc(100vh - 190px)' }}
        >
          {isLoading || !isInitialRenderComplete || searchLoad ? (
            <Flex justify="center" my={4}>
              <Spinner size="xl" color={accentColor} />
            </Flex>
          ) : (
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={itemCount}
                  itemSize={ROW_HEIGHT}
                  width={width}
                  itemData={searchResults.length > 0 ? searchResults : leaders}
                  overscanCount={5}
                  style={{
                    ...scrollbarHiddenStyle,
                  }}
                  className="leaderboard-list"
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          )}
        </Box>

        {/* <FebruaryRewardsPromo
          isOpen={isRewardsModalOpen}
          onClose={() => setIsRewardsModalOpen(false)}
        /> */}
      </VStack>
    </Box>
  )
}

export default React.memo(Leaderboard)
