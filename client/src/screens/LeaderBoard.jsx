import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Flex,
  Heading as ChakraHeading,
  Image,
  useMediaQuery,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { useSelector } from 'react-redux'

// Dynamic imports for code splitting
const SearchBar = React.lazy(() =>
  import('../components/leaderBoardComponents/SearchBar'),
)
const SocietyButtons = React.lazy(() =>
  import('../components/leaderBoardComponents/SocietyButtons'),
)
const LeaderBoardTable = React.lazy(() =>
  import('../components/leaderBoardComponents/LeaderBoardTable'),
)
const Heading = React.lazy(() =>
  import('../components/miscellaneous/HeadingComponent'),
)

import { useLeaderBoardTour } from '../customHooks/useTours'
import medalIcon from '../assets/medal.webp'

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
  const { tour, isTutorialTakenCheck } = useLeaderBoardTour()

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

  const handleLoginAlert = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/signin')
      toast({
        title: 'Please Sign In First',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }, [isAuthenticated, navigate, toast])

  const handleSocietyButtonClick = useCallback(
    society => {
      setPage(1)
      if (activeSociety === society) {
        setActiveSociety(null)
        fetchLeaderBoard()
      } else {
        setActiveSociety(society)
        fetchLeaderBoard(society)
      }
    },
    [activeSociety, fetchLeaderBoard],
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
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      user.tutorial.leaderBoardPage
    ) {
      isTutorialTakenCheck({ page: 'leaderBoardPage', tour })
    }
  }, [isLoading, isAuthenticated, user, isTutorialTakenCheck, tour])

  useEffect(() => {
    if (page > 1) {
      fetchLeaderBoard(activeSociety, page)
    }
  }, [page, activeSociety, fetchLeaderBoard])

  return (
    <Flex
      minH={'85vh'}
      justifyContent={'center'}
      className="leaderboard"
      marginTop={'4.5rem'}
    >
      <Flex
        margin={'20px'}
        justifyContent={'center'}
        w={'100%'}
        flexDirection={'column'}
      >
        <Flex alignItems={'center'} justifyContent={'center'}>
          <ChakraHeading>
            <Flex alignItems={'center'} w={'100%'} justifyContent={'center'}>
              <Image
                src={medalIcon}
                alt="Rating"
                width={'35px'}
                height={'35px'}
                bg={'none'}
                mt={'2.5rem'}
              />
              <Heading
                title={'LEADERBOARD'}
                tag={'SEASON 2'}
                tagFontSize={'1.05rem'}
              />
              <Image
                src={medalIcon}
                alt="Rating"
                width={'35px'}
                height={'35px'}
                bg={'none'}
                mt={'2.5rem'}
              />
            </Flex>
          </ChakraHeading>
        </Flex>

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

          <SocietyButtons
            activeSociety={activeSociety}
            handleSocietyButtonClick={handleSocietyButtonClick}
            searchLoad={searchLoad}
            isLoading={isLoading}
          />

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
      </Flex>
    </Flex>
  )
}

export default LeaderBoard
