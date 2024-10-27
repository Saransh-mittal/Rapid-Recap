import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import {
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
import { formatDate } from '../../utils/helper.utils'
import ArticleSearchBar from './ArticleSearchBar'
import Button from '../miscellaneous/ButtonComponent'
import {
  clearSearch,
  searchArticles,
  setSearchTerm,
} from '../../redux/articleSlice'
import { useTranslation } from 'react-i18next'
import { blackListedImgUrls } from '../../assets/blackListedImgUrls'
import { useNavbar } from '../../contextAPI/NavbarContext'
import Categories from './Categories'

//SSR images
const rrImage = '/images/rrlogo_HD.webp'

// Lazy load components
const GetStarted = React.lazy(() =>
  import('../Header-Footer/navbarComponents/GetStarted'),
)

const Timeline = ({ data, load, hasMoreItems, setHasMoreItems, setLoad }) => {
  const { t, i18n } = useTranslation(['Timeline', 'formatDate'])
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { searchResults, isSearching, searchLoading, searchTerm } = useSelector(
    state => state.articles,
  )
  const dispatchRedux = useDispatch()
  const { category } = useSelector(state => state.content)
  const { isVisibleRef } = useNavbar()
  const [swipeDisable, setSwipeDisable] = useState(false)
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true)
  const categoryRef = useRef()
  const [isSmallerThan992] = useMediaQuery('(max-width: 992px)')
  const flexDirectionOfTimeline = useBreakpointValue({
    base: 'column',
    lg: 'row',
  })
  const categoryRefs = useRef([])
  const prevScrollPosRef = useRef(0)

  const notLoggedIn = !isAuthenticated

  const displayedData = useMemo(
    () => (isSearching ? searchResults : data),
    [isSearching, searchResults, data],
  )

  const handleLoadMore = useCallback(() => {
    if (isSearching) {
      const nextPage = Math.floor(searchResults.length / 10) + 1
      dispatchRedux(
        searchArticles({ query: searchTerm, page: nextPage, limit: 10 }),
      )
    }
  }, [
    isSearching,
    searchResults.length,
    dispatchRedux,
    searchArticles,
    searchTerm,
  ])

  const activeCategoryIndex = useMemo(() => {
    return categories?.findIndex(
      cat => cat.key.toLowerCase() === (category || 'all').toLowerCase(),
    )
  }, [category])

  const handleActiveCategory = useCallback(
    ({ category, shouldNavigateOrNot = true }) => {
      if (shouldNavigateOrNot) {
        navigate(`/home/${category.toLowerCase()}`)
      }
      setLoad(true)
      setHasMoreItems(true)
      dispatchRedux(setCategory(category.toLowerCase()))
      dispatchRedux(setPageRedux(0))
      dispatchRedux(clearSearch())
      dispatchRedux(setSearchTerm(''))
      dispatchRedux(setItemsState([]))
      window.scrollTo(0, 0)
    },
    [dispatchRedux, navigate, setLoad, setHasMoreItems],
  )

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!swipeDisable) {
        const newIndex = (activeCategoryIndex + 1) % categories.length
        handleActiveCategory({ category: categories[newIndex].key })
      }
    },
    onSwipedRight: () => {
      if (!swipeDisable) {
        const newIndex =
          (activeCategoryIndex - 1 + categories.length) % categories.length
        handleActiveCategory({ category: categories[newIndex].key })
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    delta: 100,
  })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      if (isSmallerThan992 && categoryRef.current) {
        categoryRef.current.style.transform = isVisibleRef.current
          ? 'translateY(0)'
          : 'translateY(-68%)'
      }
      setIsSearchBarVisible(
        currentScrollPos <= 100 || currentScrollPos < prevScrollPosRef.current,
      )
      prevScrollPosRef.current = currentScrollPos
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSmallerThan992, isVisibleRef])

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
      category,
      action: 'click',
    })
  }, [])

  const renderCard = useCallback(
    (item, id) => (
      <Flex mt={{ base: '6rem', md: '5rem', lg: '4rem', xl: '3rem' }} key={id}>
        <Card
          title={i18n.language === 'en' ? item?.title : item?.hindiTitle}
          urlTitle={item?.title}
          image={
            (!blackListedImgUrls.find(url => url === item.imgURL) &&
              item.imgURL) ||
            rrImage
          }
          category={t(`categories.${item?.category.toLowerCase()}`)}
          date={formatDate(item?.dateTime, i18n.language)}
          readTime={item.avgReadTime}
          id={item._id}
          articleData={item}
        />
      </Flex>
    ),
    [i18n.language, t],
  )

  const memoizedCards = useMemo(
    () => displayedData?.map(renderCard),
    [displayedData, renderCard],
  )

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
          ref={categoryRef}
          transition="transform 0.3s ease-in-out"
          p={'1rem'}
          pb={isSearchBarVisible ? '2rem' : '1rem'}
          width={{ base: '100%', lg: '15%' }}
          height={{ base: 'auto', lg: '100vh' }}
          position="fixed"
          // backgroundColor="rgba(15, 13, 21, 0.5)"
          // borderBottom="1px solid rgba(255, 255, 255, 0.1)"
          // boxShadow="0 2px 4px rgba(0, 0, 0, 0.3)"
          // style={{
          //   borderImage:
          //     'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)) 1',
          // }}
          overflow="auto"
          // sx={{
          //   '::-webkit-scrollbar': {
          //     width: '4px',
          //     height: '10px',
          //   },
          //   '::-webkit-scrollbar-track': {
          //     background: 'transparent',
          //   },
          //   '::-webkit-scrollbar-thumb': {
          //     background: '#0f0d15',
          //     borderRadius: '10px',
          //   },
          //   '::-webkit-scrollbar-thumb:hover': {
          //     background: '#555',
          //   },
          //   scrollbarWidth: 'thin',
          //   scrollbarColor: '#0f0d15 transparent',
          // }}
          bgGradient="linear(135deg, rgba(28, 20, 56, 0.85) 0%, rgba(15, 13, 21, 0.85) 100%)"
          borderRight="1px solid rgba(255, 255, 255, 0.08)"
          boxShadow="4px 0 30px rgba(0, 0, 0, 0.1)"
          // overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(15, 13, 21, 0.5)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(88, 65, 175, 0.5)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(88, 65, 175, 0.7)',
            },
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
            <Categories
              trackCategoryClick={trackCategoryClick}
              activeCategoryIndex={activeCategoryIndex}
              activeCategory={category}
              handleActiveCategory={handleActiveCategory}
              categories={categories}
              categoryRefs={categoryRefs}
              notLoggedIn={notLoggedIn}
            />
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
            {...swipeHandlers}
            justifyContent={'center'}
            alignItems="center"
          >
            <Flex
              wrap="wrap"
              justifyContent={'center'}
              gap={{ base: '1rem', md: '4rem', lg: '2rem', xl: '1rem' }}
              alignItems={'center'}
              mt={'2rem'}
            >
              {memoizedCards}
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
                  {t('buttons.clearSearch')}
                </Button>
              </Flex>
            )}

            {isSearching &&
              searchResults.length % 10 === 0 &&
              searchResults.length !== 0 && (
                <Flex justifyContent="center" mt="2rem">
                  <Button onClick={handleLoadMore}>
                    {t('buttons.loadMore')}
                  </Button>
                </Flex>
              )}
          </Flex>
        </Flex>
      </Flex>
      {notLoggedIn && (
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
          <GetStarted innerText={t('messages.loginToContinue')} />
        </Flex>
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
          {t('messages.revisitLater')}
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
          {t('messages.noMoreNews')}
        </Flex>
      )}
    </Flex>
  )
}

export default React.memo(Timeline)
