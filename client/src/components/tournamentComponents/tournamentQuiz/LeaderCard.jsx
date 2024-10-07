// LeaderCard.js
import React, { useMemo } from 'react'
import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'

import Medal from '../../../assets/svg/Medal'
import CrownSVG from '../../../assets/svg/CrownSVG'

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
`

const LeaderCard = ({ rank, inGameName, score }) => {
  // Memoize background gradient and icon to avoid recalculation on every render
  const { t } = useTranslation('LeaderCard')
  const bgGradient = useMemo(() => {
    return rank === 1
      ? 'linear(to-b, rgba(255,215,0,0.3), rgba(255,215,0,0.1))'
      : rank === 2
      ? 'linear(to-b, rgba(255,165,0,0.3), rgba(255,165,0,0.1))'
      : 'linear(to-b, rgba(218,165,32,0.3), rgba(218,165,32,0.1))'
  }, [rank])

  const icon = useMemo(() => {
    return rank === 1 ? (
      <CrownSVG size="24px" color="#FFD700" />
    ) : (
      <Medal size="24px" color={rank === 2 ? '#FFA500' : '#DAA520'} />
    )
  }, [rank])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.2 }}
    >
      <Flex
        bg={bgGradient}
        borderRadius="lg"
        p={4}
        alignItems="center"
        justifyContent="space-between"
        boxShadow="xl"
        w="100%"
        border="1px solid rgba(255,215,0,0.2)"
        animation={rank === 1 ? `${glowAnimation} 2s infinite` : 'none'}
      >
        <HStack spacing={4}>
          <Box>{icon}</Box>
          <VStack alignItems="flex-start" spacing={0}>
            <Text fontWeight="bold" fontSize="xl" color="white">
              {inGameName}
            </Text>
            <Text fontSize="sm" color="rgba(255,255,255,0.8)">
              {t('Rank')} {rank}
            </Text>
          </VStack>
        </HStack>
        <Text fontWeight="bold" fontSize="2xl" color="white">
          {score}
        </Text>
      </Flex>
    </motion.div>
  )
}

export default LeaderCard
