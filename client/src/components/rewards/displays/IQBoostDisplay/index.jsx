import React from 'react'
import { Box } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import BaseRewardDisplay from '../../common/BaseRewardDisplay'
import {
  BrainIcon,
  NeuronEffect,
  ScoreDisplay,
  ClaimButton,
  SuccessMessage,
} from './components'
import useRewardState from '../../hooks/useRewardState'

const IQBoostDisplay = ({ reward, onClaim, claimed: initialClaimed }) => {
  const { claimed, showSuccess, handleClaim } = useRewardState({
    onClaim,
    initialClaimed,
  })

  return (
    <BaseRewardDisplay
      title={reward.title}
      description={reward.description}
      icon={BrainIcon}
      claimed={claimed}
      onClaim={handleClaim}
      type={reward.type}
    >
      <React.Fragment key={'IQ_BOOST'}>
        <NeuronEffect />
        <ScoreDisplay prevScore={reward.prevScore} newScore={reward.newScore} />

        <Box w="full" mt={6}>
          <AnimatePresence mode="wait">
            {!claimed && (
              <ClaimButton
                key={'claim-button'}
                onClick={handleClaim}
                disabled={claimed}
              />
            )}
            {showSuccess && <SuccessMessage key={'success-message'} />}
          </AnimatePresence>
        </Box>
      </React.Fragment>
    </BaseRewardDisplay>
  )
}

export default IQBoostDisplay
