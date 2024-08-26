import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import {
  Box,
  Flex,
  Skeleton,
  useBreakpointValue,
  useMediaQuery,
} from '@chakra-ui/react'
import { categories } from '../../assets/Categories'
import { useNavigate, useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useDispatch, useSelector } from 'react-redux'
import { setCategory, setItemsState } from '../../redux/contentSlice'
import { setPageRedux } from '../../redux/uiSlice'
import { useSwipeable } from 'react-swipeable'
import Card from './Card'
import rrImage from '/images/rrlogo_HD.webp'
import { formatDate } from '../../utils/helper.utils'
import ArticleSearchBar from './ArticleSearchBar'
import Button from '../miscellaneous/ButtonComponent'
import {
  clearSearch,
  searchArticles,
  setSearchTerm,
} from '../../redux/articleSlice'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'

// Lazy load components
const Categories = React.lazy(() => import('./Categories'))
const GetStarted = React.lazy(() =>
  import('../Header-Footer/navbarComponents/GetStarted'),
)

const Timeline = ({ data, load, hasMoreItems, setHasMoreItems }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { searchResults, isSearching, searchLoading, searchTerm } = useSelector(
    state => state.articles,
  )
  const dispatchRedux = useDispatch()
  const { category } = useSelector(state => state.content)

  const [swipeDisable, setSwipeDisable] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true)

  const isSmallerThan992 = useMediaQuery('(max-width: 992px)')[0]
  const flexDirectionOfTimeline = useBreakpointValue({
    base: 'column',
    lg: 'row',
  })
  const { t, i18n } = useTranslation()
  const categoryRefs = useRef([])

  const notLoggedIn = !isAuthenticated

  const handleLoadMore = () => {
    if (isSearching) {
      const nextPage = Math.floor(searchResults.length / 10) + 1
      dispatchRedux(
        searchArticles({ query: searchTerm, page: nextPage, limit: 10 }),
      )
    }
  }

  const displayedData = isSearching ? searchResults : data

  const activeCategoryIndex = useMemo(() => {
    return categories?.findIndex(
      cat => cat.key.toLowerCase() === (category || 'all').toLowerCase(),
    )
  }, [category])

  const handleActiveCategory = useCallback(
    ({ category, shouldNavigateOrNot = true }) => {
      setHasMoreItems(true)
      dispatchRedux(setCategory(category.toLowerCase()))
      dispatchRedux(setPageRedux(0))
      dispatchRedux(clearSearch())
      dispatchRedux(setSearchTerm(''))
      dispatchRedux(setItemsState([]))
      if (shouldNavigateOrNot) {
        navigate(`/home/${category.toLowerCase()}`)
      }
    },
    [dispatchRedux, navigate],
  )

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!swipeDisable) {
        const newIndex = (activeCategoryIndex + 1) % categories.length
        handleActiveCategory({ category: categories[newIndex] })
      }
    },
    onSwipedRight: () => {
      if (!swipeDisable) {
        const newIndex =
          (activeCategoryIndex - 1 + categories.length) % categories.length
        handleActiveCategory({ category: categories[newIndex] })
      }
    },
  })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      if (isSmallerThan992) {
        const notFix = prevScrollPos > currentScrollPos || currentScrollPos < 10
        setIsFixed(!notFix)
      }
      if (currentScrollPos > prevScrollPos && currentScrollPos > 100) {
        setIsSearchBarVisible(false)
      } else {
        setIsSearchBarVisible(true)
      }
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [prevScrollPos, isSmallerThan992])

  useEffect(() => {
    const pathCategory = location.pathname.split('/')[2] || 'all'
    if (
      pathCategory &&
      pathCategory?.toLocaleLowerCase() !== category?.toLocaleLowerCase()
    ) {
      const idx = categories?.findIndex(
        cat =>
          cat &&
          cat?.key?.toLocaleLowerCase() === pathCategory?.toLocaleLowerCase(),
      )
      if (idx !== -1) {
        handleActiveCategory({
          category: pathCategory,
          shouldNavigateOrNot: false,
        })
      }
    }
  }, [location, category, handleActiveCategory])

  const renderSkeletons = useMemo(() => {
    return Array.from({ length: 27 }).map((_, index) => (
      <Flex
        mt={{ base: '6rem', md: '5rem', lg: '4rem', xl: '3rem' }}
        key={index}
      >
        <Skeleton w="xs" h={{ base: '26rem', md: 'md' }} borderRadius="2xl" />
      </Flex>
    ))
  }, [])

  const trackCategoryClick = useCallback(category => {
    ReactGA.send({
      hitType: 'event',
      eventCategory: 'Category Click',
      eventAction: 'Click',
      eventLabel: category,
    })
  }, [])

  return (
    <Flex flexDirection={'column'}>
      <Flex
        flexDirection={flexDirectionOfTimeline}
        gap="2%"
        position="relative"
        overflow="hidden"
      >
        <Flex
          zIndex={999}
          transform={!isFixed ? 'translateY(0)' : 'translateY(-68%)'}
          transition="transform 0.3s ease-in-out"
          p={'1rem'}
          pb={isSearchBarVisible ? '2rem' : '1rem'}
          width={{ base: '100%', lg: '15%' }}
          height={{ base: 'auto', lg: '100vh' }}
          position="fixed"
          backgroundColor="rgba(15, 13, 21, 0.4)"
          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
          boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)) 1',
          }}
          overflow="auto"
          sx={{
            '::-webkit-scrollbar': {
              width: '4px',
              height: '10px',
            },
            '::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '::-webkit-scrollbar-thumb': {
              background: '#0f0d15',
              borderRadius: '10px',
            },
            '::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: '#0f0d15 transparent',
          }}
        >
          <Flex
            w={'100%'}
            overflow={'auto'}
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
            }}
          >
            <Suspense fallback={<Skeleton height="100vh" width="15%" />}>
              <Categories
                trackCategoryClick={trackCategoryClick}
                activeCategoryIndex={activeCategoryIndex}
                activeCategory={category}
                handleActiveCategory={handleActiveCategory}
                categories={categories}
                categoryRefs={categoryRefs}
                notLoggedIn={notLoggedIn}
              />
            </Suspense>
          </Flex>
          <Flex
            width={{ base: '100%', lg: '82%' }}
            justifyContent={'center'}
            alignItems={'center'}
            right={0}
            bottom={2}
            position={'absolute'}
            mr={{ base: '0', lg: '1%' }}
            px={{ base: 3, lg: 1 }}
            zIndex={999}
            display={{ base: 'flex', lg: 'none' }}
            transform={
              isSearchBarVisible ? 'translateY(0)' : 'translateY(100%)'
            }
            transition="opacity 0.2s ease-in-out, transform 0.2s ease-in-out"
            opacity={isSearchBarVisible ? 1 : 0}
          >
            <ArticleSearchBar />
          </Flex>
        </Flex>

        <Flex flexDirection={'column'} position={'relative'}>
          <Flex
            width={{ base: '100%', lg: '82%' }}
            justifyContent={'center'}
            alignItems={'center'}
            position={'fixed'}
            mt={'2rem'}
            right={0}
            mr={{ base: '0', lg: '1%' }}
            px={{ base: 3, lg: 1 }}
            zIndex={999}
            opacity={isSearchBarVisible ? 1 : 0}
            transform={
              isSearchBarVisible ? 'translateY(0)' : 'translateY(-100%)'
            }
            transition="opacity 0.2s ease-in-out, transform 0.2s ease-in-out"
            display={{ base: 'none', lg: 'flex' }}
          >
            <ArticleSearchBar />
          </Flex>
          <Flex
            px={{ base: 3, lg: 1 }}
            mt={{ base: '2rem', md: '4.5rem', lg: '1rem' }}
            ml={'auto'}
            mr={{ base: '0', lg: '1%' }}
            width={{ base: '100%', lg: '82%' }}
            {...(!swipeDisable && swipeHandlers)}
            justifyContent={'center'}
            alignItems="center"
          >
            <Flex
              wrap="wrap"
              // justifyContent={{ base: 'center', md: 'space-between' }}
              justifyContent={'center'}
              gap={{ base: '1rem', md: '4rem', lg: '2rem', xl: '1rem' }}
              alignItems={'center'}
              mt={'2rem'}
            >
              {displayedData.map((item, id) => (
                <Flex
                  mt={{ base: '6rem', md: '5rem', lg: '4rem', xl: '3rem' }}
                  key={id}
                >
                  {/* <TimelineItem newsNumber={id} data={item} /> */}
                  <Suspense fallback={<Skeleton key={id} mt="5rem" />} key={id}>
                    <Card
                      title={
                        i18n.language === 'en' ? item?.title : item?.hindiTitle
                      }
                      image={
                        Array.isArray(item?.imgURL) && item?.imgURL.length > 0
                          ? item.imgURL[0]
                          : rrImage
                      }
                      category={t(`categories:categories.${item?.category}`)}
                      date={formatDate(item?.dateTime)}
                      readTime={item.avgReadTime}
                      id={item._id}
                    />
                  </Suspense>
                </Flex>
              ))}
              {(load || searchLoading) && renderSkeletons}
            </Flex>
          </Flex>

          <Flex
            width={{ base: '100%', lg: '82%' }}
            justifyContent={'center'}
            alignItems={'center'}
            mt={'2rem'}
            right={0}
            ml={'auto'}
            px={{ base: 3, lg: 1 }}
            zIndex={999}
            gap={'2rem'}
            mb={'2rem'}
          >
            {isSearching && searchResults.length > 0 && (
              <Flex justifyContent="center" mt="2rem">
                <Button onClick={() => dispatchRedux(clearSearch())}>
                  Clear Search Results
                </Button>
              </Flex>
            )}

            {isSearching &&
              searchResults.length % 10 === 0 &&
              searchResults.length !== 0 && (
                <Flex justifyContent="center" mt="2rem">
                  <Button onClick={handleLoadMore}>Load More</Button>
                </Flex>
              )}
          </Flex>
        </Flex>
      </Flex>
      {notLoggedIn && (
        <Suspense fallback={<Skeleton height="6rem" width="100%" />}>
          <Flex
            marginTop="2rem"
            height="6rem"
            width="100%"
            color="white"
            justifyContent="center"
            alignItems="center"
            borderRadius="8px"
            padding="1rem"
            textAlign="center"
          >
            <GetStarted innerText="Login To Continue further" />
          </Flex>
        </Suspense>
      )}
      {!hasMoreItems && (user?.newAccount || user?.firstLogin) && (
        <Flex
          marginTop="2rem"
          height="6rem"
          width="100%"
          color="white"
          justifyContent="center"
          alignItems="center"
          borderRadius="8px"
          padding="1rem"
          paddingTop="4rem"
          textAlign="center"
        >
          Please Revisit this page after some time to view recommended news
        </Flex>
      )}
      {!hasMoreItems && !user?.newAccount && (
        <Flex
          marginTop="2rem"
          height="6rem"
          width="100%"
          color="white"
          justifyContent="center"
          alignItems="center"
          borderRadius="8px"
          padding="1rem"
          paddingTop="4rem"
          textAlign="center"
        >
          No more news to show
        </Flex>
      )}
    </Flex>
  )
}

export default Timeline
