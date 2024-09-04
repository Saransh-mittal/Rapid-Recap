import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Flex,
  Heading as ChakraHeading,
  Image,
  useMediaQuery,
  useToast,
  Spinner,
  VStack,
  Box,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { useSelector } from 'react-redux'

// Dynamic imports for code splitting
const SearchBar = React.lazy(() =>
  import('../components/leaderBoardComponents/SearchBar'),
)
const LeaderBoardTable = React.lazy(() =>
  import('../components/leaderBoardComponents/LeaderBoardTable'),
)
const Heading = React.lazy(() =>
  import('../components/miscellaneous/HeadingComponent'),
)

import medalIcon from '../assets/medal.webp'
import { Helmet } from 'react-helmet'

const LeaderBoard = () => {
  const PAGE_LIMIT = 20
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const toast = useToast()

  // State hooks
  const [isLoading, setIsLoading] = useState(true)
  const [searchLoad, setSearchLoad] = useState(false)
  const [leaders, setLeaders] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [activeSociety, setActiveSociety] = useState(null)

  // Media query hooks
  const [isLgScreen] = useMediaQuery('(max-width: 1024px)')
  const [isMdScreen] = useMediaQuery('(max-width: 820px)')
  const [isBaseScreen] = useMediaQuery('(max-width: 768px)')

  // Pagination state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadNextPage, setLoadNextPage] = useState(true)

  const fetchLeaderBoard = useCallback(
    async (society = '', page = 1) => {
      if (!hasMore) {
        setIsLoading(false)
        setLoadNextPage(false)
        return
      }
      try {
        const response = await axios.get(
          `/api/user/leaderboard?society=${society}&page=${page}&limit=${PAGE_LIMIT}`,
        )
        const fetchedLeaders = response.data.users
        if (fetchedLeaders.length === 0) {
          setHasMore(false)
          return
        }
        setLeaders(prevLeaders => {
          if (page === 1) return fetchedLeaders
          return [...prevLeaders, ...fetchedLeaders]
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch leaderboard',
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setLoadNextPage(false)
        setIsLoading(false)
      }
    },
    [hasMore, PAGE_LIMIT, toast],
  )

  const handleScroll = useCallback(async () => {
    if (
      window.innerHeight + document.documentElement.scrollTop + 500 >
        document.documentElement.scrollHeight &&
      hasMore
    ) {
      setLoadNextPage(true)
      setPage(prevPage => prevPage + 1)
    }
  }, [hasMore])

  const debouncedHandleScroll = useMemo(
    () => debounce(handleScroll, 300),
    [handleScroll],
  )

  useEffect(() => {
    document.title = 'LeaderBoard Page'
    fetchLeaderBoard()
    window.addEventListener('scroll', debouncedHandleScroll)
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll)
    }
  }, [isAuthenticated, debouncedHandleScroll])

  useEffect(() => {
    if (page > 1) {
      fetchLeaderBoard(activeSociety, page)
    }
  }, [page, activeSociety, fetchLeaderBoard])

  return (
    <>
      <Helmet>
        <title>
          Rapid Recap Leaderboard - Season 2 | Top Information Quotient Scores
        </title>
        <meta
          name="description"
          content="Explore the Rapid Recap Leaderboard for Season 2. See top Information Quotient (IQ) scores, quiz submissions, and rankings across different societies. Join the intellectual elite!"
        />
        <meta
          name="keywords"
          content="Rapid Recap, Leaderboard, Information Quotient, IQ Score, Quiz, News, Societies, Intellectual Circles"
        />
        <link rel="canonical" href="https://rapidrecap.com/leaderboard" />
        <meta
          property="og:title"
          content="Rapid Recap Leaderboard - Season 2"
        />
        <meta
          property="og:description"
          content="Discover top performers in Rapid Recap's Season 2 Leaderboard. Compare IQ scores, quiz submissions, and society rankings."
        />
        <meta property="og:url" content="https://rapidrecap.com/leaderboard" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Flex
        minH={'85vh'}
        justifyContent={'center'}
        className="leaderboard"
        marginTop={'4.5rem'}
      >
        <Flex
          margin={'20px'}
          justifyContent={'center'}
          w={{ base: '100%', md: '75%' }}
          flexDirection={'column'}
        >
          <VStack spacing={8} align="stretch">
            <Flex justifyContent="center" alignItems="center">
              <Image
                src={medalIcon}
                alt="Rating"
                width={'35px'}
                height={'35px'}
                bg={'none'}
              />
              <ChakraHeading
                size="2xl"
                bgGradient="linear(to-r, yellow.400, yellow.600)"
                bgClip="text"
                fontFamily="serif"
              >
                LEADERBOARD
              </ChakraHeading>
              <Image
                src={medalIcon}
                alt="Rating"
                width={'35px'}
                height={'35px'}
                bg={'none'}
              />
            </Flex>

            <Text fontSize="lg" color="gray.500" textAlign="center">
              Season 2
            </Text>

            <React.Suspense fallback={<Spinner />}>
              <Flex
                alignItems="center"
                justifyContent="center"
                marginBottom="20px"
                marginTop={'20px'}
              >
                <SearchBar
                  setSearchResults={setSearchResults}
                  setSearchLoad={setSearchLoad}
                />
              </Flex>

              <LeaderBoardTable
                hasMore={hasMore}
                PAGE_LIMIT={PAGE_LIMIT}
                loadNextPage={loadNextPage}
                leaders={leaders}
                searchResults={searchResults}
                searchLoad={searchLoad}
                isBaseScreen={isBaseScreen}
                isLgScreen={isLgScreen}
                isMdScreen={isMdScreen}
                currUserChar={user}
                navigate={navigate}
                setLoadNextPage={setLoadNextPage}
              />
            </React.Suspense>
          </VStack>
        </Flex>
      </Flex>
    </>
  )
}

export default LeaderBoard
