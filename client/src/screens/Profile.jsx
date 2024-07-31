import React, { useContext, useEffect, useState } from 'react'
import {
  Box,
  Flex,
  Tooltip,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Container,
  keyframes,
  useDisclosure,
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { GiHistogram } from 'react-icons/gi'
import { FaBookmark, FaUserFriends } from 'react-icons/fa'
import { AppContext } from '../contextAPI/appContext'
import IQLineGraph from '../components/profileComponents/IQLineGraph'
import IQBarGraph from '../components/profileComponents/IQBarGraph'
import LeftProfileBox from '../components/profileComponents/LeftProfileBox'
import SolvedQuizzes from '../components/profileComponents/SolvedQuizzes'
import RankAndSociety from '../components/profileComponents/RankAndSociety'
// import DailyActivity from '../components/profileComponents/DailyActivity'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import ToggleProfileVisibilty from '../components/profileComponents/LeftProfileSubComponents/ToggleProfileVisibilty.jsx'
import { useProfileTour } from '../customHooks/useTours.js'
import { Helmet } from 'react-helmet'
import { findSocietyAndCircle } from '../utils/helper.utils.js'
import ProfileExperienceLevel from '../components/profileComponents/ProfileExperienceLevel'
import SeasonSelectorModal from '../components/profileComponents/SeasonSelectorModal.jsx'
import ProfileButton from '../components/profileComponents/ProfileButton.jsx'
import Bookmarks from '../components/profileComponents/Bookmarks.jsx'
import WiseWeb from '../components/profileComponents/WiseWeb.jsx'

export default function Profile() {
  const { tour, isTutorialTakenCheck } = useProfileTour()
  const { inGameName } = useParams()
  const { state, dispatch, readFriendRequests } = useContext(AppContext)
  const [profile, setProfile] = useState(state.userProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [showHideModal, setShowHideModal] = useState(false)
  const userSocietyAndCircle = findSocietyAndCircle(state.user?.IQ_score)

  const loginedUserProfile = inGameName === state.user?.inGameName
  const [privacyProfileData, setPrivacyProfileData] = useState({
    fullProfile: false,
    lineGraph: false,
    barGraph: false,
    solvedQuizzes: false,
    society: false,
    // dailyActivity: false,
    seasonAnalytics: false,
  })

  const {
    isOpen: isOpenSeasonSelector,
    onOpen: onOpenSeasonSelector,
    onClose: onCloseSeasonSelector,
  } = useDisclosure()
  const {
    isOpen: isOpenBookmarks,
    onOpen: onOpenBookmarks,
    onClose: onCloseBookmarks,
  } = useDisclosure()
  const {
    isOpen: isOpenWiseWeb,
    onOpen: onOpenWiseWeb,
    onClose: onCloseWiseWeb,
  } = useDisclosure()

  const fetchProfile = async () => {
    if (!state.user) return
    try {
      const response = await axios.get(`/api/user/profile/${inGameName}`)
      setProfile(() => response.data)
      if (inGameName === state.user.inGameName) {
        dispatch({ type: 'profile', payloadProfile: response.data })
        localStorage.setItem('userProfile', JSON.stringify(response.data)) // Cache profile
      } else {
        setPrivacyProfileData(() => response.data.profilePrivacy)
        dispatch({
          type: 'otherUserProfiles',
          payloadOtherUserProfiles: [
            ...state.otherUserProfiles,
            { profile: response.data, inGameName: inGameName },
          ],
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Profile page'

    const otherUserStored = state.otherUserProfiles?.find(user => {
      return user?.inGameName === inGameName
    })

    if (inGameName === state.user?.inGameName) {
      const cachedProfile = localStorage.getItem('userProfile')
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile)
        setProfile(parsedProfile)
        setIsLoading(false)
        fetchProfile()
      } else if (state.userProfile) {
        setProfile(state.userProfile)
        setIsLoading(false)
      } else {
        fetchProfile()
      }
    } else if (otherUserStored) {
      setProfile(otherUserStored.profile)
      setPrivacyProfileData(
        otherUserStored.profile.profilePrivacy || privacyProfileData,
      )
      setIsLoading(false)
    } else {
      fetchProfile()
    }
  }, [inGameName, state, state.user])

  useEffect(() => {
    if (
      !isLoading &&
      !state.show &&
      state.user &&
      state.user.tutorial.profilePage &&
      loginedUserProfile
    ) {
      isTutorialTakenCheck({ page: 'profilePage', tour })
    }
  }, [isLoading])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const requestId = params.get('requestId')

    if (requestId) {
      onOpenWiseWeb()
    }
  }, [location])

  // Define keyframes for hover animation
  const hoverAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `

  return (
    <Box marginTop={'4.5rem'} w={'100%'}>
      <Helmet>
        <title>
          {profile?.username ? `${profile.username}'s Profile` : 'Profile'}
        </title>
        <meta
          name="description"
          content={`View ${profile?.username}'s profile, check their IQ score, solved quizzes, daily activities, and society.`}
        />
        <meta
          name="keywords"
          content="profile, IQ score, quizzes, daily activities, user ranking, society, circles, explorers, strivers, elites, mavericks, pioneers"
        />
        <meta property="og:title" content={`${profile?.username}'s Profile`} />
        <meta
          property="og:description"
          content={`Explore ${
            profile?.username
          }'s profile with IQ score, solved quizzes, daily activities, and belongs to ${
            userSocietyAndCircle?.society
          } ${
            userSocietyAndCircle?.circle
              ? `and ` + userSocietyAndCircle?.circle
              : ``
          }.`}
        />
        <meta property="og:type" content="profile" />
      </Helmet>
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        marginTop="20px"
        marginInline={{ base: '2%', xl: '6.5%' }}
        alignItems={{ base: 'center', md: 'normal' }}
        justifyContent={{ base: 'center', md: 'center', lg: 'normal' }}
        className="profile-info"
      >
        <Flex
          flexDirection={'column'}
          w={{
            xl: '400px',
            md: '460px',
            sm: '100%',
            base: '100%',
          }}
          margin={'12px'}
        >
          <Flex
            marginTop={'10px'}
            padding="15px"
            borderRadius="10px"
            flexDirection="column"
            w={{ md: '85%', lg: '95%', base: '100%' }}
            height="fit-content"
            style={{
              backgroundColor: '#0f0d15',
              backgroundImage:
                'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
              boxShadow:
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)', // Increased intensity of the shadow
            }}
          >
            {showHideModal && (
              <ToggleProfileVisibilty setShowHideModal={setShowHideModal} />
            )}
            {inGameName === state.user?.inGameName && (
              <Tooltip label="Toggle Profile Visibility">
                <ViewIcon
                  marginLeft={'auto'}
                  onClick={() => setShowHideModal(true)}
                  _hover={{ cursor: 'pointer' }}
                />
              </Tooltip>
            )}
            {isLoading ? (
              <>
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={4} spacing="4" />
              </>
            ) : (
              <LeftProfileBox
                leftProfileView={profile?.leftProfileView}
                CURR_IQ={profile?.USER_IQ}
                MAX_IQ={profile?.maxIQScore}
              />
            )}
          </Flex>
          <Flex
            marginTop={'12px'}
            padding="15px"
            borderRadius="10px"
            flexDirection="column"
            w={{ md: '85%', lg: '95%', base: '100%' }}
            height="fit-content"
            style={{
              backgroundColor: '#0f0d15',
              backgroundImage:
                'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
              boxShadow:
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)', // Increased intensity of the shadow
            }}
          >
            {isLoading ? (
              <>
                <Container padding={0}>
                  <Flex flexDirection="column" width="100%" h={'100%'} m={0}>
                    <SkeletonText
                      noOfLines={1}
                      spacing="4"
                      skeletonHeight="20px"
                    />
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent={'space-between'}
                      alignItems="center"
                      mt={4}
                    >
                      <Flex
                        justify="space-between"
                        align="left"
                        width="120px"
                        flexDirection="column"
                      >
                        <Box>
                          <Skeleton height="20px" width="100px" mb={2} />
                        </Box>
                        <Box position="relative" mb={4}>
                          <Skeleton
                            height="120px"
                            width="120px"
                            borderRadius="50%"
                            startColor="gray.200"
                            endColor="gray.400"
                          />
                        </Box>
                        <Box textAlign="left">
                          <Skeleton height="20px" width="100px" />
                        </Box>
                      </Flex>
                      <Flex textAlign={'center'}>
                        <Box>
                          <Skeleton height="20px" width="150px" mb={2} />
                          <Skeleton height="20px" width="150px" />
                        </Box>
                      </Flex>
                    </Box>
                  </Flex>
                </Container>
              </>
            ) : (
              <ProfileExperienceLevel
                xp={profile.experience.xp}
                level={profile.experience.level}
              />
            )}
          </Flex>
          {isLoading ? (
            <>
              <Skeleton
                w={{ md: '85%', lg: '95%', base: '100%' }}
                borderRadius="10px"
                height="50px"
                marginTop="12px"
              />
            </>
          ) : (
            inGameName == state.user.inGameName && (
              <Flex
                padding="15px"
                borderRadius="10px"
                flexDirection="column"
                w={{ md: '85%', lg: '95%', base: '100%' }}
                height="fit-content"
                justifyContent={'center'}
                alignItems={'center'}
                position={'relative'}
              >
                {state.unreadFriendRequests > 0 && (
                  <Box
                    h="8px"
                    w="8px"
                    bg={'red'}
                    borderRadius={'50%'}
                    position={'absolute'}
                    right={'34%'}
                    top={'35%'}
                    zIndex={2}
                  />
                )}
                <ProfileButton
                  buttonText="Wise Web"
                  inGameName={inGameName}
                  stateUserInGameName={state.user.inGameName}
                  Private={true}
                  hoverAnimation={hoverAnimation}
                  onClick={onOpenWiseWeb}
                  icon={<FaUserFriends />} // Add icon here
                />

                {isOpenWiseWeb && (
                  <WiseWeb
                    isOpen={isOpenWiseWeb}
                    onClose={onCloseWiseWeb}
                    requestNotif={state.unreadFriendRequests > 0}
                    markRequestAsRead={readFriendRequests}
                  />
                )}
              </Flex>
            )
          )}
          {isLoading ? (
            <>
              <Skeleton
                w={{ md: '85%', lg: '95%', base: '100%' }}
                borderRadius="10px"
                height="50px"
                marginTop="12px"
              />
            </>
          ) : (
            (!privacyProfileData.seasonAnalytics ||
              inGameName == state.user.inGameName) && (
              <Flex
                padding="15px"
                borderRadius="10px"
                flexDirection="column"
                w={{ md: '85%', lg: '95%', base: '100%' }}
                height="fit-content"
                justifyContent={'center'}
                alignItems={'center'}
                position={'relative'}
              >
                <ProfileButton
                  buttonText="Season Analytics"
                  inGameName={inGameName}
                  stateUserInGameName={state.user.inGameName}
                  Private={state.user.profilePrivacy.seasonAnalytics}
                  hoverAnimation={hoverAnimation}
                  onClick={onOpenSeasonSelector}
                  icon={<GiHistogram />} // Add icon here
                />

                <SeasonSelectorModal
                  privateSeasonAnalytics={privacyProfileData.seasonAnalytics}
                  currSeason={profile?.currentSeason}
                  isOpen={isOpenSeasonSelector}
                  onClose={onCloseSeasonSelector}
                  isLoading={isLoading}
                  profile={profile}
                  privacyProfileData={privacyProfileData}
                  loginedUserProfile={loginedUserProfile}
                  inGameName={inGameName}
                  seasons={profile?.seasons}
                />
              </Flex>
            )
          )}
          {isLoading ? (
            <>
              <Skeleton
                w={{ md: '85%', lg: '95%', base: '100%' }}
                borderRadius="10px"
                height="50px"
                marginTop="12px"
              />
            </>
          ) : (
            inGameName == state.user.inGameName && (
              <Flex
                padding="15px"
                borderRadius="10px"
                flexDirection="column"
                w={{ md: '85%', lg: '95%', base: '100%' }}
                height="fit-content"
                justifyContent={'center'}
                alignItems={'center'}
                position={'relative'}
              >
                <ProfileButton
                  buttonText="Bookmarks"
                  inGameName={inGameName}
                  stateUserInGameName={state.user.inGameName}
                  Private={true}
                  hoverAnimation={hoverAnimation}
                  onClick={onOpenBookmarks}
                  icon={<FaBookmark />} // Add icon here
                />

                <Bookmarks
                  isOpen={isOpenBookmarks}
                  onClose={onCloseBookmarks}
                  isLoading={isLoading}
                  profile={profile}
                  inGameName={inGameName}
                />
              </Flex>
            )
          )}
        </Flex>
        <Flex
          w={{
            xl: 'calc(100% - 400px)',
            md: 'calc(100% - 460px)',
            sm: '100%',
            base: '100%',
          }}
          flexDirection="column"
          margin="12px"
          // justifyContent={'center'}
          alignItems={'center'}
          borderRadius="10px"
          className="right-profile-box"
        >
          <Flex
            w={'100%'}
            marginTop={'10px'}
            marginInline={'1%'}
            padding={{ xl: isLoading ? 0 : '20px', base: '0' }}
            borderRadius="10px"
            flexDirection={{ base: 'column', xl: 'row' }}
            backgroundColor={{ base: 'transparent', xl: '#0f0d15' }}
            backgroundImage={{
              base: 'none',
              xl: 'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
            }}
            boxShadow={{
              base: 'none',
              xl: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
            }}
            gap={{ base: '20px', xl: '0' }}
          >
            {isLoading ? (
              <>
                <Skeleton
                  height="200px"
                  width="100%"
                  borderRadius="10px"
                  marginRight={5}
                />
                <Skeleton height="200px" width="100%" borderRadius="10px" />
              </>
            ) : (
              <>
                <IQLineGraph
                  lineGraph={profile.lineGraph}
                  privateLineGraph={privacyProfileData.lineGraph}
                  loginedUserProfile={loginedUserProfile}
                />
                <IQBarGraph
                  barGraph={profile.barGraph}
                  privateBarGraph={privacyProfileData.lineGraph}
                  loginedUserProfile={loginedUserProfile}
                />
              </>
            )}
          </Flex>

          <Flex
            w={'100%'}
            margin="10px"
            marginBottom="5px"
            flexDirection={{ xl: 'row', base: 'column' }}
            justifyContent="space-between"
            gap={5}
          >
            {isLoading ? (
              <>
                <Skeleton height="150px" width="100%" borderRadius="10px" />
                <Skeleton height="150px" width="100%" borderRadius="10px" />
              </>
            ) : (
              <>
                <Flex
                  borderRadius="10px"
                  width={'100%'}
                  style={{
                    backgroundColor: '#0f0d15',
                    backgroundImage:
                      'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                    boxShadow:
                      '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
                  }}
                  className="solved-quizzes"
                  _hover={
                    !privacyProfileData.solvedQuizzes
                      ? {
                          transform: 'scale(1.01)',
                        }
                      : null
                  }
                  _active={
                    !privacyProfileData.solvedQuizzes
                      ? {
                          transform: 'scale(0.9)',
                          borderColor: '#bec3c9',
                        }
                      : null
                  }
                >
                  <SolvedQuizzes
                    privateSolvedQuiz={privacyProfileData.solvedQuizzes}
                    loginedUserProfile={loginedUserProfile}
                    solvedQuizzes={profile.solvedQuizzes}
                    inGameName={inGameName}
                  />
                </Flex>
                <Flex
                  borderRadius="10px"
                  width={'100%'}
                  style={{
                    backgroundColor: '#0f0d15',
                    backgroundImage:
                      'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
                    boxShadow:
                      '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
                  }}
                  className="rank-and-society"
                >
                  <RankAndSociety
                    privateSociety={privacyProfileData.society}
                    loginedUserProfile={loginedUserProfile}
                    USER_IQ={profile?.barGraph?.USER_IQ}
                  />
                </Flex>
              </>
            )}
          </Flex>
          {/* <Box
            w={'100%'}
            margin="10px"
            p={isLoading ? 0 : '10px'}
            borderRadius="10px"
            style={{
              backgroundColor: '#0f0d15',
              backgroundImage:
                'linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)',
              boxShadow:
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
            }}
            className="daily-activity"
          >
            {isLoading ? (
              <Skeleton height="150px" width="100%" borderRadius="10px" />
            ) : (
              <DailyActivity
                dailyAct={profile.dailyActivity}
                privateDailyAct={privacyProfileData.dailyActivity}
                loginedUserProfile={loginedUserProfile}
              />
            )}
          </Box> */}
        </Flex>
      </Flex>
    </Box>
  )
}
