import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useToast,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setUser } from '../../redux/authSlice'
import UserPlusSVG from '../../assets/svg/UserPlusSVG'
import useSound from '../../customHooks/useSound'
import CircleAndSocietyData from '../../assets/CircleAndSocietyData'
import { QuestionOutlineIcon } from '@chakra-ui/icons'
import GuestLoginModal from '../authComponents/GuestLoginModal'

// Lazy loading for components that are not needed immediately
const EditProfileModal = React.lazy(() => import('./EditProfileModal'))
const NameLightning = React.lazy(() => import('../miscellaneous/NameLightning'))

const LeftProfileBox = ({ leftProfileView, CURR_IQ, MAX_IQ }) => {
  const toast = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { playClick } = useSound()
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [canSendRequest, setCanSendRequest] = useState(true)
  const [requestSent, setRequestSent] = useState(false)
  const [isFriend, setIsFriend] = useState(false)
  const [isGuestLoggedin, setIsGuestLoggedin] = useState(false)

  const handleClose = () => {
    setIsGuestLoggedin(false)
  }

  const profileData = useMemo(
    () => ({
      name: leftProfileView.name,
      pic:
        leftProfileView.pic ||
        'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
      bio: leftProfileView.bio,
      inGameName: user?.inGameName,
      lastInGameNameChange: user?.lastInGameNameChange,
    }),
    [leftProfileView, user],
  )

  const findSocietyAndCircle = useCallback(IQ => {
    for (let i = 0; i < CircleAndSocietyData.length; i++) {
      const { IQ_Lower, IQ_Upper } = CircleAndSocietyData[i]
      if (IQ >= IQ_Lower && (IQ_Upper === null || IQ < IQ_Upper)) {
        return CircleAndSocietyData[i]
      }
    }
    return null
  }, [])

  const selectedDatafromMaxIQ = useMemo(
    () => findSocietyAndCircle(MAX_IQ),
    [MAX_IQ, findSocietyAndCircle],
  )
  const selectedDatafromCurrIQ = useMemo(
    () => findSocietyAndCircle(CURR_IQ),
    [CURR_IQ, findSocietyAndCircle],
  )

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
            title: 'Success',
            description: 'Profile Updated Successfully',
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'top',
          })
        }
      } catch (e) {
        toast({
          title: 'Error',
          description:
            e?.response.data.error ||
            'Error updating profile please try again!!',
          status: 'error',
          duration: 9000,
          isClosable: true,
          position: 'top',
        })
        console.error(e)
      }
    },
    [dispatch, navigate, toast, user],
  )

  const checkCanSendRequest = useCallback(async () => {
    setLoading(true)
    if (!user) return setLoading(false)
    try {
      const response = await axios.post('/api/friends/can-send-request', {
        fromId: user?._id,
        toId: leftProfileView._id,
      })
      if (
        response.status === 200 &&
        response.data.message === 'Can send request'
      ) {
        setCanSendRequest(true)
      } else {
        if (response.data.friend === true) {
          setIsFriend(true)
        } else if (!response.data.allowed) setCanSendRequest(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error checking friend request status',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }, [leftProfileView._id, toast, user])

  const sendFriendRequest = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.post('/api/friends/send-request', {
        fromId: user?._id,
        toId: leftProfileView._id,
      })
      if (response.status === 200) {
        setRequestSent(true)
        toast({
          title: 'Success',
          description: 'Friend request sent successfully',
          status: 'success',
          duration: 9000,
          isClosable: true,
          position: 'top',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error sending friend request',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top',
      })
    } finally {
      setLoading(false)
    }
  }, [toast, user?._id, leftProfileView._id])

  useEffect(() => {
    checkCanSendRequest()
  }, [checkCanSendRequest])

  const handleRequestClick = useCallback(async () => {
    if (canSendRequest && !requestSent) {
      await sendFriendRequest()
    }
  }, [canSendRequest, requestSent, sendFriendRequest])

  return (
    <Flex
      className="left-profile-box"
      flexDirection={'column'}
      w={'100%'}
      justifyContent={'center'}
      alignItems={'center'}
      p={'5px'}
    >
      <Flex w={'100%'}>
        <Image
          src={profileData?.pic}
          alt="Profile"
          borderRadius="10%"
          width="80px"
          height="80px"
          marginRight="20px"
        />
        <Box margin={'5px'} position={'relative'}>
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            w={'100%'}
            position="relative"
            marginBottom={'15px'}
          >
            <Flex alignItems={'center'}>
              <Heading
                as="h4"
                size={'sm'}
                marginY={'2px'}
                color={selectedDatafromCurrIQ?.textColor}
              >
                {profileData?.name}
              </Heading>
              <Flex>
                {user?.role === 'guest' && (
                  <Button
                    w={'20px'}
                    height={'20px'}
                    bg={'transparent'}
                    color={'white'}
                    _hover={{
                      bg: 'transparent',
                      color: 'white',
                    }}
                    // onClick={}
                    onClick={() => setIsGuestLoggedin(true)}
                  >
                    <QuestionOutlineIcon w={'auto'} height={'18px'} />
                  </Button>
                )}
              </Flex>
            </Flex>
            <Suspense fallback={<Spinner />}>
              <NameLightning
                boxShadow={selectedDatafromMaxIQ?.boxShadow}
                MAX_IQ={MAX_IQ}
              />
            </Suspense>
          </Flex>
          <Heading as="h6" fontSize={'12px'}>
            {leftProfileView.inGameName}
          </Heading>

          <Heading as="h6" fontSize={'12px'}>
            Rank : {leftProfileView.rank}
          </Heading>
        </Box>
        {window.location.pathname.split('/').pop() !== user?.inGameName && (
          <Flex marginLeft={'1.5rem'} paddingTop={'10px'}>
            {loading ? (
              <Spinner />
            ) : !user ? null : isFriend ? (
              <Badge
                colorScheme="green"
                variant="solid"
                borderRadius="full"
                px={2}
                height={'fit-content'}
                py={1}
              >
                Friend
              </Badge>
            ) : (
              <Flex
                h={'fit-content'}
                cursor={
                  canSendRequest && !requestSent ? 'pointer' : 'not-allowed'
                }
                onClick={handleRequestClick}
                disabled={!canSendRequest || requestSent}
              >
                <UserPlusSVG
                  height={'20px'}
                  width={'20px'}
                  fill={!canSendRequest || requestSent ? 'grey' : 'white'}
                />
              </Flex>
            )}
          </Flex>
        )}
      </Flex>

      <Box marginTop={'10px'} w={{ base: '100%', lg: '100%' }}>
        <Flex mb={2}>
          <Text align={'justify'}>{profileData?.bio}</Text>
        </Flex>

        {window.location.pathname.split('/').pop() === user?.inGameName ? (
          <Flex w={'100%'} justifyContent={'center'}>
            <Button
              size="md"
              height="35px"
              width="100%"
              border="5px"
              borderColor="green.200"
              backgroundColor="#F2D8D8"
              color="#374259"
              css={{
                '&:hover': {
                  backgroundColor: '#316B83',
                  color: '#11324D',
                },
              }}
              onClick={handleEditClick}
            >
              Edit Profile
            </Button>
          </Flex>
        ) : null}
      </Box>

      {isEditModalOpen && (
        <Suspense fallback={<Spinner />}>
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profileData={profileData}
            onSubmit={handleSubmitModal}
          />
        </Suspense>
      )}
      <GuestLoginModal isOpen={isGuestLoggedin} onClose={handleClose} />
    </Flex>
  )
}

export default LeftProfileBox
