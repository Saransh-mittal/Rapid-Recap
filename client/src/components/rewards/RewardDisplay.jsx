import React, { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { useSelector, useDispatch } from 'react-redux'
import {
  clearCurrentReward,
  markCurrentRewardAsClaimed,
} from '../../redux/rewardsSlice'
import { REWARD_TYPES } from './constants/rewardTypes'

// Lazy load components properly
const RQMBoostDisplay = React.lazy(() =>
  import('./displays/RQMBoostDisplay/index').then(module => ({
    default: module.default || module,
  })),
)

const IQBoostDisplay = React.lazy(() =>
  import('./displays/IQBoostDisplay/index').then(module => ({
    default: module.default || module,
  })),
)
const StreakSurgeDisplay = React.lazy(() =>
  import('./displays/StreakSurgeDisplay/index').then(module => ({
    default: module.default || module,
  })),
)

// Map of reward types to their components
const rewardComponents = {
  [REWARD_TYPES.RQM_BOOST]: RQMBoostDisplay,
  [REWARD_TYPES.IQ_BOOST]: IQBoostDisplay,
  [REWARD_TYPES.STREAK_SURGE]: StreakSurgeDisplay,
}

// Loading fallback component
const LoadingFallback = () => (
  <Center p={8}>
    <Spinner size="xl" color="blue.400" thickness="4px" />
  </Center>
)

const RewardDisplay = () => {
  const dispatch = useDispatch()
  const { currentReward, isDisplaying } = useSelector(state => state.rewards)

  if (!currentReward || !isDisplaying) return null

  const RewardComponent = rewardComponents[currentReward.reward.type]

  if (!RewardComponent) {
    console.error(
      `No display component for reward type: ${currentReward.reward.type}`,
    )
    return null
  }

  const handleClaim = () => {
    dispatch(markCurrentRewardAsClaimed())
    dispatch(clearCurrentReward())
  }

  const handleClose = () => {
    dispatch(clearCurrentReward())
  }

  return (
    <AnimatePresence mode="wait">
      {isDisplaying && (
        <Modal
          key="reward-modal"
          isOpen={isDisplaying}
          onClose={handleClose}
          isCentered
          motionPreset="scale"
          size="xl"
        >
          <ModalOverlay
            key="modal-overlay"
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            bg="blackAlpha.900"
            backdropFilter="blur(10px)"
          />
          <ModalContent
            key="modal-content"
            as={motion.div}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            bg="transparent"
            boxShadow="none"
            maxW="600px"
          >
            <Suspense fallback={<LoadingFallback />}>
              <RewardComponent
                key={'reward-component'}
                reward={currentReward.reward}
                onClaim={handleClaim}
                claimed={currentReward.claimed}
              />
            </Suspense>
          </ModalContent>
        </Modal>
      )}
    </AnimatePresence>
  )
}

export default RewardDisplay
