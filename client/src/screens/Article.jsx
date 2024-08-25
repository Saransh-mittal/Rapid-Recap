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
import {
  Flex,
  useToast,
  useDisclosure,
  Grid,
  useMediaQuery,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import imageData from '../assets/AltNewsImage'
import { quinBoostChecker } from '../utils/quiz.utils'
import slugify from 'slugify'
import i18n from 'i18next'

const Loading = lazy(() => import('../components/miscellaneous/Loading'))
const Quiz = lazy(() => import('../components/articleComponents/Quiz'))
const SelectQuizLangModal = lazy(() =>
  import('../components/articleComponents/SelectQuizLangModal'),
)
const ExpectedIQModal = lazy(() =>
  import('../components/articleComponents/ExpectedIQModal'),
)
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
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { isBoosted } = useSelector(state => state.app)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { id } = useParams()

  const [alt_image, setAlt_image] = useState(null)
  const [article, setArticle] = useState(null)
  const [imgURL, setImgURL] = useState('')

  const [load, setLoad] = useState(true)
  const [articleLoading, setArticleLoading] = useState(true)
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
  const [showExpectedIQ, setShowExpectedIQ] = useState(false)
  const [expectedIQ, setExpectedIQ] = useState(null)
  const [totalUsersGivenQuiz, setTotalUsersGivenQuiz] = useState(null)
  const [title, setTitle] = useState({ english: '', hindi: '' })
  const [dateTime, setDateTime] = useState('')
  const [avgTimeRead, setAvgTimeRead] = useState(0)
  const [author, setAuthor] = useState({ english: '', hindi: '' })
  const [mainText, setMainText] = useState({ english: [], hindi: [] })
  const [translateLoading, setTranslateLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('hindi')
  const [isQuinBoostAvailable, setIsQuinBoostAvailable] = useState(false)
  const [quizLeftToGetQuizBoost, setQuizLeftToGetQuizBoost] = useState(5)
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
      const endpoint =
        i18n.language === 'en'
          ? `/api/articles/genQuiz/${id}`
          : `/api/articles/genHindiQuiz/${id}`
      await axios.put(endpoint)
      console.log('Quiz generated')
    } catch (error) {
      console.log(error.message)
    }
  }, [id, i18n.language])

  const bookmarkStatus = useCallback(
    async ({ view, update }) => {
      if (notLoggedIn) return
      try {
        setBookmark(true)
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
    try {
      const response = await axios.get(`/api/articles/article/${id}`)
      const articleData = response.data.newArticle
      setArticle(articleData)
      setTotalUsersGivenQuiz(articleData.quizAttemptCnt)

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
    }
  }, [id, toast])

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
      setLoad(false)
    }
  }, [id])

  const getExpectedIQ = useCallback(async () => {
    try {
      const articlePage = document.querySelector('.article-page')
      document.querySelector('body').style.overflow = 'hidden'
      const overlay = document.createElement('div')
      overlay.classList.add('custom-overlay')
      const overlayNav = document.createElement('div')
      overlayNav.classList.add('custom-overlay-nav')
      articlePage.appendChild(overlay)
      document.querySelector('.navbar').appendChild(overlayNav)
      articlePage.classList.add('shepherd-active')
      const loadingOverlay = document.createElement('div')
      loadingOverlay.classList.add('loading-overlay')
      const spinnerContainer = document.createElement('div')
      spinnerContainer.classList.add('spinner-container')
      const loadingSpinner = document.createElement('div')
      loadingSpinner.classList.add('loading-spinner')
      spinnerContainer.appendChild(loadingSpinner)
      loadingOverlay.appendChild(spinnerContainer)
      articlePage.appendChild(loadingOverlay)

      const response = await axios.get(`/api/user/expectedIQScore`)
      setShowExpectedIQ(true)
      setExpectedIQ(response.data.ExpectedIQScore)
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response.data.error || 'Error checking for expected IQ',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      const loadingOverlay = document.querySelector('.loading-overlay')
      if (loadingOverlay) loadingOverlay.remove()
      document.querySelector('body').style.overflow = 'auto'
      const overlay = document.querySelector('.custom-overlay')
      if (overlay) overlay.remove()
      const overlayNav = document.querySelector('.custom-overlay-nav')
      if (overlayNav) overlayNav.remove()
      const articlePage = document.querySelector('.article-page')
      articlePage.classList.remove('shepherd-active')
    }
  }, [toast])

  const handleLanguageChange = useCallback(
    async event => {
      setTranslateLoading(true)
      try {
        // if (event.target.value === 'hindi') {
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
          } else {
            toast({
              title: 'Wait',
              description: 'Hindi translation Might Take 1 minute',
              status: 'info',
              duration: 9000,
              isClosable: true,
              position: 'top',
            })
            const response = await axios.get(
              `/api/articles/hindiTranslation/${id}`,
            )
            if (response.data.status === 'ok') {
              setArticle(response.data.article)
              setTitle(prevTitle => ({
                ...prevTitle,
                hindi: response.data.article.hindiTitle,
              }))
              setAuthor(prevAuthor => ({
                ...prevAuthor,
                hindi: response.data.article.hindiAuthor,
              }))
              setMainText(prevMainText => ({
                ...prevMainText,
                hindi: response.data.article.hindiMainText,
              }))
            }
          }
          setSelectedLanguage('hindi')
        } else {
          setSelectedLanguage('english')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'error setting language',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setTranslateLoading(false)
      }
    },
    [article, id, toast],
  )

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
    quinBoostChecker({ setIsQuinBoostAvailable, setQuizLeftToGetQuizBoost })
    fetchArticle()

    quizFetchTimer.current = setTimeout(() => {
      fetchQuiz()
    }, 5000)

    return () => {
      if (quizFetchTimer.current) {
        clearTimeout(quizFetchTimer.current)
      }
    }
  }, [fetchArticle, fetchQuiz])

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
    setAlt_image(
      imageData.find(
        img =>
          img?.category?.toLocaleLowerCase() ===
          article?.category?.toLocaleLowerCase(),
      )?.image,
    )
  }, [article?.category])

  return (
    <Suspense fallback={<Loading />}>
      <Flex w={'100vw'}>
        {/* {showQuizLangModal && (
          <SelectQuizLangModal
            setSelectLanForQuiz={setSelectLanForQuiz}
            setShowQuizLangModal={setShowQuizLangModal}
          />
        )} */}
        {showExpectedIQ && expectedIQ && (
          <ExpectedIQModal
            expectedIQ={expectedIQ}
            setShowExpectedIQ={setShowExpectedIQ}
          />
        )}
        {showQuiz && !givenQuiz && (
          // && !showQuizLangModal
          <Quiz
            setTotalUsersGivenQuiz={setTotalUsersGivenQuiz}
            setIsQuinBoostAvailable={setIsQuinBoostAvailable}
            setQuizLeftToGetQuizBoost={setQuizLeftToGetQuizBoost}
            isQuinBoostAvailable={isQuinBoostAvailable}
            article={article}
            isOpen={isOpen || true}
            onClose={() => {
              onClose()
              setShowQuiz(false)
            }}
            ofShowQuiz={() => {
              setShowQuiz(false)
              setGivenQuiz(true)
              user.IQ_score === 0 && getExpectedIQ()
            }}
            language={i18n.language === 'en' ? 'english' : 'hindi'}
          />
        )}
        {load ? (
          <Loading />
        ) : (
          <Flex
            className="article-page"
            marginTop={'4.5rem'}
            flexDirection={'column'}
            w={'100vw'}
            overflow={'hidden'}
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
                  .toLowerCase()
                  .split(' ')
                  .join(', ')}`}
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
                    handleLanguageChange={handleLanguageChange}
                    avgTimeRead={avgTimeRead}
                    dateTime={dateTime}
                    bookmarkStatus={bookmarkStatus}
                    article={article}
                    isQuinBoostAvailable={isQuinBoostAvailable}
                    quizLeftToGetQuizBoost={quizLeftToGetQuizBoost}
                    openModal={openModal}
                    i18n={i18n}
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
                  translateLoading={translateLoading}
                  selectedLanguage={selectedLanguage}
                  title={title}
                  author={author}
                  mainText={mainText}
                  imgURL={imgURL}
                  alt_image={alt_image}
                  textRef={textRef}
                  articleRef={articleRef}
                  textHeight={textHeight}
                  handleLanguageChange={handleLanguageChange}
                  dateTime={dateTime}
                  avgTimeRead={avgTimeRead}
                  bookmark={bookmark}
                  bookmarkStatus={bookmarkStatus}
                  articleLoading={articleLoading}
                />

                <Sidebar
                  givenQuiz={givenQuiz}
                  percentile={percentile}
                  RQM_score={RQM_score}
                  onGoingQuiz={onGoingQuiz}
                  quizExpired={quizExpired}
                  isQuinBoostAvailable={isQuinBoostAvailable}
                  trackGenerateQuizClick={trackGenerateQuizClick}
                  setShowQuiz={setShowQuiz}
                  showQuiz={showQuiz}
                  onOpen={onOpen}
                  totalUsersGivenQuiz={totalUsersGivenQuiz}
                  articleHeight={articleHeight}
                  article={article}
                  id={id}
                  isQuizGivenLoading={isQuizGivenLoading}
                />
              </Grid>
            </article>
          </Flex>
        )}
        <QuinBoostModal
          isOpen={isQuinBoostModalOpen}
          onClose={closeModal}
          quizLeftToGetQuizBoost={quizLeftToGetQuizBoost}
          isStateBoosted={isBoosted}
        />
        {user && <TrackTime userId={user?._id} articleId={id} />}
      </Flex>
    </Suspense>
  )
}

export default Article
