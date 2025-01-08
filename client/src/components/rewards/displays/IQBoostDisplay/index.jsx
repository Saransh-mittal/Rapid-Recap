// src/components/rewards/displays/IQBoostDisplay/index.jsx
import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import BaseRewardDisplay from '../../common/BaseRewardDisplay'
import {
  BrainIcon,
  NeuronEffect,
  ScoreDisplay,
  ClaimButton,
  SuccessMessage,
  TournamentBadgeIcon,
} from './components'
import useRewardState from '../../hooks/useRewardState'
import { getRankTheme } from './constants/tournamentConstants'
import { handleTournamentRewardsClaim } from '../../../../utils/tournamentRewards'
import { useDispatch, useSelector } from 'react-redux'

const IQBoostDisplay = ({ reward, onClaim, claimed: initialClaimed }) => {
  const { claimed, showSuccess, handleClaim } = useRewardState({
    onClaim,
    initialClaimed,
  })
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  // Get theme if it's a tournament reward
  const theme = reward.tournamentReward ? getRankTheme(reward.rank) : null

  return (
    <BaseRewardDisplay reward={reward} type={reward.type} theme={theme}>
      <VStack spacing={6} w="full">
        {/* Tournament Badge & Number */}
        {reward.tournamentReward ? (
          <VStack textAlign="center" spacing={4}>
            <TournamentBadgeIcon rank={reward.rank} theme={theme} />
            <Text
              fontSize="lg"
              bgGradient={
                theme?.titleGradient || 'linear(to-r, yellow.300, yellow.500)'
              }
              bgClip="text"
              fontWeight="medium"
            >
              Tournament #
              {String(reward.badge.tournamentNumber).padStart(3, '0')}
            </Text>
          </VStack>
        ) : (
          <BrainIcon />
        )}

        {/* Title */}
        <Text
          fontSize={{ base: '2xl', md: '4xl' }}
          fontWeight="extrabold"
          bgGradient={
            theme?.titleGradient || 'linear(to-r, blue.300, blue.500)'
          }
          bgClip="text"
          textAlign="center"
          textShadow={`0 0 20px ${theme?.glowColor || 'rgba(66,153,225,0.2)'}`}
        >
          {reward.title}
        </Text>

        <NeuronEffect theme={theme} />

        <ScoreDisplay
          prevScore={reward.prevScore}
          newScore={reward.newScore}
          theme={theme}
        />

        {/* Description */}
        <VStack spacing={3}>
          <Text
            fontSize={{ base: 'lg', md: '2xl' }}
            color="whiteAlpha.900"
            textAlign="center"
            opacity={0.9}
            maxW="lg"
            mx="auto"
          >
            {reward.description}
          </Text>

          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            color="whiteAlpha.600"
            textAlign="center"
            fontStyle="italic"
            maxW="md"
            mx="auto"
          >
            This final IQ score reflects your achievement at the time of the
            tournament and may differ from your current IQ score.
          </Text>
        </VStack>

        <Box w="full" mt={6}>
          <AnimatePresence mode="wait">
            {!claimed && (
              <ClaimButton
                key="claim-button"
                onClick={() => {
                  handleTournamentRewardsClaim({
                    badge: reward.badge,
                    user,
                    dispatch,
                  })
                  handleClaim()
                }}
                disabled={claimed}
                theme={theme}
              />
            )}
            {showSuccess && (
              <SuccessMessage key="success-message" theme={theme} />
            )}
          </AnimatePresence>
        </Box>
      </VStack>
    </BaseRewardDisplay>
  )
}

export default IQBoostDisplay
