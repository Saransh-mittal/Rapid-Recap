// /pages/Home.jsx

import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { useToast, Box, Spinner } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { setPageRedux } from '../redux/uiSlice'
import { setCategory, setItemsState } from '../redux/contentSlice'

const Timeline = lazy(() => import('../components/homeComponents/Timeline'))
const UpgradeModal = lazy(() =>
  import('../components/homeComponents/UpgradeModal'),
)

const Home = () => {
  const { isAuthenticated, user, loginCheckStatus } = useSelector(
    state => state.auth,
  )
  const { page: statePage } = useSelector(state => state.ui)
  const { items: stateItems, category: stateCategory } = useSelector(
    state => state.content,
  )
  const { isSearching } = useSelector(state => state.articles)
  const dispatchRedux = useDispatch()
  const navigate = useNavigate()
  const { category } = useParams()
  const toast = useToast()

  const [items, setItems] = useState(stateItems)
  const [page, setPage] = useState(statePage + 1)
  const [load, setLoad] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(true)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [prevCategory, setPrevCategory] = useState(stateCategory)

  const USER_IQ = user?.IQ_score ?? null
  const notLoggedIn = !isAuthenticated

  const fetchData = useCallback(async () => {
    if (loginCheckStatus === 'pending' || !hasMoreItems) return

    setLoad(true)

    try {
      const response =
        (category === 'all' || !category) && !notLoggedIn
          ? await axios.get(`/api/recommendation?page=${page}&pageSize=18`)
          : await axios.get(
              `/api/articles?page=${page}&pageSize=18&category=${
                notLoggedIn && (category === 'all' || !category)
                  ? 'top'
                  : category
              }`,
            )

      const newItems = response.data
      if (newItems.length === 0) {
        setHasMoreItems(false)
      } else {
        dispatchRedux(setPageRedux(page - 1))
        dispatchRedux(setItemsState([...items, ...newItems]))
        setItems(prev => [...prev, ...newItems])
      }
    } catch (error) {
      console.error(error.message)
      toast({
        title: 'Error',
        description: 'Failed to fetch news',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoad(false)
    }
  }, [
    page,
    category,
    hasMoreItems,
    loginCheckStatus,
    notLoggedIn,
    items,
    dispatchRedux,
    toast,
  ])

  const handleScroll = useCallback(async () => {
    if (isSearching) return
    if (
      !notLoggedIn &&
      window.innerHeight + document.documentElement.scrollTop + 1000 >
        document.documentElement.scrollHeight &&
      hasMoreItems
    ) {
      setLoad(true)
      setPage(prevPage => prevPage + 1)
    }
  }, [hasMoreItems, notLoggedIn, isSearching])

  const debouncedHandleScroll = useMemo(
    () => debounce(handleScroll, 300),
    [handleScroll],
  )

  useEffect(() => {
    if (!category || category === '') {
      navigate('/home/all')
    }
    window.addEventListener('scroll', debouncedHandleScroll)

    return () => window.removeEventListener('scroll', debouncedHandleScroll)
  }, [category, isAuthenticated, debouncedHandleScroll])

  useEffect(() => {
    if (category !== prevCategory) {
      setPage(1)
      setItems([])
      setHasMoreItems(true)
      dispatchRedux(
        setCategory(
          category !== '' && category ? category.toLocaleLowerCase() : category,
        ),
      )
      dispatchRedux(setPageRedux(0))
      dispatchRedux(setItemsState([]))
      setPrevCategory(category)
    } else if (items.length < page * 9) {
      fetchData()
    } else {
      setLoad(false)
    }
  }, [
    category,
    page,
    prevCategory,
    fetchData,
    items.length,
    dispatchRedux,
    loginCheckStatus,
  ])

  return (
    <Box marginTop={'4rem'} w={'100%'}>
      <Helmet>
        <title>Home - Rapid Recap</title>
        <meta
          name="description"
          content="Explore the latest news and articles on Rapid Recap. Stay informed and test your knowledge with our engaging quizzes."
        />
        <meta
          name="keywords"
          content="Rapid Recap, news, articles, quizzes, Information Quotient, IQ score"
        />
        <meta property="og:title" content="Home - Rapid Recap" />
        <meta
          property="og:description"
          content="Explore the latest news and articles on Rapid Recap. Stay informed and test your knowledge with our engaging quizzes."
        />
      </Helmet>
      <Suspense fallback={<Spinner />}>
        {isAuthenticated && USER_IQ > 90 && user.societyUpgradeMessage && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
          />
        )}
        <Timeline
          setHasMoreItems={setHasMoreItems}
          hasMoreItems={hasMoreItems}
          data={items}
          load={load}
        />
      </Suspense>
    </Box>
  )
}

export default Home
