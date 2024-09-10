import React, { useState, useEffect, useCallback } from 'react'
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
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'

// Dynamic imports for code splitting
const SearchBar = React.lazy(() =>
  import('../components/leaderBoardComponents/SearchBar'),
)
const LeaderBoardTable = React.lazy(() =>
  import('../components/leaderBoardComponents/LeaderBoardTable'),
)

import medalIcon from '../assets/medal.webp'
import { Helmet } from 'react-helmet'

const LeaderBoard = () => {
  const { t } = useTranslation('LeaderBoard')
  const PAGE_LIMIT = 20
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const toast = useToast()
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  })

  // State hooks
  const [isLoading, setIsLoading] = useState(true)
  const [searchLoad, setSearchLoad] = useState(false)
  const [leaders, setLeaders] = useState([])
  const [searchResults, setSearchResults] = useState([])

  const [isBaseScreen] = useMediaQuery('(max-width: 768px)')

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchLeaderBoard = useCallback(
    async (society = '') => {
      if (!hasMore) {
        setIsLoading(false)
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
    },
    [hasMore, PAGE_LIMIT, toast, t, inView],
  )

  useEffect(() => {
    document.title = t('helmet.title')
    fetchLeaderBoard()
  }, [])
  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      fetchLeaderBoard()
    }
  }, [inView, isLoading, hasMore])

  const handleLoadMore = useCallback(() => {
    // if (hasMore) {
    //   setPage(prevPage => prevPage + 1)
    // }
  }, [hasMore])

  return (
    <>
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
        <meta property="og:type" content={t('helmet.metaOgType')} />
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
                padding={'10px'}
              >
                {t('title')}
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
              {t('tag')}
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
                  w={isBaseScreen ? '75%' : '50%'}
                />
              </Flex>

              <Box
                height="calc(100vh - 300px)"
                overflowY="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: useColorModeValue('purple.500', 'purple.300'),
                    borderRadius: '24px',
                  },
                }}
              >
                <LeaderBoardTable
                  leaders={leaders}
                  ref={ref}
                  searchResults={searchResults}
                  searchLoad={searchLoad}
                  currUserChar={user}
                  navigate={navigate}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                  isLoading={isLoading}
                  PAGE_LIMIT={PAGE_LIMIT}
                />
              </Box>
            </React.Suspense>
          </VStack>
        </Flex>
      </Flex>
    </>
  )
}

export default LeaderBoard
