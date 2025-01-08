// src/components/rewards/displays/TournamentWinnerDisplay/index.jsx
import React from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { RewardCard, ClaimButton, AchievementIcon } from './components'
import AnimatedBackground from './components/AnimatedBackground'
import { REWARD_VARIANTS } from '../../constants/rewardTypes'
import useRewardState from '../../hooks/useRewardState'
import { handleTournamentRewardsClaim } from '../../../../utils/tournamentRewards'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useState } from 'react'
import CategorySelector from './components/CategorySelector'

const TournamentWinnerDisplay = React.memo(
  ({ reward, onClaim, claimed: initialClaimed }) => {
    const { claimed, handleClaim } = useRewardState({
      onClaim,
      initialClaimed,
    })
    const [showCategorySelector, setShowCategorySelector] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const { user } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const variant = REWARD_VARIANTS[reward.type]

    const handleCategorySelected = updatedBadge => {
      setSelectedCategory(updatedBadge.text)
      setShowCategorySelector(false)
    }
    useEffect(() => {
      // Check if this is an unnamed badge (current affairs)
      if (!reward.category && !selectedCategory) {
        setShowCategorySelector(true)
      }
    }, [reward.category, selectedCategory])
    return (
      <Box
        position="fixed"
        inset={0}
        overflow="hidden"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
        bg="black"
      >
        {/* Background layer */}
        <AnimatedBackground key="tournament-background" type={reward.type} />

        {/* Content Container */}
        <Box
          maxH="100dvh"
          w="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={4}
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': { width: '0px' },
            scrollbarWidth: 'none',
          }}
        >
          <VStack
            spacing={{ base: 6, md: 8 }}
            maxW={{ base: '100%', md: '500px' }}
            w="full"
            py={{ base: 8, md: 10 }}
            position="relative"
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AchievementIcon variant={variant} type={reward.type} />
            {showCategorySelector ? (
              <CategorySelector
                badgeName={reward.badge.badgeName}
                onCategorySelected={handleCategorySelected}
                variant={variant}
              />
            ) : (
              <>
                {/* Category */}
                <HStack spacing={2}>
                  {React.createElement(LucideIcons[variant.icon], {
                    size: 24,
                    color: `var(--chakra-colors-${
                      variant.iconColor?.split('.').join('-') ||
                      `${variant.colorScheme}-400`
                    })`,
                  })}
                  <Text
                    bgGradient={REWARD_VARIANTS[reward.type].titleGradient}
                    bgClip="text"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="medium"
                    textTransform={'uppercase'}
                  >
                    {selectedCategory || reward.category}
                  </Text>
                </HStack>

                {/* Title & Description */}
                <VStack spacing={2}>
                  <Text
                    fontSize={{ base: '4xl', md: '6xl' }}
                    fontWeight="extrabold"
                    bgGradient={REWARD_VARIANTS[reward.type].titleGradient}
                    bgClip="text"
                    textAlign="center"
                    letterSpacing="tight"
                    as={motion.p}
                    animate={{
                      scale: [1, 1.02, 1],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                  >
                    {reward.title}
                  </Text>

                  <Text
                    color="whiteAlpha.900"
                    fontSize={{ base: 'lg', md: 'xl' }}
                    textAlign="center"
                    opacity={0.9}
                  >
                    {reward.description}
                  </Text>
                </VStack>

                {/* Rewards */}
                <VStack w="full" spacing={4} maxW="md" mx="auto">
                  {reward.rewards.map((rewardItem, index) => (
                    <RewardCard
                      key={index}
                      {...rewardItem}
                      delay={index * 0.2}
                      variant={variant}
                    />
                  ))}
                </VStack>

                {/* Claim Button */}
                <Box w="full" maxW="md" mt={4}>
                  <ClaimButton
                    onClick={() => {
                      handleTournamentRewardsClaim({
                        badge: reward.badge,
                        user,
                        dispatch,
                      })
                      handleClaim()
                    }}
                    claimed={claimed}
                    variant={variant}
                  />
                </Box>
              </>
            )}
          </VStack>
        </Box>
      </Box>
    )
  },
)

TournamentWinnerDisplay.displayName = 'TournamentWinnerDisplay'

export default TournamentWinnerDisplay
