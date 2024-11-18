import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
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
import ModernCategories from './ModernCategories'

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
      <Flex mt={{ lg: '4rem' }} key={index}>
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
      <Flex mt={{ lg: '4rem' }} key={id}>
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
    <Flex flexDirection={'column'} position={'relative'}>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        height="120px" // Adjust based on your navbar height + some extra space
        background="linear-gradient(to bottom, rgba(14, 12, 22, 1) 0%, rgba(14, 12, 22, 0.95) 40%, rgba(14, 12, 22, 0) 100%)"
        pointerEvents="none"
        zIndex={998} // Just below the navbar
        sx={{
          maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 20%, transparent 100%)',
        }}
      />
      <Flex
        flexDirection={flexDirectionOfTimeline}
        gap="2%"
        position="relative"
        overflow="hidden"
      >
        <ModernCategories
          trackCategoryClick={trackCategoryClick}
          activeCategoryIndex={activeCategoryIndex}
          activeCategory={category}
          handleActiveCategory={handleActiveCategory}
          categories={categories}
          categoryRefs={categoryRefs}
          notLoggedIn={notLoggedIn}
        />

        <Flex flexDirection={'column'} position={'relative'}>
          <Flex
            width={{ base: '100%', lg: '82%' }}
            justifyContent={'center'}
            alignItems={'center'}
            position={'fixed'}
            mt={'0.25rem'}
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
