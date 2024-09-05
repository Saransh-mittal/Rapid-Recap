import React, {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import debounce from 'lodash.debounce'
import { useToast, Box, Spinner, useDisclosure } from '@chakra-ui/react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { setPageRedux } from '../redux/uiSlice'
import { setCategory, setItemsState } from '../redux/contentSlice'
import throttle from 'lodash.throttle'
import WiseWeb from '../components/profileComponents/WiseWeb'
import { markFriendRequestsAsRead } from '../redux/appSlice'
import i18n from 'i18next'

const Timeline = lazy(() => import('../components/homeComponents/Timeline'))
const UpgradeModal = lazy(() =>
  import('../components/homeComponents/UpgradeModal'),
)

const Home = () => {
  const { t } = useTranslation('Home') // Use Home namespace for translations
  const { isAuthenticated, user, loginCheckStatus } = useSelector(
    state => state.auth,
  )

  const { items: stateItems, category: stateCategory } = useSelector(
    state => state.content,
  )
  const { unreadFriendRequests } = useSelector(state => state.app)
  const { isSearching } = useSelector(state => state.articles)
  const dispatchRedux = useDispatch()
  const navigate = useNavigate()
  const { category } = useParams()
  const toast = useToast()

  const [items, setItems] = useState(stateItems)
  const [page, setPage] = useState(1) // Always start from page 1
  const [load, setLoad] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(true)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const [prevCategory, setPrevCategory] = useState(stateCategory)
  const currentCategoryRef = useRef(category)
  const cancelTokenSourceRef = useRef(null)

  const USER_IQ = user?.IQ_score ?? null
  const notLoggedIn = !isAuthenticated

  const fetchData = useCallback(
    async (pageNum, cat) => {
      if (loginCheckStatus === 'pending' || !hasMoreItems) return

      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel(
          'Operation canceled due to new request.',
        )
      }

      cancelTokenSourceRef.current = axios.CancelToken.source()

      try {
        const response =
          (cat === 'all' || !cat) && !notLoggedIn
            ? await axios.get(
                `/api/recommendation?page=${pageNum}&pageSize=18&lang=${i18n.language}`,
                {
                  cancelToken: cancelTokenSourceRef.current.token,
                },
              )
            : await axios.get(
                `/api/articles?page=${pageNum}&pageSize=18&category=${
                  notLoggedIn && (cat === 'all' || !cat) ? 'top' : cat
                }&lang=${i18n.language}`,
                { cancelToken: cancelTokenSourceRef.current.token },
              )

        if (cat !== currentCategoryRef.current) {
          return
        }

        const newItems = response.data
        if (newItems.length === 0) {
          setHasMoreItems(false)
        } else {
          if (pageNum === 1) {
            setItems(newItems)
            dispatchRedux(setItemsState(newItems))
          } else {
            setItems(prevItems => {
              const updatedItems = [...prevItems, ...newItems]
              dispatchRedux(setItemsState(updatedItems))
              return updatedItems
            })
          }
          dispatchRedux(setPageRedux(pageNum))
        }
        setLoad(false)
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled', error.message)
        } else {
          console.error(error.message)
          toast({
            title: t('fetch_error'), // Use translation for error message
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      }
    },
    [loginCheckStatus, hasMoreItems, notLoggedIn, dispatchRedux, toast, t],
  )

  const handleScroll = useCallback(() => {
    if (isSearching) return
    if (
      !notLoggedIn &&
      window.innerHeight + document.documentElement.scrollTop + 1000 >
        document.documentElement.scrollHeight &&
      hasMoreItems &&
      !load
    ) {
      setLoad(true)
      setPage(prevPage => prevPage + 1)
    }
  }, [hasMoreItems, notLoggedIn, isSearching, load])

  const debouncedHandleScroll = useMemo(
    () => debounce(handleScroll, 300),
    [handleScroll],
  )

  const throttledHandleScroll = useMemo(
    () => throttle(handleScroll, 300),
    [handleScroll],
  )

  const combinedScrollHandler = useCallback(() => {
    throttledHandleScroll()
    debouncedHandleScroll()
  }, [throttledHandleScroll, debouncedHandleScroll])

  const {
    isOpen: isOpenWiseWeb,
    onOpen: onOpenWiseWeb,
    onClose: onCloseWiseWeb,
  } = useDisclosure()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const wiseweb = params.get('wiseweb')

    if (wiseweb) {
      onOpenWiseWeb()
    }
  }, [location, onOpenWiseWeb])

  useEffect(() => {
    if (!category || category === '') {
      navigate('/home/all')
    }
    window.addEventListener('scroll', combinedScrollHandler)

    return () => window.removeEventListener('scroll', combinedScrollHandler)
  }, [category, isAuthenticated, combinedScrollHandler, navigate])

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
      currentCategoryRef.current = category
      fetchData(1, category)
      dispatchRedux(setPageRedux(0))
      dispatchRedux(setItemsState([]))
      setPrevCategory(category)
      // Reset scroll position when category changes
      window.scrollTo(0, 0)
    } else {
      fetchData(page, category)
    }
  }, [category, page, prevCategory, fetchData, dispatchRedux, loginCheckStatus])

  return (
    <Box marginTop={'4rem'} w={'100%'}>
      <Helmet>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <meta name="keywords" content={t('keywords')} />
        <meta property="og:title" content={t('title')} />
        <meta property="og:description" content={t('description')} />
      </Helmet>
      <Suspense fallback={<Spinner />}>
        {isAuthenticated && USER_IQ > 90 && user.societyUpgradeMessage && (
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            title={t('upgrade_modal_title')} // Translation for modal title
            content={t('upgrade_modal_content')} // Translation for modal content
          />
        )}
        <Timeline
          setHasMoreItems={setHasMoreItems}
          hasMoreItems={hasMoreItems}
          data={items}
          load={load}
          setLoad={setLoad}
        />
      </Suspense>
      <WiseWeb
        isOpen={isOpenWiseWeb}
        onClose={onCloseWiseWeb}
        requestNotif={unreadFriendRequests > 0}
        markRequestAsRead={() => dispatchRedux(markFriendRequestsAsRead())}
      />
    </Box>
  )
}

export default Home
