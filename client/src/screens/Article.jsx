import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../contextAPI/appContext'
import axios from 'axios'
import {
  Flex,
  useToast,
  useDisclosure,
  Grid,
  useMediaQuery,
} from '@chakra-ui/react'
import Loading from '../components/miscellaneous/Loading'
import Quiz from '../components/articleComponents/Quiz'
import SelectQuizLangModal from '../components/articleComponents/SelectQuizLangModal'
import ExpectedIQModal from '../components/articleComponents/ExpectedIQModal'
import QuinBoostModal from '../components/articleComponents/QuinBoostModal'
import { useArticlePageTour } from '../customHooks/useTours'
import { useQuinBoostTour } from '../customHooks/useTours'
// import ArticleHeader from "../components/articleComponents/ArticleHeader";
import MainArticleContent from '../components/articleComponents/MainArticleContent'
import Sidebar from '../components/articleComponents/Sidebar'
import imageData from '../assets/AltNewsImage'
import { quinBoostChecker } from '../utils/quiz.utils'
import { useParams } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Helmet } from 'react-helmet'
import TrackTime from '../components/articleComponents/TrackTime' // Import TrackTime component
import { useSelector } from 'react-redux'

const Article = () => {
  const toast = useToast()
  const { state } = useContext(AppContext)
  const { isAuthenticated, user } = useSelector(state => state.auth)

  const data = state.news
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [alt_image, setAlt_image] = useState(
    imageData.find(
      img =>
        img?.category?.toLocaleLowerCase() ===
        data?.category?.toLocaleLowerCase(),
    )?.image,
  )
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [imgURL, setImgURL] = useState('')
  const [latestNews, setLatestNews] = useState([])
  const [load, setLoad] = useState(true)
  const [articleLoading, setArticleLoading] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [textHeight, setTextHeight] = useState(0)
  const [articleHeight, setArticleHeight] = useState(0)
  const [givenQuiz, setGivenQuiz] = useState(false)
  const textRef = useRef()
  const articleRef = useRef()
  const [percentile, setPercentile] = useState(null)
  const [RQM_score, setRQM_score] = useState(null)
  const [onGoingQuiz, setOnGoingQuiz] = useState(false)
  const [quizExpired, setQuizExpired] = useState(false)
  const [showExpectedIQ, setShowExpectedIQ] = useState(false)
  const [expectedIQ, setExpectedIQ] = useState(null)
  const [totalUsersGivenQuiz, setTotalUsersGivenQuiz] = useState(0)
  const [title, setTitle] = useState({ english: '', hindi: '' })
  const [dateTime, setDateTime] = useState('')
  const [avgTimeRead, setAvgTimeRead] = useState(0)
  const [author, setAuthor] = useState({ english: '', hindi: '' })
  const [mainText, setMainText] = useState({ english: [], hindi: [] })
  const [translateLoading, setTranslateLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('english')
  const [showQuizLangModal, setShowQuizLangModal] = useState(false)
  const [selectLanForQuiz, setSelectLanForQuiz] = useState('english')
  const [isQuinBoostAvailable, setIsQuinBoostAvailable] = useState(false)
  const [quizLeftToGetQuizBoost, setQuizLeftToGetQuizBoost] = useState(5)
  const { tour, isTutorialTakenCheck } = useArticlePageTour()
  const { quinTour } = useQuinBoostTour()
  const [isQuinBoostModalOpen, setIsQuinBoostModalOpen] = useState(false)
  const [isLargerThan820] = useMediaQuery('(min-width: 820px)')
  const [bookmark, setBookmark] = useState(false)
  const [isQuizGivenLoading, setIsQuizGivenLoading] = useState(true)
  const quizFetchTimer = useRef(null)

  const notLoggedIn = !isAuthenticated

  const openModal = () => setIsQuinBoostModalOpen(true)
  const closeModal = () => setIsQuinBoostModalOpen(false)

  const fetchQuiz = async () => {
    try {
      selectedLanguage === 'english'
        ? await axios.put(`/api/articles/genQuiz/${id}`)
        : await axios.put(`/api/articles/genHindiQuiz/${id}`)

      console.log('Quiz generated')
    } catch (error) {
      console.log(error.message)
    }
  }

  // const fetchQuizTitans = async () => {
  //   try {
  //     const response = await axios.get(`/api/articles/quizTitan/${id}`)
  //     setTotalUsersGivenQuiz(response.data.totalUsersGivenQuiz)
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: error.response.data.error || 'Error Quiz Titans',
  //       status: 'error',
  //       duration: 3000,
  //       isClosable: true,
  //       position: 'top',
  //     })
  //   } finally {
  //     setLoad(false)
  //   }
  // }

  const bookmarkStatus = async ({ view, update }) => {
    if (notLoggedIn || notLoggedIn === undefined) return
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
  }

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`/api/articles/article/${id}`)
      // console.log(response.data);
      // setTotalUsersGivenQuiz(response.data.totalUsersGivenQuiz);
      setLatestNews(response.data.newArticle.relatedArticles)
      setArticle(response.data.newArticle)
      setTotalUsersGivenQuiz(response.data.newArticle.quizAttemptCnt)

      const image = Array.isArray(response.data.newArticle.imgURL)
        ? response.data.newArticle.imgURL[0]
        : response.data.newArticle.imgURL
      setImgURL(image)
      setDateTime(response.data.newArticle.date)
      setAvgTimeRead(response.data.newArticle.avgReadTime)
      setTitle({
        english: response.data.newArticle.title,
        hindi: response.data.newArticle.hindiTitle,
      })
      setAuthor({
        english: response.data.newArticle.author,
        hindi: response.data.newArticle.hindiAuthor,
      })
      setMainText({
        english: response.data.newArticle.mainText,
        hindi: response.data.newArticle.hindiMainText,
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
  }

  const isQuizGiven = async () => {
    const userId = user?._id
    const articleId = id
    if (!userId || !articleId) return
    try {
      const response = await axios.get(`/api/quiz/given/${articleId}/${userId}`)
      if (response.data.given) {
        setPercentile(response.data.percentile)
        setRQM_score(response.data.RQM_score)
        setGivenQuiz(true)
      }
    } catch (error) {
      console.log(error.message)
    } finally {
      setIsQuizGivenLoading(false)
    }
  }

  useEffect(() => {
    isQuizGiven()
    if (state.news) {
    }
  }, [id, user, state.news])

  const checkOnGoingQuiz = async () => {
    try {
      const response = await axios.get(`/api/articles/quizStatus/${id}`)
      setOnGoingQuiz(response.data.status)
    } catch (error) {
      console.log(error.message)
    } finally {
      localStorage.setItem('isQuizGivenCalled', true)
      setLoad(false)
    }
  }

  const getExpectedIQ = async () => {
    try {
      const articlePage = document?.querySelector('.article-page')
      document.querySelector('body').style.overflow = 'hidden'
      const overlay = document.createElement('div')
      overlay.classList.add('custom-overlay')
      const overlayNav = document.createElement('div')
      overlayNav.classList.add('custom-overlay-nav')
      articlePage?.appendChild(overlay)
      document.querySelector('.navbar').appendChild(overlayNav)
      articlePage?.classList.add('shepherd-active')
      const loadingOverlay = document.createElement('div')
      loadingOverlay.classList.add('loading-overlay')
      const spinnerContainer = document.createElement('div')
      spinnerContainer.classList.add('spinner-container')
      const loadingSpinner = document.createElement('div')
      loadingSpinner.classList.add('loading-spinner')
      spinnerContainer.appendChild(loadingSpinner)
      loadingOverlay.appendChild(spinnerContainer)
      articlePage?.appendChild(loadingOverlay)
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
      const articlePage = document?.querySelector('.article-page')
      articlePage?.classList.remove('shepherd-active')
    }
  }

  useEffect(() => {
    document.title = 'Article page'
    quinBoostChecker({ setIsQuinBoostAvailable, setQuizLeftToGetQuizBoost })
    fetchArticle()
    // fetchQuizTitans()
    checkOnGoingQuiz()
    bookmarkStatus({ view: true, update: false })

    quizFetchTimer.current = setTimeout(() => {
      fetchQuiz()
    }, 5000) // 20 seconds

    return () => {
      if (quizFetchTimer.current) {
        clearTimeout(quizFetchTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    isQuizGiven()
  }, [givenQuiz])

  useEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.getBoundingClientRect().height)
    }
    if (articleRef.current) {
      setArticleHeight(articleRef.current.getBoundingClientRect().height)
    }
  }, [article, textHeight])

  useEffect(() => {
    if (!load && isAuthenticated && user && user.tutorial.articlePage) {
      // isTutorialTakenCheck({ page: "articlePage", tour });
    }
  }, [load, isAuthenticated, user, user?.tutorial?.articlePage])

  useEffect(() => {
    if (
      !load &&
      isAuthenticated &&
      user &&
      user.tutorial.quinBoostPage &&
      !user.tutorial.articlePage
    ) {
      // isTutorialTakenCheck({ page: "quinBoostPage", tour: quinTour });
    }
  }, [user, isAuthenticated, user?.tutorial?.articlePage, load])

  useEffect(() => {
    setAlt_image(
      imageData.find(
        img =>
          img?.category?.toLocaleLowerCase() ===
          data?.category?.toLocaleLowerCase(),
      )?.image,
    )
  }, [data?.category])

  const handleLanguageChange = async event => {
    setTranslateLoading(true)
    try {
      if (event.target.value === 'hindi') {
        if (article.hindiTitle) {
          setTitle({ ...title, hindi: article.hindiTitle })
          setAuthor({ ...author, hindi: article.hindiAuthor })
          setMainText({ ...mainText, hindi: article.hindiMainText })
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
            setTitle({ ...title, hindi: response.data.article.hindiTitle })
            setAuthor({ ...author, hindi: response.data.article.hindiAuthor })
            setMainText({
              ...mainText,
              hindi: response.data.article.hindiMainText,
            })
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
  }

  const trackGenerateQuizClick = () => {
    ReactGA.send({
      hitType: 'event',
      eventCategory: 'Generate Quiz Click',
      eventAction: 'Click',
      eventLabel: 'Generate Quiz Button',
    })
  }

  return (
    <>
      {showQuizLangModal && (
        <SelectQuizLangModal
          setSelectLanForQuiz={setSelectLanForQuiz}
          setShowQuizLangModal={setShowQuizLangModal}
        />
      )}
      {showExpectedIQ && expectedIQ ? (
        <ExpectedIQModal
          expectedIQ={expectedIQ}
          setShowExpectedIQ={setShowExpectedIQ}
        />
      ) : null}
      {/* {((showQuiz && !givenQuiz && !showQuizLangModal) || true) && !load ? ( */}
      {showQuiz && !givenQuiz && !showQuizLangModal ? (
        <Quiz
          // fetchQuizTitans={fetchQuizTitans}
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
          language={selectLanForQuiz}
        />
      ) : null}
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
            <title>{title[selectedLanguage]}</title>
            <meta
              name="description"
              content={mainText[selectedLanguage]?.[0]}
            />
            <meta property="og:title" content={title[selectedLanguage]} />
            <meta
              property="og:description"
              content={mainText[selectedLanguage]?.[0]}
            />
            <meta property="og:image" content={alt_image} />
            <meta property="og:type" content="article" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title[selectedLanguage]} />
            <meta
              name="twitter:description"
              content={mainText[selectedLanguage]?.[0]}
            />
            <meta name="twitter:image" content={alt_image} />
            <link
              rel="canonical"
              href={`https://yourdomain.com/articles/${id}`}
            />
            <script type="application/ld+json">
              {`
                {
                  "@context": "https://schema.org",
                  "@type": "NewsArticle",
                  "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": "https://yourdomain.com/articles/${id}"
                  },
                  "headline": "${title[selectedLanguage]}",
                  "image": ["${alt_image}"],
                  "datePublished": "${new Date().toISOString()}",
                  "dateModified": "${new Date().toISOString()}",
                  "author": {
                    "@type": "Person",
                    "name": "${author[selectedLanguage]}"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "Rapid Recap",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://www.rapidrecap.co.in/logo.png"
                    }
                  },
                  "description": "${mainText[selectedLanguage]?.[0]}"
                }
              `}
            </script>
          </Helmet>

          <Grid
            templateColumns={isLargerThan820 ? 'minmax(0, 9fr) 5fr' : '1fr'}
            gap={10}
            minH={'85vh'}
            p={{ base: '20px', md: '50px' }}
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
              isQuizGivenLoading={isQuizGivenLoading}
              state={state}
              givenQuiz={givenQuiz}
              percentile={percentile}
              RQM_score={RQM_score}
              onGoingQuiz={onGoingQuiz}
              quizExpired={quizExpired}
              isQuinBoostAvailable={isQuinBoostAvailable}
              tour={tour}
              trackGenerateQuizClick={trackGenerateQuizClick}
              setShowQuizLangModal={setShowQuizLangModal}
              setShowQuiz={setShowQuiz}
              showQuiz={showQuiz}
              onOpen={onOpen}
              totalUsersGivenQuiz={totalUsersGivenQuiz}
              latestNews={latestNews}
              articleHeight={articleHeight}
              article={article}
              id={id}
              quizLeftToGetQuizBoost={quizLeftToGetQuizBoost}
              openModal={openModal}
              quinTour={quinTour}
            />
          </Grid>
        </Flex>
      )}
      <QuinBoostModal
        isOpen={isQuinBoostModalOpen}
        onClose={closeModal}
        quizLeftToGetQuizBoost={quizLeftToGetQuizBoost}
        isStateBoosted={state.isBoosted}
      />
      {/* Integrate the TrackTime component */}
      {user && <TrackTime userId={user?._id} articleId={id} />}
    </>
  )
}

export default Article
