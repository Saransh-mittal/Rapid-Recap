import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from 'react'
import { Flex, Image, Tooltip, Text, Spinner, Badge } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next' // Import i18next hook

import CircleAndSocietyData from '../../../assets/CircleAndSocietyData'
import { useDispatch, useSelector } from 'react-redux'
import Lock from '/images/lock.webp'
import { addNoteMessage } from '../../../redux/appSlice'

// Lazy load components
const BrainModal = lazy(() => import('./RankAndSocietySubCompnents/BrainModal'))
const CircleModal = lazy(() =>
  import('./RankAndSocietySubCompnents/CircleModal'),
)
const EnhancedSocietyCircle = lazy(() =>
  import('./RankAndSocietySubCompnents/EnhancedSocietyCircle'),
)

const RankAndSociety = ({
  USER_IQ = 0,
  privateSociety,
  loginedUserProfile,
  isDisabled = false,
  isGuest,
}) => {
  const { t } = useTranslation('RankAndSociety') // Initialize translation hook
  const { user } = useSelector(state => state.auth)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCircleModalOpen, setIsCircleModalOpen] = useState(false)
  const [showBrainModal, setShowBrainModal] = useState(false)
  const [showCircleModal, setShowCircleModal] = useState(false)
  const dispatch = useDispatch()

  // Memoize the circleAndSociety calculation
  const circleAndSociety = useMemo(() => {
    const userCircleAndSociety = CircleAndSocietyData.find(
      data =>
        data.IQ_Lower <= USER_IQ &&
        (data.IQ_Upper ? data.IQ_Upper > USER_IQ : true),
    )
    return (
      userCircleAndSociety ||
      CircleAndSocietyData[CircleAndSocietyData.length - 1]
    )
  }, [USER_IQ])

  useEffect(() => {
    setIsLoading(false)
  }, [])

  // Memoized event handlers
  const handleBrainClick = useCallback(() => {
    if (!isDisabled) {
      setShowBrainModal(true)
      setIsModalOpen(true)
    }
  }, [isDisabled])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const handleCircleClick = useCallback(() => {
    if (!isDisabled) {
      setShowCircleModal(true)
      setIsCircleModalOpen(true)
    }
  }, [isDisabled])

  const handleCloseCircleModal = useCallback(() => {
    setIsCircleModalOpen(false)
  }, [])

  if (isGuest) {
    return (
      <Flex
        margin="10px"
        w="100%"
        h={'100%'}
        flexDirection="column"
        position="relative"
        py={5}
        justifyContent={'center'}
        alignItems={'center'}
        mt={-5}
      >
        <Image
          h="200px"
          w="200px"
          background="transparent"
          src={Lock}
          onClick={() => {
            dispatch(
              addNoteMessage({
                title: t('guestMessage.title'), // Translation key
                duration: 10000,
                width: '250px',
                actions: [
                  {
                    actionType: 'SECURE_YOUR_PROGRESS',
                  },
                ],
              }),
            )
          }}
          _hover={{ cursor: 'pointer' }}
        />
        <Text>{t('guestMessage.text')}</Text> {/* Translation key */}
      </Flex>
    )
  }

  return (
    <Flex
      margin="10px"
      w="100%"
      h={'100%'}
      flexDirection="column"
      position="relative"
      justifyContent={'center'}
      alignItems={'center'}
    >
      {privateSociety ? (
        <Flex
          h={'220px'}
          w={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Text
            backgroundColor="#0f0d15"
            m={0}
            top={0}
            right={10}
            color={'#9CAFAA'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            w={'60px'}
            height={'30px'}
          >
            {t('privateSociety.hidden')}
          </Text>
        </Flex>
      ) : isLoading ? (
        <Spinner />
      ) : (
        <>
          <Suspense fallback={<Spinner />}>
            <EnhancedSocietyCircle
              societyData={circleAndSociety}
              handleBrainClick={handleBrainClick}
              handleCircleClick={handleCircleClick}
            />
          </Suspense>
        </>
      )}
      {/* Modals */}
      <Suspense fallback={<Spinner />}>
        {showBrainModal && (
          <BrainModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            currentUserSociety={circleAndSociety.society.split(' ')[0]}
            setShowBrainModal={setShowBrainModal}
          />
        )}
        {showCircleModal && (
          <CircleModal
            isOpen={isCircleModalOpen}
            onClose={handleCloseCircleModal}
            currentUserCircle={
              circleAndSociety.circle
                ? circleAndSociety.circle.split(' ')[0]
                : ''
            }
            setShowCircleModal={setShowCircleModal}
          />
        )}
      </Suspense>
    </Flex>
  )
}

export default RankAndSociety
