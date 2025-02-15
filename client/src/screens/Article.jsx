// /pages/Article.jsx

import React, {
  lazy,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react'
import axios from 'axios'
import { Flex, useToast, Grid, useMediaQuery, Box } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { quinBoostChecker } from '../utils/quiz.utils'
import slugify from 'slugify'
import i18n from 'i18next'
import { blackListedImgUrls } from '../assets/blackListedImgUrls'

import { setArticleData, setTotalUsersGivenQuiz } from '../redux/articleSlice'
import { setQuizLeftToGetQuizBoost } from '../redux/quizSlice'
import ArticleFooter from '../components/articleComponents/ArticleFooter'
import { useReadingProgress } from '../customHooks/useReadingProgress'
import PremiumCTA from '../components/articleComponents/PremiumCTA'
import PremiumValueBanner from '../components/articleComponents/PremiumValueBanner'
import { saveVisitedArticle } from '../utils/article.utils'
import { articleCacheService } from '../lib/cache/services/articleCache'
import MainArticleContent from '../components/articleComponents/MainArticleContent'
import Sidebar from '../components/articleComponents/Sidebar'
import ArticleHeader from '../components/articleComponents/ArticleHeader'
import TrackTime from '../components/articleComponents/TrackTime'
import MainArticleContentSkeleton from '../components/articleComponents/loaders/MainArticleContentSkeleton'
import StreakSurgeModal from '../components/articleComponents/StreakSurgeModal'
import CategoryBoostModal from '../components/articleComponents/CategoryBoostModal'
//SSR images
const fallback_news_image = '/images/fallback_news_image.webp'

const QuinBoostModal = lazy(() =>
  import('../components/articleComponents/QuinBoostModal'),
)
const Article = () => {
  const toast = useToast()
  const { isAuthenticated, user, loginCheckStatus } = useSelector(
    state => state.auth,
  )
  const { isBoosted } = useSelector(state => state.app)
  const { articleData, totalUsersGivenQuiz } = useSelector(
    state => state.articles,
  )
  const { isQuinBoostAvailable } = useSelector(state => state.quiz)
  const dispatch = useDispatch()
  const { id } = useParams()

  const [article, setArticle] = useState(articleData)
  const [imgURL, setImgURL] = useState(
    Array.isArray(articleData?.imgURL)
      ? articleData?.imgURL[0]
      : articleData?.imgURL,
  )

  const [articleLoading, setArticleLoading] = useState(true)
  const [loadingRealatedArticles, setLoadingRelatedArticles] = useState({})
  const [shouldScrollToTop, setShouldScrollToTop] = useState(false)
  const [themedContent, setThemedContent] = useState(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [textHeight, setTextHeight] = useState(0)
  const [articleHeight, setArticleHeight] = useState(0)
  const [givenQuiz, setGivenQuiz] = useState(null)
  const textRef = useRef()
  const articleRef = useRef()
  const [percentile, setPercentile] = useState(null)
  const [RQM_score, setRQM_score] = useState(null)
  const [onGoingQuiz, setOnGoingQuiz] = useState(null)
  const [quizExpired, setQuizExpired] = useState(null)
  const readProgress = useReadingProgress()
  const [dictionary, setDictionary] = useState([])
  const [importantSentences, setImportantSentences] = useState([])

  const [title, setTitle] = useState({
    english: articleData?.title || '',
    hindi: articleData?.hindiTitle || '',
  })
  const [dateTime, setDateTime] = useState(articleData?.date)
  const [avgTimeRead, setAvgTimeRead] = useState(articleData?.avgReadTime)
  const [author, setAuthor] = useState({
    english: articleData?.author,
    hindi: articleData?.hindiAuthor,
  })
  const [mainText, setMainText] = useState({
    english: articleData?.mainText,
    hindi: articleData?.hindiMainText,
  })
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language === 'en' ? 'english' : 'hindi',
  )

  const [isQuinBoostModalOpen, setIsQuinBoostModalOpen] = useState(false)
  const [isStreakSurgeModalOpen, setIsStreakSurgeModalOpen] = useState(false)
  const [isCategoryBoostModalOpen, setIsCategoryBoostModalOpen] =
    useState(false)
  const [isLargerThan821] = useMediaQuery('(min-width: 821px)')
  const [bookmark, setBookmark] = useState(false)
  const [isQuizGivenLoading, setIsQuizGivenLoading] = useState(true)

  const notLoggedIn = !isAuthenticated

  const openModal = useCallback(() => setIsQuinBoostModalOpen(true), [])
  const closeModal = useCallback(() => setIsQuinBoostModalOpen(false), [])

  const fetchQuiz = useCallback(async () => {
    try {
      const endpoint = `/api/quiz/getQuiz/${id}/${i18n.language}`

      await axios.get(endpoint)
    } catch (error) {
      console.log(error.message)
    }
  }, [id, i18n.language])

  const bookmarkStatus = useCallback(
    async ({ view, update }) => {
      if (notLoggedIn) return
      try {
        update && setBookmark(true)
        const response = await axios.get(
          `/api/user/bookmark?articleId=${id}&view=${view}&update=${update}`,
        )
        setBookmark(response.data.bookmarkStatus)
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response.data.error || 'Error Bookmark Status',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
        setBookmark(false)
      }
    },
    [id, notLoggedIn, toast],
  )

  const fetchArticle = useCallback(async () => {
    if (loginCheckStatus === 'pending') return

    // Try to get from cache first
    const cachedResponse = await articleCacheService.getArticle(id)
    if (cachedResponse) {
      // Use cached data
      const articleData = cachedResponse.newArticle

      if (user?.userLanguage) {
        setSelectedLanguage(user?.userLanguage === 'hi' ? 'hindi' : 'english')
      }
      dispatch(setArticleData(articleData))
      setArticle(articleData)
      saveVisitedArticle(articleData)
      dispatch(setTotalUsersGivenQuiz(articleData.quizAttemptCnt))

      const image = Array.isArray(articleData.imgURL)
        ? articleData.imgURL[0]
        : articleData.imgURL
      setImgURL(image)
      setDateTime(articleData.date)
      setAvgTimeRead(articleData.avgReadTime)
      setTitle({
        english: articleData.title,
        hindi: articleData.hindiTitle,
      })
      setAuthor({
        english: articleData.author,
        hindi: articleData.hindiAuthor,
      })
      setMainText({
        english: articleData.mainText,
        hindi: articleData.hindiMainText,
      })
      setDictionary(articleData.dictionary || [])
      setImportantSentences(articleData.importantSentences || [])
      setQuizExpired(cachedResponse.quizExpired) // Using from full response
      setArticleLoading(false)
      setLoadingRelatedArticles(prev => ({ ...prev, [id]: false }))
    }

    try {
      const headers =
        user && isAuthenticated
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}
      // Always fetch fresh data
      const response = await axios.get(
        `/api/articles/article/${id}?lang=${
          user?.userLanguage ? user?.userLanguage : i18n.language
        }`,
        { headers },
      )

      // Cache the full response data
      articleCacheService.cacheArticle(id, response.data)

      const articleData = response.data.newArticle

      // Update UI with fresh data
      if (user?.userLanguage) {
        setSelectedLanguage(user?.userLanguage === 'hi' ? 'hindi' : 'english')
      }

      dispatch(setArticleData(articleData))
      setArticle(articleData)
      saveVisitedArticle(articleData)
      dispatch(setTotalUsersGivenQuiz(articleData.quizAttemptCnt))

      const image = Array.isArray(articleData.imgURL)
        ? articleData.imgURL[0]
        : articleData.imgURL
      setImgURL(image)
      setDateTime(articleData.date)
      setAvgTimeRead(articleData.avgReadTime)
      setTitle({ english: articleData.title, hindi: articleData.hindiTitle })
      setAuthor({ english: articleData.author, hindi: articleData.hindiAuthor })
      setMainText({
        english: articleData.mainText,
        hindi: articleData.hindiMainText,
      })

      if (
        !cachedResponse ||
        !cachedResponse?.newArticle ||
        !cachedResponse?.newArticle?.dictionary
      ) {
        setDictionary(articleData.dictionary || [])
      }

      if (
        !cachedResponse ||
        !cachedResponse?.newArticle ||
        !cachedResponse?.newArticle?.importantSentences
      ) {
        setImportantSentences(articleData.importantSentences || [])
      }
      setQuizExpired(response.data.quizExpired) // Using from full response
    } catch (error) {
      // Only show error if we don't have cached data
      if (!cachedResponse) {
        toast({
          title: 'Error',
          description: error?.response?.data?.error || 'Error fetching article',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      }
      console.error(error)
    } finally {
      setArticleLoading(false)
      setLoadingRelatedArticles(prev => ({ ...prev, [id]: false }))
    }
  }, [id, toast, loginCheckStatus, user?.userLanguage, dispatch])

  const isQuizGiven = useCallback(async () => {
    const userId = user?._id
    if ((!userId || !id) && loginCheckStatus === 'fulfilled') {
      setGivenQuiz(false)
      setIsQuizGivenLoading(false)
      return
    }
    setIsQuizGivenLoading(true)
    try {
      const response = await axios.get(`/api/quiz/given/${id}/${userId}`)
      if (response.data.given) {
        setPercentile(response.data.percentile)
        setRQM_score(response.data.RQM_score)
        setGivenQuiz(true)
      }
    } catch (error) {
      console.log(error.message)
      setGivenQuiz(false)
    } finally {
      setIsQuizGivenLoading(false)
    }
  }, [id, user, givenQuiz, loginCheckStatus])

  const checkOnGoingQuiz = useCallback(async () => {
    try {
      const response = await axios.get(`/api/articles/quizStatus/${id}`)
      setOnGoingQuiz(response.data.status)
    } catch (error) {
      console.log(error.message)
      setOnGoingQuiz(false)
    } finally {
      localStorage.setItem('isQuizGivenCalled', true)
    }
  }, [id])

  const trackGenerateQuizClick = useCallback(() => {
    ReactGA.send({
      hitType: 'event',
      eventCategory: 'Generate Quiz Click',
      eventAction: 'Click',
      eventLabel: 'Generate Quiz Button',
    })
  }, [])

  useEffect(() => {
    quinBoostChecker({
      setQuizLeftToGetQuizBoost,
      dispatch,
    })
    fetchArticle()

    fetchQuiz()
  }, [fetchArticle, fetchQuiz, loginCheckStatus])

  useEffect(() => {
    checkOnGoingQuiz()
    bookmarkStatus({ view: true, update: false })
  }, [notLoggedIn, checkOnGoingQuiz, bookmarkStatus])

  useEffect(() => {
    if (loginCheckStatus === 'fulfilled') {
      isQuizGiven()
    }
  }, [loginCheckStatus, totalUsersGivenQuiz])

  useEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.getBoundingClientRect().height)
    }
    if (articleRef.current) {
      setArticleHeight(articleRef.current.getBoundingClientRect().height)
    }
  }, [article, textHeight])

  useEffect(() => {
    // scroll to the top of the page
    window.scrollTo(0, 0)
    if (articleData) {
      setArticleLoading(false)
    }
    return () => {
      // clear articleData in redux
      dispatch(setArticleData(null))
    }
  }, [])

  const handleThemeChange = useCallback(newThemedContent => {
    setThemedContent(newThemedContent)
  }, [])

  const getStructuredData = useMemo(() => {
    const articleUrl = `https://rapidrecap.ai/article/${id}/${slugify(
      title['english'],
    )}`

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      headline: title[selectedLanguage],
      description:
        article?.description ||
        mainText[selectedLanguage]?.[0]?.substring(0, 160),
      image: {
        '@type': 'ImageObject',
        url: imgURL || fallback_news_image,
        width: '1200',
        height: '630',
      },
      datePublished: article?.dateTime,
      dateModified: article?.dateTime,
      author: {
        '@type': 'Person',
        name: author[selectedLanguage],
        url: 'https://rapidrecap.ai',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Rapid Recap',
        logo: {
          '@type': 'ImageObject',
          url: 'https://rapidrecap.ai/images/rrlogo.png',
          width: '512',
          height: '512',
        },
      },
      articleSection: article?.category,
      keywords: article?.keywords?.join(', '),
      inLanguage: selectedLanguage === 'hindi' ? 'hi' : 'en',
      isAccessibleForFree: true,
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ReadAction',
        userInteractionCount: totalUsersGivenQuiz,
      },
      potentialAction: [
        {
          '@type': 'ReadAction',
          target: [articleUrl],
        },
        {
          '@type': 'AssessAction',
          target: [`${articleUrl}/quiz`],
          description:
            'Test your knowledge with an AI-powered quiz on this article',
        },
      ],
      isPartOf: {
        '@type': 'WebSite',
        name: 'Rapid Recap',
        url: 'https://rapidrecap.ai',
      },
    }
  }, [
    id,
    title,
    selectedLanguage,
    imgURL,
    article,
    author,
    totalUsersGivenQuiz,
    mainText,
  ])

  return (
    <Flex w={'100vw'}>
      <Flex
        className="article-page"
        marginTop={'2.75rem'}
        flexDirection={'column'}
        w={'100vw'}
        overflow={'hidden'}
        minH={'100vh'}
      >
        <Helmet>
          <title>{`${title[selectedLanguage]} | Rapid Recap - AI-Powered GK Quiz`}</title>
          {/* Primary Meta Tags */}
          <meta
            name="description"
            content={
              article?.description ||
              mainText[selectedLanguage]?.[0]?.substring(0, 160)
            }
          />
          <meta
            name="keywords"
            content={`${article?.keywords?.join(
              ', ',
            )}, GK quiz, current affairs, general knowledge test`}
          />
          <meta name="author" content={author[selectedLanguage]} />
          <meta
            name="language"
            content={selectedLanguage === 'hindi' ? 'hi' : 'en'}
          />

          {/* Open Graph Meta Tags */}
          <meta
            property="og:title"
            content={`${title[selectedLanguage]} | Rapid Recap - Test Your Knowledge`}
          />
          <meta
            property="og:description"
            content={
              article?.description ||
              mainText[selectedLanguage]?.[0]?.substring(0, 160)
            }
          />
          <meta property="og:image" content={imgURL || fallback_news_image} />
          <meta property="og:type" content="article" />
          <meta
            property="og:url"
            content={`https://rapidrecap.ai/article/${id}/${slugify(
              title['english'],
            )}`}
          />
          <meta property="og:site_name" content="Rapid Recap" />
          <meta
            property="og:locale"
            content={selectedLanguage === 'hindi' ? 'hi_IN' : 'en_US'}
          />
          <meta property="article:published_time" content={article?.dateTime} />
          <meta property="article:author" content={author[selectedLanguage]} />
          <meta property="article:section" content={article?.category} />
          {article?.keywords?.map(keyword => (
            <meta property="article:tag" content={keyword} key={keyword} />
          ))}

          {/* Twitter Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={`${title[selectedLanguage]} | Rapid Recap`}
          />
          <meta
            name="twitter:description"
            content={
              article?.description ||
              mainText[selectedLanguage]?.[0]?.substring(0, 160)
            }
          />
          <meta name="twitter:image" content={imgURL || fallback_news_image} />
          <meta name="twitter:site" content="@rapidrecap" />

          {/* Canonical URL */}
          <link
            rel="canonical"
            href={`https://rapidrecap.ai/article/${id}/${slugify(
              title['english'],
            )}`}
          />

          {/* Alternate Language Links */}
          <link
            rel="alternate"
            hrefLang="en"
            href={`https://rapidrecap.ai/article/${id}/${slugify(
              title['english'],
            )}`}
          />
          <link
            rel="alternate"
            hrefLang="hi"
            href={`https://rapidrecap.ai/article/${id}/${slugify(
              title['hindi'] || title['english'],
            )}`}
          />

          {/* Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify(getStructuredData)}
          </script>
        </Helmet>
        <article>
          <Flex
            justifyContent={'center'}
            mt={5}
            px={{ base: '20px', md: '50px' }}
            w={'100%'}
          >
            <header
              style={{
                height: '100%',
                width: '100%',
              }}
            >
              <ArticleHeader
                title={title}
                author={author}
                selectedLanguage={selectedLanguage}
                bookmark={bookmark}
                articleLoading={articleLoading}
                avgTimeRead={avgTimeRead}
                dateTime={dateTime}
                bookmarkStatus={bookmarkStatus}
                article={article}
                openStreakSurgeModal={() => setIsStreakSurgeModalOpen(true)}
                openCategoryBoostModal={() => setIsCategoryBoostModalOpen(true)}
                openModal={openModal}
                onThemeChange={handleThemeChange}
              />
            </header>
          </Flex>
          {!isAuthenticated && loginCheckStatus === 'fulfilled' && (
            <Box px={{ base: 4, md: 6 }}>
              <PremiumValueBanner />
            </Box>
          )}
          <Grid
            templateColumns={isLargerThan821 ? 'minmax(0, 9fr) 5fr' : '1fr'}
            gap={10}
            minH={'85vh'}
            px={{ base: '20px', md: '50px' }}
            marginTop={0}
            className="article-all-content"
          >
            {articleLoading ? (
              <MainArticleContentSkeleton />
            ) : (
              <MainArticleContent
                imgURL={
                  (!blackListedImgUrls.find(url => url === imgURL) && imgURL) ||
                  fallback_news_image
                }
                selectedLanguage={selectedLanguage}
                mainText={mainText}
                textRef={textRef}
                articleRef={articleRef}
                articleLoading={articleLoading}
                themedContent={themedContent}
                SourceURL={articleData?.url}
                dictionary={dictionary}
                importantSentences={importantSentences}
              />
            )}

            <Sidebar
              setShouldScrollToTop={setShouldScrollToTop}
              shouldScrollToTop={shouldScrollToTop}
              givenQuiz={givenQuiz}
              percentile={percentile}
              RQM_score={RQM_score}
              onGoingQuiz={onGoingQuiz}
              quizExpired={quizExpired}
              isQuinBoostAvailable={isQuinBoostAvailable}
              trackGenerateQuizClick={trackGenerateQuizClick}
              setShowQuiz={setShowQuiz}
              showQuiz={showQuiz}
              loadingRealatedArticles={loadingRealatedArticles}
              setLoadingRelatedArticles={setLoadingRelatedArticles}
              totalUsersGivenQuiz={totalUsersGivenQuiz}
              articleHeight={articleHeight}
              article={article}
              id={id}
              isQuizGivenLoading={isQuizGivenLoading}
              i18n={i18n}
            />
          </Grid>
          {!isAuthenticated && loginCheckStatus === 'fulfilled' && (
            <PremiumCTA readProgress={readProgress} />
          )}
          <ArticleFooter />
        </article>
      </Flex>
      <StreakSurgeModal
        isOpen={isStreakSurgeModalOpen}
        onClose={() => setIsStreakSurgeModalOpen(false)}
        isStreakBoosted={isBoosted}
      />
      <CategoryBoostModal
        isOpen={isCategoryBoostModalOpen}
        onClose={() => setIsCategoryBoostModalOpen(false)}
        isBoostActive={true}
      />
      <QuinBoostModal
        isOpen={isQuinBoostModalOpen}
        onClose={closeModal}
        currentQuizCount={user?.todaysQuizCnt}
        isStateBoosted={isBoosted}
      />

      {user && <TrackTime userId={user?._id} articleId={id} />}
    </Flex>
  )
}

export default Article
