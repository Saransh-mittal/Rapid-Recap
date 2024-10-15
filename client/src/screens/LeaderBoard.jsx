import React, { useState, useEffect, useCallback, useRef } from 'react'
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
} from '@chakra-ui/react'
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

const INITIAL_RENDER_COUNT = 500
const RENDER_BATCH_SIZE = 500
const RENDER_INTERVAL = 100 // ms

const Leaderboard = () => {
  const { t } = useTranslation('LeaderBoard')
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const toast = useToast()

  const [leaders, setLeaders] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchLoad, setSearchLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialRenderComplete, setIsInitialRenderComplete] = useState(false)
  const textColor = useColorModeValue('gray.100', 'gray.200')
  const accentColor = 'pink.400'

  const renderIndexRef = useRef(INITIAL_RENDER_COUNT)
  const allLeadersRef = useRef([])
  const renderTimeoutRef = useRef(null)

  // Responsive values for row height and gap
  const ROW_HEIGHT = useBreakpointValue({ base: 140, md: 120, lg: 100 })
  const ROW_GAP = useBreakpointValue({ base: 8, md: 12, lg: 16 })
  const scrollbarHiddenStyle = {
    '::-webkit-scrollbar': {
      display: 'none',
    },
    'scrollbar-width': 'none',
    '-ms-overflow-style': 'none',
  }
  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/leaderboard?limit=500')
      allLeadersRef.current = response.data.users
      setLeaders(response.data.users.slice(0, INITIAL_RENDER_COUNT))
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
  }, [fetchLeaderboard])

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
        >
          <LeaderboardRow
            user={leader}
            rank={index + 1}
            isCurrentUser={leader._id === user?._id}
            onClick={() => handleRowClick(leader.inGameName)}
          />
        </Box>
      )
    },
    [searchResults, leaders, user, handleRowClick, ROW_HEIGHT, ROW_GAP],
  )

  const itemCount =
    searchResults.length > 0 ? searchResults.length : leaders.length

  return (
    <Box
      minH="100vh"
      p={{ base: 4, md: 8 }}
      mt={{ base: '20%', md: '6.5%', lg: '4.5%' }}
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
      </Helmet>
      <VStack
        spacing={{ base: 4, md: 6, lg: 8 }}
        align="stretch"
        maxW="1200px"
        mx="auto"
      >
        <Box textAlign="center">
          <Heading
            as="h1"
            fontSize={{ base: 'xl', md: '2xl', lg: '4xl' }}
            fontWeight="bold"
            color={textColor}
            letterSpacing="wide"
          >
            {t('title')}
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight="semibold"
            color={accentColor}
          >
            {t('tag')}
          </Text>
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
          height={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 240px)' }}
          overflow="hidden" // Add this line to remove scrollbars
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
                  style={scrollbarHiddenStyle} // Apply scrollbar hiding styles
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          )}
        </Box>
      </VStack>
    </Box>
  )
}

export default React.memo(Leaderboard)
