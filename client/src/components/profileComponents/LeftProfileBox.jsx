import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import {
  Box,
  Button,
  Flex,
  Image,
  Text,
  useToast,
  Spinner,
  Badge,
  useColorModeValue,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { EditIcon, QuestionOutlineIcon } from '@chakra-ui/icons'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { setUser } from '../../redux/authSlice'
import useSound from '../../customHooks/useSound'
import CircleAndSocietyData from '../../assets/CircleAndSocietyData'

// Lazy loading components
const EditProfileModal = React.lazy(() => import('./EditProfileModal'))
const TournamentBadges = React.lazy(() =>
  import('../tournamentComponents/TournamentBadges'),
)
const TournamentBadgeGallery = React.lazy(() =>
  import('./LeftProfileSubComponents/TournamentBadgeGallery'),
)
const GuestLoginModal = React.lazy(() =>
  import('../authComponents/GuestLoginModal'),
)
const NameLightning = React.lazy(() => import('../miscellaneous/NameLightning'))

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionImage = motion(Image)

const LeftProfileBox = ({ leftProfileView, CURR_IQ, MAX_IQ, avgRQMScore }) => {
  const { t } = useTranslation('LeftProfileBox')
  const { t: TournamentBadgeTranslate } = useTranslation('TournamentBadge')
  const { t: GuestLoginModaltranslation } = useTranslation('GuestLoginModal')
  const toast = useToast()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { playClick } = useSound()
  const { user } = useSelector(state => state.auth)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBadgeGalleryOpen, setIsBadgeGalleryOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [friendStatus, setFriendStatus] = useState('none') // 'none', 'pending', 'friend'
  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState(null)

  const textColor = useColorModeValue('white', 'gray.100')
  const accentColor = useColorModeValue('purple.400', 'purple.300')

  useEffect(() => {
    setSelectedBadge(leftProfileView?.displayedBadge || null)
  }, [leftProfileView])

  const findSocietyAndCircle = useCallback(IQ => {
    for (let i = 0; i < CircleAndSocietyData.length; i++) {
      const { IQ_Lower, IQ_Upper } = CircleAndSocietyData[i]
      if (IQ >= IQ_Lower && (IQ_Upper === null || IQ < IQ_Upper)) {
        return CircleAndSocietyData[i]
      }
    }
    return null
  }, [])

  const selectedDatafromCurrIQ = useMemo(
    () => findSocietyAndCircle(CURR_IQ),
    [CURR_IQ, findSocietyAndCircle],
  )

  const selectedDatafromMaxIQ = useMemo(
    () => findSocietyAndCircle(MAX_IQ),
    [MAX_IQ, findSocietyAndCircle],
  )

  const checkFriendStatus = useCallback(async () => {
    if (!user || user?._id === leftProfileView?._id) {
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('/api/friends/can-send-request', {
        fromId: user?._id,
        toId: leftProfileView?._id,
      })

      if (response.status === 200) {
        if (response.data.message === 'Can send request') {
          setFriendStatus('none')
        }
      } else if (response.status === 201) {
        switch (response.data.message) {
          case 'Cannot send another request within 10 days of rejection':
          case 'Request already sent':
            setFriendStatus('pending')
            break
          case 'Already friends':
            setFriendStatus('friend')
            break
          default:
            setFriendStatus('none')
        }
      }
    } catch (error) {
      console.error('Error checking friend status:', error)
      toast({
        title: t('toast.statusErrorTitle'),
        description: t('toast.statusErrorDescription'),
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }, [user?._id, leftProfileView?._id, toast, t])

  useEffect(() => {
    checkFriendStatus()
  }, [checkFriendStatus])

  const handleEditClick = useCallback(() => {
    playClick()
    setIsEditModalOpen(true)
  }, [playClick])

  const handleSubmitModal = useCallback(
    async formData => {
      try {
        const response = await axios.post(`/api/user/editProfile`, formData)
        navigate(`/profile/${formData.inGameName}`)
        dispatch(setUser({ ...user, ...formData }))

        if (response.status === 200) {
          toast({
            title: t('toast.successTitle'),
            description: t('toast.successDescription'),
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top',
          })
        }
      } catch (e) {
        toast({
          title: t('toast.errorTitle'),
          description: e?.response.data.error || t('toast.errorDescription'),
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top',
        })
        console.error(e)
      }
    },
    [dispatch, navigate, toast, user, t],
  )

  const handleBadgeSelect = useCallback(
    async (tournamentNumber, badgeName, text) => {
      try {
        const response = await axios.post('/api/user/update-displayed-badge', {
          tournamentNumber,
          badgeName,
          text,
        })
        setSelectedBadge(response.data.badge)

        const cachedProfile = localStorage.getItem('userProfile')
        if (cachedProfile) {
          const parsedProfile = JSON.parse(cachedProfile)
          const updatedCachedProfile = {
            ...parsedProfile,
            leftProfileView: {
              ...parsedProfile.leftProfileView,
              displayedBadge: response.data.badge,
            },
          }
          localStorage.setItem(
            'userProfile',
            JSON.stringify(updatedCachedProfile),
          )
        }
        toast({
          title: t('badgeUpdateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Error updating displayed badge:', error)
        toast({
          title: t('badgeUpdateError'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [toast, t],
  )

  const sendFriendRequest = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.post('/api/friends/send-request', {
        fromId: user?._id,
        toId: leftProfileView?._id,
      })
      if (response.status === 200) {
        setFriendStatus('pending')
        toast({
          title: t('toast.requestSuccessTitle'),
          description: t('toast.requestSuccessDescription'),
          status: 'success',
          duration: 9000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: t('toast.requestSendErrorTitle'),
        description: t('toast.requestSendErrorDescription'),
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }, [toast, user?._id, leftProfileView?._id, t])

  const renderFriendButton = () => {
    if (loading) {
      return <Spinner size="sm" />
    }

    if (friendStatus === 'friend') {
      return (
        <Flex h={'fit-content'}>
          <Badge
            colorScheme="green"
            variant="solid"
            borderRadius="full"
            px={2}
            py={1}
          >
            {t('friend')}
          </Badge>
        </Flex>
      )
    }

    if (friendStatus === 'pending') {
      return (
        <Flex h={'fit-content'}>
          <Badge
            colorScheme="yellow"
            variant="solid"
            borderRadius="full"
            px={2}
            py={1}
          >
            {t('requestSent')}
          </Badge>
        </Flex>
      )
    }

    if (friendStatus === 'none') {
      return (
        <Button
          size="sm"
          colorScheme="blue"
          onClick={sendFriendRequest}
          isLoading={loading}
        >
          {t('addFriend')}
        </Button>
      )
    }

    return null
  }

  const isOwnProfile = user?._id === leftProfileView?._id

  return (
    <MotionBox
      key={`profile-box-${leftProfileView?.inGameName}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      w="100%"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
    >
      <MotionFlex
        direction="column"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Flex justifyContent={'space-between'}>
          <Flex alignItems={'center'} gap={3}>
            <MotionImage
              key={`profile-image-${leftProfileView?.inGameName}`}
              src={
                leftProfileView?.pic ||
                'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
              }
              alt={t('alt.profileImage')}
              borderRadius="full"
              boxSize="80px"
              border="3px solid"
              borderColor={accentColor}
              mb={4}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
            <VStack spacing={0} align="left" mb={3}>
              <Flex
                fontSize="xl"
                fontWeight="bold"
                color={selectedDatafromCurrIQ?.textColor}
                mb={0}
                position={'relative'}
              >
                {leftProfileView?.name}
                <Suspense fallback={<Spinner />}>
                  <NameLightning
                    key={`name-lightning-${leftProfileView?.inGameName}`}
                    boxShadow={selectedDatafromMaxIQ?.boxShadow}
                    MAX_IQ={MAX_IQ}
                  />
                </Suspense>
              </Flex>
              <Text fontSize="sm" color={accentColor} mb={0}>
                @{leftProfileView?.inGameName}
              </Text>
            </VStack>
            {user?.role === 'guest' && isOwnProfile && (
              <Flex
                key={`guest-info-button-${leftProfileView?.inGameName}`}
                size="sm"
                onClick={() => setIsGuestLoggedin(true)}
                // leftIcon={<QuestionOutlineIcon />}
                _hover={{ cursor: 'pointer' }}
                color={accentColor}
                borderRadius={'full'}
              >
                <QuestionOutlineIcon />
              </Flex>
            )}
          </Flex>
          <Flex>
            <AnimatePresence mode="wait">
              {selectedBadge ? (
                <MotionBox
                  key={`badge-box-${leftProfileView?.inGameName}-${selectedBadge?.tournamentNumber}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Suspense fallback={<Spinner size="sm" />}>
                    <TournamentBadges
                      key={`tournament-badge-${leftProfileView?.inGameName}-${selectedBadge?.tournamentNumber}`}
                      tournamentNumber={selectedBadge?.tournamentNumber}
                      rank={selectedBadge?.rank}
                      name={leftProfileView?.name}
                      inGameName={leftProfileView?.inGameName}
                      participantCnt={selectedBadge?.participantCnt}
                      size="lg"
                      badgeName={{
                        name: selectedBadge?.badgeName,
                        text: selectedBadge?.text,
                      }}
                      t={TournamentBadgeTranslate}
                    />
                  </Suspense>
                </MotionBox>
              ) : (
                <MotionBox
                  key={`no-badge-${leftProfileView?.inGameName}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    w={'5rem'}
                    h={'5rem'}
                    bg="gray.700"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                    >
                      <defs>
                        <linearGradient
                          id="shieldGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#2D3748" />
                          <stop offset="100%" stopColor="#1A202C" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M50 5 L90 25 V60 C90 75 75 90 50 95 C25 90 10 75 10 60 V25 Z"
                        fill="url(#shieldGradient)"
                      />
                      <path
                        d="M50 15 L82 31 V58 C82 70 70 82 50 86 C30 82 18 70 18 58 V31 Z"
                        fill="none"
                        stroke="#A0AEC0"
                        strokeWidth="2"
                      />
                      <text
                        x="50"
                        y="60"
                        fontFamily="Arial, sans-serif"
                        fontSize="12"
                        fill="#A0AEC0"
                        textAnchor="middle"
                      >
                        No Badge
                      </text>
                    </svg>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>
          </Flex>
        </Flex>
        <Flex justifyContent={'space-between'}>
          <HStack w="100%" mb={3} gap={5} pl={3}>
            <Flex flexDirection={'column'}>
              <Flex color={textColor}>Rank</Flex>
              <Flex color={accentColor} fontSize="2xl">
                {user?.role === 'guest' ? t('na') : leftProfileView?.rank}
              </Flex>
            </Flex>
            <Flex flexDirection={'column'}>
              <Flex color={textColor}>Avg. RQM</Flex>
              <Flex color={accentColor} fontSize="2xl">
                {leftProfileView?.avgRQM?.toFixed(2)}
              </Flex>
            </Flex>
            <Flex flexDirection={'column'}>
              <Flex color={textColor}>IQ score</Flex>
              <Flex color={accentColor} fontSize="2xl">
                {leftProfileView?.UserIQ?.toFixed(1)}
              </Flex>
            </Flex>
          </HStack>

          <Flex>
            {user &&
              user?._id !== leftProfileView?._id &&
              user?.role !== 'guest' && (
                <Flex marginLeft="1.5rem" paddingTop="10px">
                  {renderFriendButton()}
                </Flex>
              )}
          </Flex>
        </Flex>

        <Flex direction="column" borderRadius="md" pl={3}>
          <Text color={textColor} fontSize="lg" fontWeight="bold" mb={0}>
            Bio
          </Text>
          <Text color="gray.500" fontSize="md" noOfLines={4}>
            {leftProfileView?.bio || 'No bio available.'}
          </Text>
        </Flex>

        {isOwnProfile && (
          <HStack mt={4} spacing={4} justify="center">
            <Button
              key={`edit-profile-button-${leftProfileView?.inGameName}`}
              size="sm"
              colorScheme="blue"
              onClick={handleEditClick}
              leftIcon={<EditIcon />}
            >
              {t('edit')}
            </Button>
            <Button
              key={`show-badges-button-${leftProfileView?.inGameName}`}
              size="sm"
              colorScheme="purple"
              onClick={() => setIsBadgeGalleryOpen(true)}
            >
              {t('showBadges')}
            </Button>
          </HStack>
        )}
      </MotionFlex>

      {/* Modals */}
      <Suspense fallback={null}>
        <EditProfileModal
          key={`edit-profile-modal-${leftProfileView?.inGameName}`}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileData={leftProfileView}
          onSubmit={handleSubmitModal}
        />
      </Suspense>
      <Suspense fallback={null}>
        <TournamentBadgeGallery
          key={`badge-gallery-${leftProfileView?.inGameName}`}
          isOpen={isBadgeGalleryOpen}
          onClose={() => setIsBadgeGalleryOpen(false)}
          userBadges={leftProfileView?.badges}
          onBadgeSelect={handleBadgeSelect}
          userName={leftProfileView?.name}
          userInGameName={leftProfileView?.inGameName}
          displayedBadge={selectedBadge}
        />
      </Suspense>
      <Suspense fallback={null}>
        <GuestLoginModal
          key={`guest-login-modal-${leftProfileView?.inGameName}`}
          isOpen={isGuestLoggedin}
          onClose={() => setIsGuestLoggedin(false)}
          guestName={user?.inGameName}
          guestPassword={user?.guestTempPassword}
          guestId={user?._id}
          onOpen={() => setIsGuestLoggedin(true)}
          t={GuestLoginModaltranslation}
        />
      </Suspense>
    </MotionBox>
  )
}

export default LeftProfileBox
