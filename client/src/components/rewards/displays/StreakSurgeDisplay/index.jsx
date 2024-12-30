import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'
import { Trophy, Star, Sparkles, Gift, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import BaseRewardDisplay from '../../common/BaseRewardDisplay'
import { RewardIcon, RewardCard } from './components'
import useRewardState from '../../hooks/useRewardState'
import { claimStreakSurge } from '../../../../utils/quiz.utils'
import { useTranslation } from 'react-i18next'

// Map for dynamic icons based on reward title
const REWARD_ICONS = {
  'Bonus XP': Star,
  'RQM Boost': Zap,
}

// Map for reward gradients
const REWARD_GRADIENTS = {
  'Bonus XP': 'linear-gradient(145deg, #92400E, #B45309)',
  'RQM Boost': 'linear-gradient(145deg, #3730A3, #4338CA)',
}

const StreakSurgeDisplay = ({ reward, onClaim, claimed: initialClaimed }) => {
  const { claimed, showSuccess, handleClaim } = useRewardState({
    onClaim,
    initialClaimed,
  })

  const rewardItems = reward.rewards.map(rewardItem => {
    const Icon = REWARD_ICONS[rewardItem.title] || Star // fallback to Star if no icon found
    return {
      icon: <Icon size={24} />,
      title: rewardItem.title,
      amount: rewardItem.amount,
      color: rewardItem.color,
      gradient:
        REWARD_GRADIENTS[rewardItem.title] ||
        `linear-gradient(145deg, ${rewardItem.color}88, ${rewardItem.color}aa)`,
    }
  })
  const { t } = useTranslation('StreakSurgeDisplay')

  return (
    <BaseRewardDisplay
      reward={reward}
      claimed={claimed}
      onClaim={() => {
        claimStreakSurge()
        handleClaim()
      }}
      type="STREAK_SURGE"
    >
      <VStack
        key={'streak-surge-display'}
        spacing={8}
        w="full"
        maxW="600px"
        mx="auto"
        px={{ base: 0, md: 4 }}
      >
        {/* Trophy Section */}
        <Box position="relative" mb={4}>
          <RewardIcon
            icon={
              <Trophy
                size={70}
                style={{
                  color: '#FDB813',
                  filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))',
                }}
              />
            }
          />

          <VStack spacing={2} textAlign="center" mt={6}>
            <Text
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="bold"
              bgGradient="linear(135deg, #FDB813, #FEDD77)"
              bgClip="text"
              textShadow="0 2px 4px rgba(0,0,0,0.1)"
            >
              {t('rewards.bonus_xp')}
            </Text>
            <Text
              color="whiteAlpha.900"
              fontSize={{ base: 'md', md: 'lg' }}
              opacity={0.9}
            >
              {t('rewards.rqm_boost')}
            </Text>
          </VStack>
        </Box>

        {/* Rewards Section */}
        <VStack w="full" maxW="360px" spacing={3} mb="auto">
          {rewardItems.map((rewardItem, index) => (
            <RewardCard
              key={`${rewardItem.title}-${index}`}
              reward={rewardItem}
              index={index}
            />
          ))}
        </VStack>

        {/* Claim Button Section */}
        <Box w="full" maxW="360px" mt={8}>
          <AnimatePresence mode="wait">
            {!claimed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{ width: '100%' }}
              >
                <Box
                  as="button"
                  w="full"
                  py={5}
                  px={6}
                  bgGradient="linear(135deg, blue.600, blue.400)"
                  color="white"
                  rounded="xl"
                  fontSize="lg"
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={3}
                  border="1px solid"
                  borderColor="blue.400"
                  boxShadow="lg"
                  _hover={{
                    transform: 'scale(1.02)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                  }}
                  onClick={() => {
                    claimStreakSurge()
                    handleClaim()
                  }}
                  transition="all 0.3s ease"
                >
                  <Gift size={22} />
                  {t('buttons.claim')}
                  <Sparkles size={22} />
                </Box>
              </motion.div>
            ) : showSuccess ? ( // Only show success message when showSuccess is true
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                <Text
                  color="green.400"
                  fontSize="2xl"
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={3}
                >
                  <Sparkles />
                  {t('messages.success')}
                  <Sparkles />
                </Text>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Box>
      </VStack>
    </BaseRewardDisplay>
  )
}

export default StreakSurgeDisplay
