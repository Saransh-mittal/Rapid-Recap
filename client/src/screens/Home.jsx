import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useToast,
  Box,
  Spinner,
  useDisclosure,
  Button,
  Badge,
} from '@chakra-ui/react'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { setPageRedux } from '../redux/uiSlice'
import { setCategory, setItemsState } from '../redux/contentSlice'
import { markFriendRequestsAsRead } from '../redux/appSlice'
import i18n from 'i18next'
import { categoryCache } from '../services/categoryCache'
import slugify from 'slugify'
import { Package, Star, Target, Trophy, Clock, Sparkle } from 'lucide-react'
import GameInventory from '../components/rewards/GameInventory'
import {
  getCategoryFromBoost,
  getCategoryFromRadar,
  isCategoryBoost,
  isCategoryPowerUp,
} from '../utils/helper.utils'
import GameInventoryButton from '../components/rewards/GameInventoryButton'
import { setLoading } from '../redux/inventorySlice'
import { isSpecialCategory } from '../assets/Categories'

const Timeline = React.lazy(() =>
  import('../components/homeComponents/Timeline'),
)
const WiseWeb = React.lazy(() =>
  import('../components/Header-Footer/navbarComponents/WiseWeb'),
)

const Home = () => {
  const { t } = useTranslation('Home')
  const { isAuthenticated, loginCheckStatus, user } = useSelector(
    state => state.auth,
  )
  const { unreadFriendRequests } = useSelector(state => state.app)
  const { isSearching } = useSelector(state => state.articles)
  const dispatchRedux = useDispatch()
  const navigate = useNavigate()
  const { category } = useParams()
  const toast = useToast()

  // Game Inventory states
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [load, setLoad] = useState(true)
  const [hasMoreItems, setHasMoreItems] = useState(true)
  const loadingRef = useRef(false)
  const currentCategoryRef = useRef(category)
  const initialLoadDoneRef = useRef(false)

  const notLoggedIn = !isAuthenticated

  const { availableAbilities, activeAbilities, loading } = useSelector(
    state => state.inventory,
  )

  const fetchData = useCallback(
    async (pageNum, cat) => {
      if (
        !hasMoreItems ||
        loadingRef.current ||
        !cat ||
        loginCheckStatus === 'pending' ||
        loading
      )
        return

      loadingRef.current = true
      setLoad(true)

      try {
        const cachedData = categoryCache.get(cat, pageNum)
        if (cachedData && !categoryCache.isStale(cat, pageNum)) {
          if (pageNum === 1) {
            setItems(cachedData.data)
            dispatchRedux(setItemsState(cachedData.data))
          } else {
            const updatedItems = [...items, ...cachedData.data]
            setItems(updatedItems)
            dispatchRedux(setItemsState(updatedItems))
          }

          if (hasMoreItems) {
            categoryCache.prefetchCategory(
              cat,
              pageNum + 1,
              i18n.language,
              user,
              activeAbilities,
            )
          }

          setLoad(false)
          loadingRef.current = false
          return
        }

        let endpoint

        if (isSpecialCategory(cat)) {
          // Special category API endpoint
          endpoint = `/api/special-categories/${cat}/articles?page=${pageNum}&pageSize=18&lang=${i18n.language}`
        } else if ((cat === 'all' || !cat) && !notLoggedIn) {
          // Recommendations endpoint
          endpoint = `/api/recommendation?page=${pageNum}&pageSize=18&lang=${i18n.language}`
        } else {
          // Regular articles endpoint
          endpoint = `/api/articles?page=${pageNum}&pageSize=18&category=${
            notLoggedIn && (cat === 'all' || !cat) ? 'top' : cat
          }&lang=${i18n.language}`
        }

        const headers =
          user?.categoryPrivileges?.[cat] ||
          ((user?.categoryPrivileges ||
            (activeAbilities &&
              activeAbilities.length > 0 &&
              activeAbilities.some(
                ability =>
                  isCategoryBoost(ability.name) ||
                  isCategoryPowerUp(ability.name),
              ))) &&
            cat === 'all') ||
          (activeAbilities &&
            activeAbilities.length > 0 &&
            activeAbilities.some(
              ability =>
                getCategoryFromBoost(ability.name).toLocaleLowerCase() ===
                  cat ||
                getCategoryFromRadar(ability.name).toLocaleLowerCase() === cat,
            ))
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
            : {}
        const response = await axios.get(endpoint, { headers })

        if (cat !== currentCategoryRef.current) return

        const newItems = response.data
        if (!Array.isArray(newItems) || newItems.length === 0) {
          setHasMoreItems(false)
        } else {
          if (pageNum === 1) {
            setItems(newItems)
            dispatchRedux(setItemsState(newItems))
          } else {
            const updatedItems = [...items, ...newItems]
            setItems(updatedItems)
            dispatchRedux(setItemsState(updatedItems))
          }
          categoryCache.set(cat, pageNum, newItems)
          dispatchRedux(setPageRedux(pageNum))
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error(error.message)

          if (
            loginCheckStatus === 'fulfilled' &&
            !isAuthenticated &&
            location.pathname === 'home/all'
          ) {
            return
          }
          toast({
            title: t('fetch_error'),
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top',
          })
        }
      } finally {
        loadingRef.current = false
        setLoad(false)
      }
    },
    [
      isAuthenticated,
      loginCheckStatus,
      hasMoreItems,
      loading,
      activeAbilities,
      notLoggedIn,
      items,
      dispatchRedux,
      toast,
      t,
    ],
  )

  useEffect(() => {
    if (!category || loginCheckStatus !== 'fulfilled') return

    const handleCategoryChange = async () => {
      if (
        (!initialLoadDoneRef.current ||
          currentCategoryRef.current !== category) &&
        !loading
      ) {
        setPage(1)
        setItems([])
        setHasMoreItems(true)
        loadingRef.current = false
        currentCategoryRef.current = category
        dispatchRedux(setCategory(category.toLowerCase()))

        if (!initialLoadDoneRef.current) {
          initialLoadDoneRef.current = true
        }

        await fetchData(1, category)
        categoryCache.prefetchAdjacentCategories(category, i18n.language, user)
      } else if (page > 1) {
        await fetchData(page, category)
      }
    }

    handleCategoryChange()
  }, [category, page, loginCheckStatus, loading])

  useEffect(() => {
    if (
      loginCheckStatus === 'fulfilled' &&
      !initialLoadDoneRef.current &&
      category &&
      !loading
    ) {
      setPage(1)
      setItems([])
      setHasMoreItems(true)
      loadingRef.current = false
      currentCategoryRef.current = category
      dispatchRedux(setCategory(category.toLowerCase()))
      initialLoadDoneRef.current = true
      fetchData(1, category)
    }
  }, [loginCheckStatus, category, fetchData, loading, dispatchRedux])

  useEffect(() => {
    const locationpathname = window.location.pathname

    if (
      isAuthenticated &&
      locationpathname === '/home' &&
      loginCheckStatus === 'fulfilled'
    ) {
      navigate('/home/all')
    } else if (
      !isAuthenticated &&
      (locationpathname === '/home' || locationpathname === '/home/all') &&
      loginCheckStatus === 'fulfilled'
    ) {
      navigate('/home/top')
    }

    if (!isAuthenticated && loginCheckStatus === 'fulfilled') {
      dispatchRedux(setLoading(false))
    }
  }, [isAuthenticated, loginCheckStatus])

  useEffect(() => {
    return () => {
      initialLoadDoneRef.current = false
      loadingRef.current = false
      setItems([])
      setPage(1)
      setHasMoreItems(true)
    }
  }, [])

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && hasMoreItems && !isSearching && !notLoggedIn) {
      setPage(prev => prev + 1)
    }
  }, [hasMoreItems, isSearching, notLoggedIn])

  const getStructuredData = useMemo(() => {
    const categoryName = category
      ? category.charAt(0).toUpperCase() + category.slice(1)
      : 'Top'

    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${categoryName} GK Questions & Current Affairs Quiz | Rapid Recap`,
      url: `https://rapidrecap.ai/home/${category || ''}`,
      description: t('description'),
      isPartOf: {
        '@type': 'WebSite',
        name: 'Rapid Recap',
        url: 'https://rapidrecap.ai',
      },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: items.map((article, index) => ({
          '@type': 'Article',
          position: index + 1,
          url: `https://rapidrecap.ai/article/${article._id}/${slugify(
            article.title,
          )}`,
          name: article?.title,
          description: article?.description,
          datePublished: article?.date,
          author: {
            '@type': 'Organization',
            name: 'Rapid Recap',
          },
        })),
      },
      about: {
        '@type': 'Thing',
        name: `${categoryName} Knowledge Quiz`,
        description: `Latest ${categoryName} general knowledge questions and current affairs quiz with detailed answers`,
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
      },
      provider: {
        '@type': 'Organization',
        name: 'Rapid Recap',
        logo: {
          '@type': 'ImageObject',
          url: 'https://rapidrecap.ai/images/rrlogo_512.png',
        },
      },
    }
  }, [category, items, t])

  return (
    <Box marginTop={'4.5rem'} w={'100%'} overflow={'hidden'} maxH="92vh">
      <Helmet>
        <link
          rel="canonical"
          href={`https://rapidrecap.ai/home/${category ? category : ''}`}
        />
        <title>
          {t('title')} | {category ? category : 'Top'}
        </title>
        <meta name="description" content={t('description')} />
        <meta name="keywords" content={t('keywords')} />
        <script type="application/ld+json">
          {JSON.stringify(getStructuredData)}
        </script>
      </Helmet>

      <React.Suspense fallback={<Spinner />}>
        <Timeline
          data={items}
          load={load}
          hasMoreItems={hasMoreItems}
          setHasMoreItems={setHasMoreItems}
          setLoad={setLoad}
          onLoadMore={handleLoadMore}
          fetchData={fetchData}
          page={page}
          setPage={setPage}
        />
      </React.Suspense>

      {/* Game Inventory Button */}
      {isAuthenticated && loginCheckStatus === 'fulfilled' && (
        <GameInventoryButton page={'HOME'} />
      )}
    </Box>
  )
}

export default React.memo(Home)
