// /pages/Article.jsx

import React, {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import axios from 'axios'
import { Flex, useToast, Grid, useMediaQuery } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { quinBoostChecker } from '../utils/quiz.utils'
import slugify from 'slugify'
import i18n from 'i18next'
import { blackListedImgUrls } from '../assets/blackListedImgUrls'

import { setArticleData, setTotalUsersGivenQuiz } from '../redux/articleSlice'
import {
  setIsQuinBoostAvailable,
  setQuizLeftToGetQuizBoost,
} from '../redux/quizSlice'
import ArticleFooter from '../components/articleComponents/ArticleFooter'

//SSR images
const rrImage = '/images/rrlogo_HD.webp'

// Lazy load components
const Loading = lazy(() => import('../components/miscellaneous/Loading'))

const QuinBoostModal = lazy(() =>
  import('../components/articleComponents/QuinBoostModal'),
)
const MainArticleContent = lazy(() =>
  import('../components/articleComponents/MainArticleContent'),
)
const Sidebar = lazy(() => import('../components/articleComponents/Sidebar'))
const ArticleHeader = lazy(() =>
  import('../components/articleComponents/ArticleHeader'),
)
const TrackTime = lazy(() =>
  import('../components/articleComponents/TrackTime'),
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
  const { quizLeftToGetQuizBoost, isQuinBoostAvailable } = useSelector(
    state => state.quiz,
  )
  const dispatch = useDispatch()
  const { id } = useParams()

  const [article, setArticle] = useState(articleData)
  const [imgURL, setImgURL] = useState(
    Array.isArray(articleData?.imgURL)
      ? articleData?.imgURL[0]
      : articleData?.imgURL,
  )

  const [articleLoading, setArticleLoading] = useState(
    articleData ? false : true,
  )
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
  const [isLargerThan821] = useMediaQuery('(min-width: 821px)')
  const [bookmark, setBookmark] = useState(false)
  const [isQuizGivenLoading, setIsQuizGivenLoading] = useState(null)
  const quizFetchTimer = useRef(null)

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
    try {
      // setLoadingRelatedArticles(prev => ({ ...prev, [id]: true }))
      const response = await axios.get(
        `/api/articles/article/${id}?lang=${
          user?.userLanguage ? user?.userLanguage : i18n.language
        }`,
      )

      if (user?.userLanguage) {
        setSelectedLanguage(user?.userLanguage === 'hi' ? 'hindi' : 'english')
      }
      const articleData = response.data.newArticle

      dispatch(setArticleData(articleData))
      setArticle(articleData)
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
      setQuizExpired(response.data.quizExpired)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response.data.error || 'Error fetching article',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setArticleLoading(false)
      setLoadingRelatedArticles(prev => ({ ...prev, [id]: false }))
      // window.scrollTo({
      //   top: 0,
      //   behavior: 'smooth',
      // })
    }
  }, [id, toast, loginCheckStatus, user, dispatch])

  const isQuizGiven = useCallback(async () => {
    const userId = user?._id
    if (!userId || !id) {
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
  }, [id, user, givenQuiz])

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

  const handleLanguageChange = useCallback(() => {
    if (i18n.language === 'hi') {
      if (article.hindiTitle) {
        setTitle(prevTitle => ({ ...prevTitle, hindi: article.hindiTitle }))
        setAuthor(prevAuthor => ({
          ...prevAuthor,
          hindi: article.hindiAuthor,
        }))
        setMainText(prevMainText => ({
          ...prevMainText,
          hindi: article.hindiMainText,
        }))
      }
    }
  }, [article, id, toast])

  const trackGenerateQuizClick = useCallback(() => {
    ReactGA.send({
      hitType: 'event',
      eventCategory: 'Generate Quiz Click',
      eventAction: 'Click',
      eventLabel: 'Generate Quiz Button',
    })
  }, [])

  useEffect(() => {
    document.title = 'Article page'
    quinBoostChecker({
      setIsQuinBoostAvailable,
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
    isQuizGiven()
  }, [givenQuiz, isQuizGiven])

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
  }, [])

  const handleThemeChange = useCallback(newThemedContent => {
    setThemedContent(newThemedContent)
  }, [])
  return (
    <Suspense fallback={<Loading />}>
      <Flex w={'100vw'}>
        <Flex
          className="article-page"
          marginTop={'4.5rem'}
          flexDirection={'column'}
          w={'100vw'}
          overflow={'hidden'}
          minH={'100vh'}
        >
          <Helmet>
            <title>{`${title[selectedLanguage]} | Rapid Recap`}</title>
            <meta
              name="description"
              content={mainText[selectedLanguage]?.[0]?.substring(0, 160)}
            />
            <meta
              name="keywords"
              content={`${article?.category}, news, current events, ${title[
                selectedLanguage
              ]
                ?.toLowerCase()
                ?.split(' ')
                ?.join(', ')}`}
            />
            <meta
              property="og:title"
              content={`${title[selectedLanguage]} | Rapid Recap`}
            />
            <meta
              property="og:description"
              content={mainText[selectedLanguage]?.[0]?.substring(0, 160)}
            />
            <meta property="og:image" content={imgURL} />
            <meta property="og:type" content="article" />
            <meta
              property="og:url"
              content={`https://www.rapidrecap.co.in/article/${id}/${slugify(
                title['english'],
              )}`}
            />
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              name="twitter:title"
              content={`${title[selectedLanguage]} | Rapid Recap`}
            />
            <meta
              name="twitter:description"
              content={mainText[selectedLanguage]?.[0]?.substring(0, 160)}
            />
            <meta name="twitter:image" content={imgURL} />
            <link
              rel="canonical"
              href={`https://www.rapidrecap.co.in/article/${id}/${slugify(
                title['english'],
              )}`}
            />
            <script type="application/ld+json">
              {`
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.rapidrecap.co.in/article/${id}/${slugify(
                title['english'],
              )}"
      },
      "headline": "${title[selectedLanguage]}",
      "image": ["${imgURL}"],
      "datePublished": "${article?.dateTime}",
      "dateModified": "${article?.dateTime}",
      "author": {
        "@type": "Person",
        "name": "${author[selectedLanguage]}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Rapid Recap",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.rapidrecap.co.in/images/rrlogo.png"
        }
      },
      "description": "${mainText[selectedLanguage]?.[0]?.substring(0, 160)}"
    }
    `}
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
                  avgTimeRead={avgTimeRead}
                  dateTime={dateTime}
                  bookmarkStatus={bookmarkStatus}
                  article={article}
                  isQuinBoostAvailable={isQuinBoostAvailable}
                  quizLeftToGetQuizBoost={quizLeftToGetQuizBoost}
                  openModal={openModal}
                  onThemeChange={handleThemeChange}
                />
              </header>
            </Flex>
            <Grid
              templateColumns={isLargerThan821 ? 'minmax(0, 9fr) 5fr' : '1fr'}
              gap={10}
              minH={'85vh'}
              px={{ base: '20px', md: '50px' }}
              marginTop={0}
              className="article-all-content"
            >
              <MainArticleContent
                imgURL={
                  (!blackListedImgUrls.find(url => url === imgURL) && imgURL) ||
                  rrImage
                }
                selectedLanguage={selectedLanguage}
                mainText={mainText}
                textRef={textRef}
                articleRef={articleRef}
                articleLoading={articleLoading}
                themedContent={themedContent}
                SourceURL={articleData?.url}
              />

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
            <ArticleFooter />
          </article>
        </Flex>

        <QuinBoostModal
          isOpen={isQuinBoostModalOpen}
          onClose={closeModal}
          currentQuizCount={user?.todaysQuizCnt}
          isStateBoosted={isBoosted}
        />
        {user && <TrackTime userId={user?._id} articleId={id} />}
      </Flex>
    </Suspense>
  )
}

export default Article
