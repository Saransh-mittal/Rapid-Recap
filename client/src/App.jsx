// /src/App.jsx
import './App.css'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import ReactGA from 'react-ga4'
import { useEffect, lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet'
import { Box, useDisclosure, useToast } from '@chakra-ui/react'
import NotificationSubscription from './components/Notifications/NotificationSubscription.jsx'
import Navbar from './components/Header-Footer/Navbar.jsx'
import Contact from './screens/Contact'
import Footer from './components/Header-Footer/Footer.jsx'
import Loading from './components/miscellaneous/Loading.jsx'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setUser } from './redux/authSlice.js'

const Home = lazy(() => import('./screens/Home'))
const Article = lazy(() => import('./screens/Article.jsx'))
const Profile = lazy(() => import('./screens/Profile.jsx'))
const LeaderBoard = lazy(() => import('./screens/LeaderBoard.jsx'))
const GetStarted = lazy(() => import('./screens/GetStarted.jsx'))
const FeedbackModal = lazy(() =>
  import('./components/getStartedComponents/modals/FeedbackModal.jsx'),
)
const ChatPage = lazy(() => import('./screens/ChatPage.jsx'))
const Signin = lazy(() => import('./screens/Signin.jsx'))
const Dashboard = lazy(() => import('./screens/Dashboard.jsx'))

const App = () => {
  ReactGA.initialize('G-ES5VQ8NW7Z')
  const location = useLocation()

  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)

  const isLoggedIn = () => {
    return isAuthenticated && user
  }

  const getUserInGameName = () => {
    return isLoggedIn() ? user?.inGameName : null
  }

  let timeout
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(
          function (registration) {
            console.log(
              'ServiceWorker registration successful with scope: ',
              registration.scope,
            )
            registration.update()
          },
          function (err) {
            console.log('ServiceWorker registration failed: ', err)
          },
        )
      })
    }
    const refreshAtMidnightUTC = () => {
      const now = new Date()
      const midnightUTC = new Date(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        24,
        0,
        0,
        0,
      )

      const timeUntilMidnight = midnightUTC - now
      timeout =
        timeUntilMidnight > 0 ? timeUntilMidnight : 86400000 + timeUntilMidnight

      setTimeout(() => {
        window.location.reload(true)
      }, timeout)
    }

    refreshAtMidnightUTC()

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    const loggedIn = isLoggedIn()
    const userInGameName = getUserInGameName()

    ReactGA.set({
      'User Logged In': loggedIn ? 'Logged In' : 'Logged Out',
      'User InGameName': userInGameName ? userInGameName : 'anonymous',
    })
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title,
    })
  }, [location, user, isAuthenticated])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`/api/user/loginCheck`)
        if (response.status === 201) {
          dispatch(setUser(response.data))
        }
      } catch (error) {
        dispatch(setUser(null))
        console.log(error)
      }
    }

    fetchInitialData()
  }, [dispatch])

  const shouldShowFooter =
    !location.pathname.includes('home') &&
    (location.pathname === '/' || location.pathname === '/get-started')

  const isSupported = () =>
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  const shouldShowNotification = isAuthenticated && isSupported()

  return (
    <>
      <Helmet>
        <title>Rapid Recap - Stay Informed, Stay Ahead</title>
        <meta
          name="description"
          content="Rapid Recap is your go-to source for the latest news and articles. Test your knowledge with quizzes and track your Information Quotient (IQ) score."
        />
        <meta
          name="keywords"
          content="Rapid Recap, news, articles, quizzes, IQ score, leaderboard"
        />
        <meta
          property="og:title"
          content="Rapid Recap - Stay Informed, Stay Ahead"
        />
        <meta
          property="og:description"
          content="Stay updated with the latest news and articles. Take quizzes and see your Information Quotient (IQ) score on Rapid Recap."
        />
      </Helmet>

      <Navbar />
      <Box position="relative" overflowX={'hidden'}>
        {shouldShowNotification && <NotificationSubscription />}
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/"
              element={isLoggedIn() ? <Navigate to="/home" /> : <GetStarted />}
            />
            <Route path="/get-started" element={<GetStarted />} />
            <Route exact path="/contact/feedback" element={<ContactLayout />} />
            <Route path="/home/:category" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chats" element={<ChatPage />} />
            <Route exact path="/article/:id" element={<Article />} />
            <Route path="/profile/:inGameName" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route exact path="/contact" element={<ContactLayout />} />
            <Route exact path="/leaderboard" element={<LeaderBoard />} />
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Box>
      {shouldShowFooter && <Footer />}
    </>
  )
}

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleClose = () => {
    onClose()
    navigate('/')
  }

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Unauthorized',
        description: 'You need to be logged in to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } else if (role !== 'admin') {
      toast({
        title: 'Unauthorized',
        description: 'You are not authorized to access this page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      navigate('/')
    }
  }, [token, role, navigate, toast])

  if (!token) {
    return <Signin isOpen={true} onOpen={onOpen} onClose={handleClose} />
  }

  return children
}

const ContactLayout = () => {
  const location = useLocation()
  const isFeedbackRoute = location.pathname === '/contact/feedback'
  const navigate = useNavigate()

  return (
    <>
      <Contact />
      <FeedbackModal
        isOpen={isFeedbackRoute}
        onClose={() => navigate('/contact')}
      />
    </>
  )
}

export default App
