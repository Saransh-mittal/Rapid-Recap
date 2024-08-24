// /src/App.jsx
import './App.css'
import React from 'react'
import { useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { Suspense, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Box, Spinner } from '@chakra-ui/react'
import NotificationSubscription from './components/Notifications/NotificationSubscription.jsx'
import Navbar from './components/Header-Footer/Navbar.jsx'
import Footer from './components/Header-Footer/Footer.jsx'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setUser } from './redux/authSlice.js'
import FixedBackground from './components/miscellaneous/FixedBackground.jsx'
import AppRoutes from './routes/AppRoutes.jsx'
import GuestLoginModal from './components/authComponents/GuestLoginModal.jsx'
import ButtonGradient from './assets/svg/ButtonGradient.jsx'

const Signin = React.lazy(() => import('./screens/Signin.jsx'))
import {
  addNoteMessage,
  setIsRegisterOpen,
  setIsSigninOpen,
} from './redux/appSlice.js'

import NoteMessageQueue from './components/miscellaneous/NoteMessageQueue.jsx'

const Register = React.lazy(() => import('./screens/Register.jsx'))

const App = () => {
  ReactGA.initialize('G-ES5VQ8NW7Z')
  const location = useLocation()

  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const { isRegisterOpen, isSigninOpen } = useSelector(state => state.app)
  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)
  const [guestModalJustClosed, setGuestModalJustClosed] = useState(false)

  const handleClose = () => {
    setIsGuestLoggedin(false)
    setGuestModalJustClosed(true)
  }

  const isLoggedIn = () => {
    return isAuthenticated && user
  }
  const isToken = () => {
    const token = localStorage.getItem('token')

    return token
  }

  const getUserInGameName = () => {
    return isLoggedIn() ? user?.inGameName : null
  }

  let timeout
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      dispatch(
        addNoteMessage({
          title: 'Start using Rapid Recap',
          duration: 15000,
          width: '350px',
          actions: [
            {
              text: 'Sign-In',
              actionType: 'SIGN_IN',
            },
            {
              text: 'Sign-In As Guest',
              actionType: 'GUEST',
            },
          ],
        }),
      )
    }
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
    if (user?.newAccount) {
      setIsGuestLoggedin(true)
    }
  }, [isAuthenticated, user])

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

  useEffect(() => {
    if (isToken() && guestModalJustClosed && user?.role === 'guest') {
      dispatch(
        addNoteMessage({
          title: 'You can view your credentials of guest account in profile',
          duration: 10000,
          width: '300px',
          actions: [
            {
              text: 'View Profile',
              actionType: 'VIEW_PROFILE',
            },
          ],
        }),
      )
    } else if (isToken() && user?.role === 'guest') {
      dispatch(
        addNoteMessage({
          title: 'Register to Safegaurd your progress',
          duration: 5000,
          width: '300px',
          actions: [
            {
              actionType: 'SECURE_YOUR_PROGRESS',
            },
          ],
        }),
      )
    }
  }, [isGuestLoggedin, guestModalJustClosed])

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
      <FixedBackground />
      <NoteMessageQueue />

      <Navbar />
      {/* <NoteMessageTestComponent /> */}
      <ButtonGradient />
      {shouldShowNotification && <NotificationSubscription />}
      <GuestLoginModal
        isOpen={isGuestLoggedin}
        onClose={handleClose}
        guestName={user?.inGameName}
        guestPassword={user?.guestTempPassword}
        guestId={user?._id}
        onOpen={() => setIsGuestLoggedin(true)}
      />

      <Suspense fallback={<Spinner />}>
        <Signin
          isOpen={isSigninOpen}
          onOpen={() => dispatch(setIsSigninOpen(true))}
          onClose={() => dispatch(setIsSigninOpen(false))}
        />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <Register
          isOpen={isRegisterOpen}
          onOpen={() => dispatch(setIsRegisterOpen(true))}
          onClose={() => dispatch(setIsRegisterOpen(false))}
        />
      </Suspense>
      <Box
        position="relative"
        minHeight="100vh"
        zIndex={1}
        overflowX={'hidden'}
      >
        <AppRoutes isToken={isToken()} />
      </Box>
      {shouldShowFooter && <Footer />}
    </>
  )
}

// const NoteMessageTestComponent = () => {
//   const dispatch = useDispatch()

//   const addSimpleMessage = () => {
//     dispatch(
//       addNoteMessage({
//         title: 'Simple Message',
//         content: 'This is a simple test message.',
//         duration: 5000,
//         width: '300px',
//       }),
//     )
//   }

//   const addMessageWithTwoActions = () => {
//     dispatch(
//       addNoteMessage({
//         title: 'Message with Two Actions',
//         content: 'This message includes two action buttons.',
//         duration: null,
//         width: '350px',
//         actions: [
//           {
//             text: 'Confirm',
//             actionType: 'CONFIRM',
//             colorScheme: 'green',
//           },
//           {
//             text: 'Cancel',
//             actionType: 'CANCEL',
//             colorScheme: 'red',
//           },
//         ],
//       }),
//     )
//   }

//   const addMessageWithThreeActions = () => {
//     dispatch(
//       addNoteMessage({
//         title: 'Message with Three Actions',
//         content: 'This message includes three action buttons.',
//         duration: 15000,
//         width: '300px',
//         actions: [
//           {
//             text: 'Sign-In',
//             actionType: 'SIGN_IN',
//           },
//           {
//             text: 'Sign-In As Guest',
//             actionType: 'GUEST',
//           },
//           // {
//           //   text: 'Cancel',
//           //   actionType: 'CANCEL',
//           //   colorScheme: 'gray',
//           // },
//         ],
//       }),
//     )
//   }

//   const addMultipleMessages = () => {
//     for (let i = 1; i <= 5; i++) {
//       dispatch(
//         addNoteMessage({
//           title: `Message ${i}`,
//           content: `This is test message number ${i}.`,
//           duration: 5000 + i * 1000,
//           width: '300px',
//           actions: [
//             {
//               text: 'Sign-In',
//               actionType: 'LOGIN',
//               colorScheme: 'blue',
//             },
//             {
//               text: 'Option 2',
//               actionType: 'OPTION2',
//               colorScheme: 'purple',
//             },
//             {
//               text: 'Cancel',
//               actionType: 'CANCEL',
//               colorScheme: 'gray',
//             },
//           ],
//         }),
//       )
//     }
//   }

//   return (
//     <VStack spacing={4} align="stretch" p={4} mt={'10rem'}>
//       <Button onClick={addSimpleMessage}>Add Simple Message</Button>
//       <Button onClick={addMessageWithTwoActions}>
//         Add Message with Two Actions
//       </Button>
//       <Button onClick={addMessageWithThreeActions}>
//         Add Message with Three Actions
//       </Button>
//       <Button onClick={addMultipleMessages}>Add Multiple Messages</Button>
//     </VStack>
//   )
// }
export default App
