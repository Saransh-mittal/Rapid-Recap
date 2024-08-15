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

// Lazy load components
const Categories = React.lazy(() => import('./Categories'))
const GetStarted = React.lazy(() =>
  import('../Header-Footer/navbarComponents/GetStarted'),
)

const Timeline = ({ data, load, hasMoreItems, setHasMoreItems }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useSelector(state => state.auth)
  const dispatchRedux = useDispatch()
  const { category } = useSelector(state => state.content)

  const [swipeDisable, setSwipeDisable] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [prevScrollPos, setPrevScrollPos] = useState(0)

  const isSmallerThan992 = useMediaQuery('(max-width: 992px)')[0]
  const flexDirectionOfTimeline = useBreakpointValue({
    base: 'column',
    lg: 'row',
  })

  const categoryRefs = useRef([])

  const notLoggedIn = !isAuthenticated

  const activeCategoryIndex = useMemo(() => {
    return categories?.findIndex(
      cat =>
        cat.toLocaleLowerCase() === (category || 'all').toLocaleLowerCase(),
    )
  }, [category])

  const handleActiveCategory = useCallback(
    ({ category, shouldNavigateOrNot = true }) => {
      setHasMoreItems(true)
      dispatchRedux(setCategory(category.toLowerCase()))
      dispatchRedux(setPageRedux(0))
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
      pathCategory.toLocaleLowerCase() !== category?.toLocaleLowerCase()
    ) {
      const idx = categories.findIndex(
        cat => cat.toLocaleLowerCase() === pathCategory.toLocaleLowerCase(),
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
          padding="1rem"
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
          px={{ base: 3, lg: 1 }}
          mt={{ base: '2rem', md: '4.5rem', lg: '0' }}
          ml={'auto'}
          mr={{ base: '0', lg: '1%' }}
          width={{ base: '100%', lg: '82%' }}
          {...(!swipeDisable && swipeHandlers)}
          justifyContent={'center'}
          alignItems="center"
        >
          <Flex
            wrap="wrap"
            justifyContent={{ base: 'center', md: 'space-between' }}
            alignItems={'center'}
          >
            {data.map((item, id) => (
              <Flex
                mt={{ base: '6rem', md: '5rem', lg: '4rem', xl: '3rem' }}
                key={id}
              >
                {/* <TimelineItem newsNumber={id} data={item} /> */}
                <Suspense fallback={<Skeleton key={id} mt="5rem" />} key={id}>
                  <Card
                    title={item?.title}
                    image={
                      Array.isArray(item?.imgURL) && item?.imgURL.length > 0
                        ? item.imgURL[0]
                        : rrImage
                    }
                    category={item?.category}
                    date={formatDate(item?.dateTime)}
                    readTime={item.avgReadTime}
                    id={item._id}
                  />
                </Suspense>
              </Flex>
            ))}
            {load && renderSkeletons}
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
      {!hasMoreItems && (
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
