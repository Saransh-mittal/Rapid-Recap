import React, { useEffect, useState, useCallback, Suspense } from 'react'
import {
  Box,
  Flex,
  Tooltip,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Container,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'

import { SettingsIcon, ViewIcon } from '@chakra-ui/icons'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'
import { setOtherUserProfiles, setUserProfile } from '../redux/contentSlice.js'
import BookmarkSVG from '../assets/svg/BookmarkSVG.jsx'
import HistogramSVG from '../assets/svg/HistogramSVG.jsx'
import { findSocietyAndCircle } from '../utils/helper.utils.js'
import { useTranslation } from 'react-i18next'
import TournamentSection from '../components/profileComponents/TournamentSection.jsx'

// Dynamic imports for code splitting
const LineGraph = React.lazy(() =>
  import('../components/profileComponents/LineGraph.jsx'),
)
const SecureYourProgress = React.lazy(() =>
  import('../components/miscellaneous/SecureYourProgress.jsx'),
)
const Settings = React.lazy(() =>
  import('../components/profileComponents/Settings.jsx'),
)
const IQBarGraph = React.lazy(() =>
  import('../components/profileComponents/IQBarGraph'),
)
const LeftProfileBox = React.lazy(() =>
  import('../components/profileComponents/LeftProfileBox'),
)
const SolvedQuizzes = React.lazy(() =>
  import('../components/profileComponents/SolvedQuizzes'),
)
const RankAndSociety = React.lazy(() =>
  import('../components/profileComponents/RankAndSociety'),
)
const ToggleProfileVisibilty = React.lazy(() =>
  import(
    '../components/profileComponents/LeftProfileSubComponents/ToggleProfileVisibilty.jsx'
  ),
)
const ProfileExperienceLevel = React.lazy(() =>
  import('../components/profileComponents/ProfileExperienceLevel'),
)
const SeasonSelectorModal = React.lazy(() =>
  import('../components/profileComponents/SeasonSelectorModal.jsx'),
)
const ProfileButton = React.lazy(() =>
  import('../components/profileComponents/ProfileButton.jsx'),
)
const Bookmarks = React.lazy(() =>
  import('../components/profileComponents/Bookmarks.jsx'),
)

export default function Profile() {
  const { t } = useTranslation('Profile')
  const { t: IQBarTranslate } = useTranslation('IQBarGraph')
  const { t: IQLineTranslate } = useTranslation('LineGraph')
  const { inGameName } = useParams()
  const { user } = useSelector(state => state.auth)
  const { userProfile, otherUserProfiles } = useSelector(state => state.content)
  const dispatchRedux = useDispatch()

  const navigate = useNavigate()
  const toast = useToast()

  // State hooks
  const [profile, setProfile] = useState(userProfile)
  const [isLoading, setIsLoading] = useState(true)
  const [showHideModal, setShowHideModal] = useState(false)
  const userSocietyAndCircle = findSocietyAndCircle(user?.IQ_score)
  const loginedUserProfile = inGameName === user?.inGameName

  const [privacyProfileData, setPrivacyProfileData] = useState({
    fullProfile: false,
    lineGraph: false,
    barGraph: false,
    solvedQuizzes: false,
    society: false,
    seasonAnalytics: false,
    tournamentAnalytics: false,
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
    isOpen: isOpenSettings,
    onOpen: onOpenSettings,
    onClose: onCloseSettings,
  } = useDisclosure()

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`/api/user/profile/${inGameName}`)
      setProfile(() => response.data)
      if (inGameName === user?.inGameName) {
        dispatchRedux(setUserProfile(response.data))
        localStorage.setItem('userProfile', JSON.stringify(response.data))
      } else {
        setPrivacyProfileData(() => response.data.profilePrivacy)
        dispatchRedux(
          setOtherUserProfiles([
            ...otherUserProfiles,
            { profile: response.data, inGameName: inGameName },
          ]),
        )
      }
    } catch (error) {
      console.log(error)
      if (error.response?.status === 404) {
        toast({
          title: 'User not found',
          description: 'The user you are looking for does not exist',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
        navigate('/')
      }
    } finally {
      setIsLoading(false)
    }
  }, [dispatchRedux, inGameName, otherUserProfiles, user?.inGameName])

  useEffect(() => {
    document.title = `${user?.inGameName}'s Rapid Recap Profile | IQ Score: ${user?.USER_IQ}`

    const otherUserStored = otherUserProfiles?.find(
      user => user?.inGameName === inGameName,
    )

    if (inGameName === user?.inGameName) {
      const cachedProfile = localStorage.getItem('userProfile')
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile)
        setProfile(parsedProfile)
        setIsLoading(false)
        fetchProfile()
      } else if (userProfile) {
        setProfile(userProfile)
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
  }, [inGameName, user, otherUserProfiles])

  const hoverAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `

  return (
    <Box marginTop={'4.5rem'} w={'100%'}>
      <Helmet>
        <title>
          {t('title', { name: profile?.inGameName, score: profile?.USER_IQ })}
        </title>
        <meta
          name="description"
          content={`Explore ${
            profile?.inGameName
          }'s Rapid Recap profile. IQ score: ${profile?.USER_IQ}, ${
            profile?.solvedQuizzes?.length
          } quizzes solved. Member of ${userSocietyAndCircle?.society} ${
            userSocietyAndCircle?.circle
              ? `and ${userSocietyAndCircle?.circle}`
              : ''
          }. View their progress and achievements!`}
        />
        <meta
          property="og:title"
          content={`${profile?.inGameName}'s Rapid Recap Profile`}
        />
        <meta
          property="og:description"
          content={`Check out ${
            profile?.inGameName
          }'s profile on Rapid Recap. IQ score: ${
            profile?.USER_IQ
          }, quizzes solved: ${
            profile?.solvedQuizzes?.length
          }. See their progress in ${userSocietyAndCircle?.society} ${
            userSocietyAndCircle?.circle
              ? `and ${userSocietyAndCircle?.circle}`
              : ''
          }.`}
        />
        <meta property="og:type" content="profile" />
        <meta
          property="og:url"
          content={`https://www.rapidrecap.co.in/profile/${inGameName}`}
        />
        <meta
          property="og:image"
          content={
            profile?.pic ||
            'http://res.cloudinary.com/dxstsrnbs/image/upload/v1712729332/ProfilePIcs/p7zujdgjs1m301vsss1q.png'
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${profile?.inGameName}'s Rapid Recap Profile`}
        />
        <meta
          name="twitter:description"
          content={`Explore ${profile?.inGameName}'s Rapid Recap profile. IQ score: ${profile?.USER_IQ}, ${profile?.solvedQuizzes?.length} quizzes solved. View their progress!`}
        />
        <meta
          name="twitter:image"
          content={
            profile?.pic ||
            'http://res.cloudinary.com/dxstsrnbs/image/upload/v1712729332/ProfilePIcs/p7zujdgjs1m301vsss1q.png'
          }
        />
        <link
          rel="canonical"
          href={`https://www.rapidrecap.co.in/profile/${inGameName}`}
        />
        <script type="application/ld+json">
          {`
      {
        "@context": "http://schema.org",
        "@type": "Person",
        "name": "${profile?.inGameName}",
        "url": "https://www.rapidrecap.co.in/profile/${inGameName}",
        "image": "${
          profile?.pic ||
          'http://res.cloudinary.com/dxstsrnbs/image/upload/v1712729332/ProfilePIcs/p7zujdgjs1m301vsss1q.png'
        }",
        "description": "Rapid Recap user with an IQ score of ${
          profile?.USER_IQ
        }",
        "affiliation": {
          "@type": "Organization",
          "name": "${userSocietyAndCircle?.society}"
        }
      }
    `}
        </script>
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
              backgroundColor: 'rgba(15, 13, 21, 0.8)',
              boxShadow:
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Suspense fallback={<SkeletonCircle size="10" />}>
              {showHideModal && (
                <ToggleProfileVisibilty
                  setShowHideModal={setShowHideModal}
                  isGuest={user?.role == 'guest'}
                />
              )}
              {inGameName === user?.inGameName && (
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
            </Suspense>
          </Flex>
          <Flex
            marginTop={'12px'}
            px={'15px'}
            py={'6px'}
            borderRadius="10px"
            flexDirection="column"
            w={{ md: '85%', lg: '95%', base: '100%' }}
            height="fit-content"
            style={{
              backgroundColor: 'rgba(15, 13, 21, 0.8)',
              boxShadow:
                '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Suspense
              fallback={
                <SkeletonText noOfLines={1} spacing="4" skeletonHeight="20px" />
              }
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
                  xp={profile?.experience?.xp}
                  level={profile?.experience?.level}
                />
              )}
            </Suspense>
          </Flex>
          <Suspense
            fallback={
              <Skeleton
                w={{ md: '85%', lg: '95%', base: '100%' }}
                borderRadius="10px"
                height="50px"
                marginTop="12px"
              />
            }
          >
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
              <>
                {(!privacyProfileData.seasonAnalytics ||
                  inGameName == user?.inGameName) &&
                  user?.role !== 'guest' && (
                    <Flex
                      py={'8px'}
                      borderRadius="10px"
                      flexDirection="column"
                      w={{ md: '85%', lg: '95%', base: '100%' }}
                      height="fit-content"
                      justifyContent={'center'}
                      alignItems={'center'}
                      position={'relative'}
                      className="season-analytics"
                    >
                      <ProfileButton
                        buttonText={t('seasonAnalytics')}
                        inGameName={inGameName}
                        stateUserInGameName={user?.inGameName}
                        Private={user?.profilePrivacy.seasonAnalytics}
                        hoverAnimation={hoverAnimation}
                        onClick={onOpenSeasonSelector}
                        icon={
                          <HistogramSVG
                            width={'20px'}
                            height={'20px'}
                            fill={'#fff'}
                          />
                        }
                        top={'0.9rem'}
                      />

                      <SeasonSelectorModal
                        privateSeasonAnalytics={
                          privacyProfileData.seasonAnalytics
                        }
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
                  )}
                {user?.role === 'guest' && (
                  <Suspense fallback={null}>
                    {' '}
                    <SecureYourProgress />
                  </Suspense>
                )}
              </>
            )}
          </Suspense>
          <Suspense
            fallback={
              <Skeleton
                w={{ md: '85%', lg: '95%', base: '100%' }}
                borderRadius="10px"
                height="50px"
                marginTop="12px"
              />
            }
          >
            {isLoading ? (
              <>
                <Skeleton
                  w={{ md: '85%', lg: '95%', base: '100%' }}
                  borderRadius="10px"
                  height="50px"
                  marginTop="12px"
                />
                <Skeleton
                  w={{ md: '85%', lg: '95%', base: '100%' }}
                  borderRadius="10px"
                  height="50px"
                  marginTop="12px"
                />
              </>
            ) : (
              inGameName == user?.inGameName && (
                <>
                  <Suspense
                    fallback={
                      <>
                        <Skeleton
                          w={{ md: '85%', lg: '95%', base: '100%' }}
                          borderRadius="10px"
                          height="50px"
                          marginTop="12px"
                        />
                        <Skeleton
                          w={{ md: '85%', lg: '95%', base: '100%' }}
                          borderRadius="10px"
                          height="50px"
                          marginTop="12px"
                        />
                      </>
                    }
                  >
                    <Flex
                      borderRadius="10px"
                      flexDirection="column"
                      w={{ md: '85%', lg: '95%', base: '100%' }}
                      height="fit-content"
                      justifyContent={'center'}
                      alignItems={'center'}
                      position={'relative'}
                    >
                      <ProfileButton
                        buttonText={t('Settings')}
                        inGameName={inGameName}
                        stateUserInGameName={user?.inGameName}
                        Private={true}
                        hoverAnimation={hoverAnimation}
                        onClick={onOpenSettings}
                        icon={<SettingsIcon width={'20px'} height={'20px'} />}
                      />

                      <Settings
                        isOpen={isOpenSettings}
                        onClose={onCloseSettings}
                      />
                    </Flex>

                    <Flex
                      borderRadius="10px"
                      flexDirection="column"
                      w={{ md: '85%', lg: '95%', base: '100%' }}
                      height="fit-content"
                      justifyContent={'center'}
                      alignItems={'center'}
                      position={'relative'}
                      py={'8px'}
                    >
                      <ProfileButton
                        buttonText={t('bookmarks')}
                        inGameName={inGameName}
                        stateUserInGameName={user?.inGameName}
                        Private={true}
                        hoverAnimation={hoverAnimation}
                        onClick={onOpenBookmarks}
                        icon={<BookmarkSVG width={'20px'} height={'20px'} />}
                      />

                      <Bookmarks
                        isOpen={isOpenBookmarks}
                        onClose={onCloseBookmarks}
                        isLoading={isLoading}
                        profile={profile}
                        inGameName={inGameName}
                      />
                    </Flex>
                  </Suspense>
                </>
              )
            )}
          </Suspense>
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
          alignItems={'center'}
          borderRadius="10px"
          className="right-profile-box"
        >
          <Suspense
            fallback={
              <Skeleton
                height="200px"
                width="100%"
                borderRadius="10px"
                marginRight={5}
              />
            }
          >
            <Flex
              w={'100%'}
              marginTop={'10px'}
              marginInline={'1%'}
              padding={{ xl: isLoading ? 0 : '20px', base: '0' }}
              borderRadius="10px"
              flexDirection={{ base: 'column', xl: 'row' }}
              backgroundColor="rgba(15, 13, 21, 0.8)"
              boxShadow={{
                base: 'none',
                xl: '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
              }}
              gap={{ base: '20px', xl: '0' }}
              className="line-and-bar-graph"
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
                  <LineGraph
                    lineGraph={profile?.lineGraph}
                    privateLineGraph={privacyProfileData?.lineGraph}
                    loginedUserProfile={loginedUserProfile}
                    isGuest={user?.role === 'guest'}
                    t={IQLineTranslate}
                    quantities={[
                      { label: IQLineTranslate('iqScore'), key: 'IQScore' },
                      { label: IQLineTranslate('date'), key: 'date' },
                      { label: IQLineTranslate('dailyRank'), key: 'dailyRank' },
                    ]}
                  />

                  <IQBarGraph
                    barGraph={profile?.barGraph}
                    privateBarGraph={privacyProfileData?.lineGraph}
                    loginedUserProfile={loginedUserProfile}
                    isGuest={user?.role === 'guest'}
                    t={IQBarTranslate}
                  />
                </>
              )}
            </Flex>
          </Suspense>
          <Suspense
            fallback={
              <Skeleton height="150px" width="100%" borderRadius="10px" />
            }
          >
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
                    backgroundColor="rgba(15, 13, 21, 0.8)"
                    boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
                    className="solved-quizzes"
                  >
                    <SolvedQuizzes
                      privateSolvedQuiz={
                        privacyProfileData?.solvedQuizzes && !loginedUserProfile
                      }
                      loginedUserProfile={loginedUserProfile}
                      solvedQuizzes={profile?.solvedQuizzes}
                      inGameName={inGameName}
                    />
                  </Flex>
                  <Flex
                    borderRadius="10px"
                    width={'100%'}
                    backgroundColor="rgba(15, 13, 21, 0.8)"
                    boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
                    className="rank-and-society"
                  >
                    <RankAndSociety
                      privateSociety={privacyProfileData?.society}
                      loginedUserProfile={loginedUserProfile}
                      USER_IQ={profile?.barGraph?.USER_IQ}
                      isGuest={user?.role === 'guest'}
                    />
                  </Flex>
                </>
              )}
            </Flex>
            <TournamentSection
              privateTournament={privacyProfileData?.tournamentAnalytics}
              loginedUserProfile={loginedUserProfile}
              isGuest={user?.role === 'guest'}
              userId={profile?.userId}
            />
          </Suspense>
        </Flex>
      </Flex>
    </Box>
  )
}
