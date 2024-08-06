import { useContext, useEffect, useRef, useState } from 'react'
import TimelineItem from './TimelineItem'
import { AppContext } from '../../contextAPI/appContext'
import { useHomeTour } from '../../customHooks/useTours'
import {
  Box,
  Flex,
  Skeleton,
  useBreakpointValue,
  useMediaQuery,
} from '@chakra-ui/react'
import Categories from './Categories'
import GetStarted from '../Header-Footer/navbarComponents/GetStarted'
import { useSwipeable } from 'react-swipeable' // Import the swipeable hook
import { categories } from '../../assets/Categories'
import { useNavigate, useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4' // Import Google Analytics library
import { useSelector } from 'react-redux'

const Timeline = ({ data, load, hasMoreItems, setHasMoreItems }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { state, dispatch } = useContext(AppContext)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const [swipeDisable, setSwipeDisable] = useState(false)
  const { tour, isTutorialTakenCheck } = useHomeTour({ setSwipeDisable })
  const flexDirectionOfTimeline = useBreakpointValue({
    base: 'column',
    lg: 'row',
  })
  const notLoggedIn = !isAuthenticated
  const isSmallerThan992 = useMediaQuery('(max-width: 992px)')[0]

  const [isFixed, setIsFixed] = useState(false)
  const [prevScrollPos, setPrevScrollPos] = useState(0)

  const [activeCategory, setActiveCategory] = useState(state.category)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(
    categories?.findIndex(
      category =>
        category?.toLocaleLowerCase() ===
        (state.category || 'all').toLocaleLowerCase(),
    ),
  )
  const categoryRefs = useRef([])

  const handleActiveCategory = ({ category, shouldNavigateOrNot = true }) => {
    setHasMoreItems(true)
    setActiveCategory(category.toLowerCase())
    dispatch({
      type: 'category',
      payloadCategory: category.toLowerCase(),
    })
    dispatch({ type: 'PAGE', payloadPage: 0 })
    dispatch({ type: 'ITEMS', payloadItems: [] })
    shouldNavigateOrNot && navigate(`/home/${category.toLowerCase()}`)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      !swipeDisable &&
        setActiveCategoryIndex((activeCategoryIndex + 1) % categories.length)
      !swipeDisable &&
        handleActiveCategory({
          category: categories[(activeCategoryIndex + 1) % categories.length],
        })
    },
    onSwipedRight: () => {
      !swipeDisable &&
        setActiveCategoryIndex((activeCategoryIndex - 1) % categories.length)
      !swipeDisable &&
        handleActiveCategory({
          category: categories[(activeCategoryIndex - 1) % categories.length],
        })
    },
  })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      if (isSmallerThan992) {
        const notFix = prevScrollPos > currentScrollPos || currentScrollPos < 10
        setIsFixed(!notFix)
      }
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [prevScrollPos, isFixed, isSmallerThan992])

  useEffect(() => {
    if (!load && isAuthenticated && user && user.tutorial.homePage) {
      // isTutorialTakenCheck({ page: "homePage", tour });
    }
  }, [load, isAuthenticated, user, isTutorialTakenCheck, tour])

  useEffect(() => {
    const pathCategory = location.pathname.split('/')[2] || 'all'
    if (
      pathCategory &&
      pathCategory.toLocaleLowerCase() !== activeCategory.toLocaleLowerCase()
    ) {
      const idx = categories.findIndex(
        cat => cat.toLocaleLowerCase() === pathCategory.toLocaleLowerCase(),
      )
      if (idx !== -1) {
        setActiveCategoryIndex(idx)
        trackCategoryClick(pathCategory)
        handleActiveCategory({
          category: pathCategory,
          shouldNavigateOrNot: false,
        })
      }
    }
  }, [location, activeCategory])

  const renderSkeletons = () => {
    return Array.from({ length: 9 }).map((_, index) => (
      <Box key={index} className="timeline-item" mt={'5rem'}>
        <Box className="timeline-item-content">
          <Box className="containers">
            <Skeleton className="cardWrapper" />
          </Box>
        </Box>
      </Box>
    ))
  }

  const trackCategoryClick = category => {
    ReactGA.send({
      hitType: 'event',
      eventCategory: 'Category Click',
      eventAction: 'Click',
      eventLabel: category, // Track the category that was clicked
    })
  }

  return (
    <div
      className="pr-3 pl-1 timeline"
      style={{
        display: 'flex',
        flexDirection: flexDirectionOfTimeline,
        gap: '2%',
        position: 'relative',
        overflow: 'hidden',
      }}
      // Spread swipe handlers here
    >
      <Flex
        zIndex={999}
        transform={!isFixed ? 'translateY(0)' : 'translateY(-68%)'}
        transition="transform 0.3s ease-in-out"
        padding={'1rem'}
        w={{ base: '100%', lg: '15%' }}
        h={{ base: 'auto', lg: '100vh' }}
        position={'fixed'}
        backgroundColor={'rgba(15, 13, 21, 0.4)'} // Adjust the alpha value (0.8) for transparency
        // boxShadow={
        //   '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)'
        // }
        borderBottom={'1px solid rgba(255, 255, 255, 0.1)'}
        boxShadow={'0 2px 4px rgba(0, 0, 0, 0.1)'}
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderImage:
            'linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)) 1',
        }}
        // backgroundImage={
        //   'linear-gradient(-180deg, rgba(26, 21, 39, 0.8), rgba(14, 12, 22, 0.8) 88%, rgba(14, 12, 22, 0.8) 99%)'
        // }
        overflow={'auto'}
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
        <Categories
          trackCategoryClick={trackCategoryClick}
          setActiveCategoryIndex={setActiveCategoryIndex}
          activeCategoryIndex={activeCategoryIndex}
          activeCategory={activeCategory}
          handleActiveCategory={handleActiveCategory}
          categories={categories}
          categoryRefs={categoryRefs}
          notLoggedIn={notLoggedIn}
        />
      </Flex>
      <div
        className="timeline-container"
        {...(!swipeDisable && swipeHandlers)}
        //style={!notLoggedIn && { paddingBottom: "6rem" }}
      >
        <div className="row item-container">
          {data.map((item, id) => (
            <Flex
              mt={{ base: '6rem', md: '5rem', lg: '4rem', xl: '3rem' }}
              className="col-md-6 col-xxl-4 item"
              key={id}
              // onClick={() => {
              //   navigate(`/article/${item._id}`)
              //   dispatch({ type: 'setNews', payloadNews: item })
              // }}
              // _hover={{
              //   cursor: 'pointer',
              // }}
            >
              <TimelineItem
                newsNumber={id}
                data={item}
                tourComplete={tour.complete}
              />
            </Flex>
          ))}
          {load && (
            <Flex wrap="wrap" justify="space-between">
              {renderSkeletons()}
            </Flex>
          )}
        </div>
        {notLoggedIn && (
          <Flex
            marginTop={'2rem'}
            height={'6rem'}
            w={'100%'}
            color={'white'}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={'8px'}
            padding={'1rem'}
            textAlign={'center'}
          >
            <GetStarted innerText={'Login To Continue further'} />
          </Flex>
        )}
        {!hasMoreItems && (
          <Flex
            marginTop={'2rem'}
            height={'6rem'}
            w={'100%'}
            color={'white'}
            justifyContent={'center'}
            alignItems={'center'}
            borderRadius={'8px'}
            padding={'1rem'}
            paddingTop={'4rem'}
            textAlign={'center'}
          >
            No more news to show
          </Flex>
        )}
      </div>
    </div>
  )
}
export default Timeline
