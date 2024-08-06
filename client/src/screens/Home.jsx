import React, { lazy, Suspense, useContext, useEffect, useState } from 'react'
// import Timeline from "../components/homeComponents/Timeline";
import axios from 'axios'
import { AppContext } from '../contextAPI/appContext'
import { useNavigate, useParams } from 'react-router-dom'
import { debounce } from 'lodash'
import { useToast, Box, Spinner } from '@chakra-ui/react'

import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { setPageRedux } from '../redux/uiSlice'

const Timeline = lazy(() => import('../components/homeComponents/Timeline'))
const UpgradeModal = lazy(() =>
  import('../components/homeComponents/UpgradeModal'),
)

const Home = () => {
  const { state, dispatch } = useContext(AppContext)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { page: statePage } = useSelector(state => state.ui)
  const dispatchRedux = useDispatch()

  let notLoggedIn = !isAuthenticated

  const [items, setItems] = useState(state.items)
  const [page, setPage] = useState(statePage + 1)
  const toast = useToast()
  const [load, setLoad] = useState(true)
  const navigate = useNavigate()
  const { category } = useParams()
  const [showUpgradeModal, setShowUpgradeModal] = useState(true)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [prevCategory, setPrevCategory] = useState(state.category)

  const USER_IQ = user?.IQ_score ?? null

  async function fetchData() {
    if (!hasMoreItems) {
      setLoad(false)
      return
    }

    try {
      const response =
        (category === 'all' || !category || category === '') && !notLoggedIn
          ? await axios.get(`/api/recommendation?page=${page}&pageSize=9`)
          : await axios.get(
              `/api/articles?page=${page}&pageSize=9&category=${
                notLoggedIn &&
                (category === 'all' || !category || category === '')
                  ? 'top'
                  : category
              }`,
            )

      const newItems = response.data
      if (newItems.length === 0) {
        setHasMoreItems(false)
      } else {
        dispatchRedux(setPageRedux(page - 1))
        dispatch({
          type: 'ITEMS',
          payloadItems: [...items, ...newItems],
        })
        setItems(prev => [...prev, ...newItems])
      }
    } catch (error) {
      console.log(error.message)
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
  }

  const handleScroll = async () => {
    try {
      if (
        !notLoggedIn &&
        window.innerHeight + document.documentElement.scrollTop + 1000 >
          document.documentElement.scrollHeight &&
        hasMoreItems
      ) {
        setLoad(true)
        setPage(prevPage => prevPage + 1)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const debouncedHandleScroll = debounce(handleScroll, 300)

  useEffect(() => {
    if (!category || category === '') {
      navigate('/home/all')
    }
    window.addEventListener('scroll', debouncedHandleScroll)

    dispatch({ type: 'setNews', payloadNews: {} })

    return () => window.removeEventListener('scroll', debouncedHandleScroll)
  }, [isAuthenticated, category])

  useEffect(() => {
    if (category !== prevCategory) {
      // Category has changed
      setPage(1)
      setItems([])
      setHasMoreItems(true)
      dispatch({ type: 'category', payloadCategory: category })
      dispatchRedux(setPageRedux(0))
      dispatch({ type: 'ITEMS', payloadItems: [] })
      setPrevCategory(category)
    } else if (items.length < page * 9) {
      // Same category, need to fetch more items
      fetchData()
    } else {
      setLoad(false)
    }
  }, [category, page, prevCategory])

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
