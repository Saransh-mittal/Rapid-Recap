import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Flex,
  Spinner,
  useToast,
  Heading,
} from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { Helmet } from 'react-helmet'

// Preserve the original UserCard
import UserCard from '../components/leaderBoardComponents/UserCard'
import SearchBar from '../components/leaderBoardComponents/SearchBar'
import LeaderboardRow from '../components/leaderBoardComponents/LeaderBoardRow'

const Leaderboard = () => {
  const { t } = useTranslation('LeaderBoard')
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const toast = useToast()
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [leaders, setLeaders] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchLoad, setSearchLoad] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const textColor = useColorModeValue('gray.100', 'gray.200')
  const accentColor = 'pink.400'

  const fetchLeaderboard = useCallback(async () => {
    if (!hasMore) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const response = await axios.get(
        `/api/user/leaderboard?page=${page}&limit=20`,
      )
      const fetchedLeaders = response.data.users
      if (fetchedLeaders.length === 0) {
        setHasMore(false)
        return
      }
      setLeaders(prevLeaders => [...prevLeaders, ...fetchedLeaders])
      setPage(prevPage => prevPage + 1)
    } catch (error) {
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
  }, [hasMore, page, toast, t])

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      fetchLeaderboard()
    }
  }, [inView, isLoading, hasMore, fetchLeaderboard])

  const handleRowClick = inGameName => {
    navigate(`/profile/${inGameName}`)
  }

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
          overflowY="auto"
          maxH={{ base: 'calc(100vh - 200px)', md: 'calc(100vh - 240px)' }}
          css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          px={{ base: 1, md: 5 }}
        >
          {searchLoad ? (
            <Flex justify="center" my={4}>
              <Spinner size="xl" color={accentColor} />
            </Flex>
          ) : (
            (searchResults.length > 0 ? searchResults : leaders).map(
              (leader, index) => (
                <LeaderboardRow
                  key={leader._id}
                  user={leader}
                  rank={index + 1}
                  isCurrentUser={leader._id === user?._id}
                  onClick={() => handleRowClick(leader.inGameName)}
                />
              ),
            )
          )}
          {isLoading && !searchLoad && (
            <Flex justify="center" my={4}>
              <Spinner size="xl" color={accentColor} />
            </Flex>
          )}
          <Box ref={ref} h="40px" />
        </Box>
      </VStack>
    </Box>
  )
}

export default Leaderboard
