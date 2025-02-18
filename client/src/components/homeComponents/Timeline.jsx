import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Box, Flex, useBreakpointValue, useMediaQuery } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useDispatch, useSelector } from 'react-redux'
import { setCategory } from '../../redux/contentSlice'
import { useSwipeable } from 'react-swipeable'
import { getCategories } from '../../assets/Categories'
import { useNavbar } from '../../contextAPI/NavbarContext'
import { useTranslation } from 'react-i18next'
import {
  clearSearch,
  searchArticles,
  setSearchTerm,
} from '../../redux/articleSlice'
import VirtualizedGrid from './VirtualizedGrid'
import ArticleSearchBar from './ArticleSearchBar'
import ModernCategories from './ModernCategories'
import FloatingActionButtons from './FloatingActionButtons'

const Timeline = ({
  data,
  load,
  hasMoreItems,
  setHasMoreItems,
  setLoad,
  onLoadMore,
}) => {
  const { t } = useTranslation(['Timeline', 'formatDate'])
  const navigate = useNavigate()
  const dispatchRedux = useDispatch()
  const [showGetsStarted, setShowGetStarted] = useState(false)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { activeAbilities } = useSelector(state => state.inventory)
  const categories = useMemo(
    () =>
      getCategories({
        categoryPrivileges: user?.categoryPrivileges,
        activeAbilities: activeAbilities,
      }),
    [user?.categoryPrivileges, activeAbilities],
  )
  const { searchResults, isSearching, searchLoading, searchTerm } = useSelector(
    state => state.articles,
  )
  const { category } = useSelector(state => state.content)
  const { isVisibleRef } = useNavbar()

  // UI State
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(true)
  const [swipeDisable] = useState(false)

  // Refs
  const categoryRef = useRef()
  const categoryRefs = useRef([])
  const prevScrollPosRef = useRef(0)

  // Media Queries
  const [isSmallerThan992] = useMediaQuery('(max-width: 992px)')
  const flexDirectionOfTimeline = useBreakpointValue({
    base: 'column',
    lg: 'row',
  })

  // Derived State
  const notLoggedIn = !isAuthenticated

  // Display Data Logic
  const displayedData = useMemo(() => {
    if (isSearching) return searchResults
    return Array.isArray(data) ? data : []
  }, [isSearching, searchResults, data])

  // Category Navigation
  const handleActiveCategory = useCallback(
    ({ category: newCategory, shouldNavigateOrNot = true }) => {
      if (shouldNavigateOrNot) {
        navigate(`/home/${newCategory?.toLowerCase()}`)
      }
      dispatchRedux(setCategory(newCategory?.toLowerCase()))
      dispatchRedux(clearSearch())
      dispatchRedux(setSearchTerm(''))
      window.scrollTo(0, 0)
    },
    [dispatchRedux, navigate],
  )

  // Search Handling
  const handleLoadMore = useCallback(() => {
    if (isSearching) {
      const nextPage = Math.floor(searchResults.length / 10) + 1
      dispatchRedux(
        searchArticles({ query: searchTerm, page: nextPage, limit: 10 }),
      )
    }
  }, [isSearching, searchResults.length, dispatchRedux, searchTerm])

  // Category Index
  const activeCategoryIndex = useMemo(() => {
    return categories?.findIndex(
      cat => cat?.key?.toLowerCase() === (category || 'all')?.toLowerCase(),
    )
  }, [category])

  // Swipe Handlers
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

  // Scroll Handler
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

  // Analytics
  const trackCategoryClick = useCallback(category => {
    ReactGA.send({
      category,
      action: 'click',
    })
  }, [])

  return (
    <Flex flexDirection={'column'} position={'relative'} overflow={'hidden'}>
      <FloatingActionButtons
        showClearSearch={isSearching && searchResults.length > 0}
        showLoadMore={
          isSearching &&
          searchResults.length % 10 === 0 &&
          searchResults.length !== 0
        }
        onClearSearch={() => dispatchRedux(clearSearch())}
        onLoadMore={handleLoadMore}
        t={t}
        notLoggedIn={notLoggedIn}
        showGetsStarted={showGetsStarted}
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

        <Flex
          flexDirection={'column'}
          position={'relative'}
          w={'100%'}
          ml={'auto'}
          overflow={'hidden'}
        >
          <Flex
            flexDirection={'column'}
            position={'relative'}
            width={{ base: '100%', lg: 'calc(100vw - 260px)' }} // Increased from 82%
            ml={'auto'}
            mr={{ base: '0', lg: '2rem' }} // Added explicit right margin
            overflow={'hidden'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            {/* Search Bar */}
            <Flex
              width={{ base: '100%', lg: '80%' }}
              className="search-bar"
              justifyContent={'center'}
              alignItems={'center'}
              position={'sticky'}
              top={0}
              mt={'0.25rem'}
              px={{ base: 3, lg: 1 }}
              zIndex={999}
              opacity={isSearchBarVisible ? 1 : 0}
              transform={
                isSearchBarVisible ? 'translateY(0)' : 'translateY(-100%)'
              }
              transition="opacity 0.2s ease-in-out, transform 0.2s ease-in-out"
              display={'flex'}
              backdropFilter="blur(8px)"
            >
              <ArticleSearchBar />
            </Flex>

            {/* Virtualized Content */}
            <Box
              flex={1}
              position="relative"
              {...swipeHandlers}
              width="100%"
              maxW="100%"
              overflow="hidden"
            >
              <VirtualizedGrid
                items={displayedData}
                loading={load || searchLoading}
                onLoadMore={onLoadMore}
                hasMore={hasMoreItems}
                setShowGetStarted={setShowGetStarted}
              />
            </Box>
          </Flex>
        </Flex>
      </Flex>

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
