import React, { useMemo, useCallback } from 'react'
import { Box, Flex, Text, Container, VStack, HStack } from '@chakra-ui/react'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const AnimatedWater = styled(Box)`
  position: absolute;
  z-index: 1;
  width: 200%;
  height: 200%;
  left: -50%;
  top: ${props => `${100 - props.percent}%`};
  border-radius: 40%;
  background-color: #4299e1;
  opacity: 0.7;
  animation: ${spin} 10s linear infinite;
  transition: all 1s ease;
  box-shadow: 0 0 20px #63b3ed;
`

const GlowingText = styled(Text)`
  text-shadow: 0 0 10px currentColor;
`

const ProgressBubble = ({ xp, level }) => {
  const { t } = useTranslation('ProfileExperienceLevel')

  const calculateProgress = useCallback((transitionXp, requiredXP) => {
    return Math.round(100 - (requiredXP / transitionXp) * 100)
  }, [])

  const calculateRequiredXp = useCallback((xp, xpBaseAtNextLevel) => {
    return xpBaseAtNextLevel - xp
  }, [])

  const colorInc = 100 / 3

  const xpBaseAtCurrLevel = useMemo(
    () => (level * (level + 1) * 10) / 2,
    [level],
  )
  const xpBaseAtNextLevel = useMemo(
    () => ((level + 1) * (level + 2) * 10) / 2,
    [level],
  )

  const requiredXP = useMemo(
    () => calculateRequiredXp(xp, xpBaseAtNextLevel),
    [xp, xpBaseAtNextLevel, calculateRequiredXp],
  )
  const percent = useMemo(
    () => calculateProgress(xpBaseAtNextLevel - xpBaseAtCurrLevel, requiredXP),
    [xpBaseAtNextLevel, xpBaseAtCurrLevel, requiredXP, calculateProgress],
  )

  const getColor = useCallback(() => {
    if (percent < colorInc * 1) return 'red.400'
    if (percent < colorInc * 2) return 'orange.300'
    return 'green.300'
  }, [percent, colorInc])

  return (
    <Container
      maxW="container.sm"
      p={6}
      style={{
        backgroundColor: 'rgba(15, 13, 21, 0.8)',
        boxShadow:
          '0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="gray.400" fontWeight="medium">
              {t('experienceProgress')}
            </Text>
            <GlowingText fontSize="3xl" fontWeight="bold" color={getColor()}>
              {t('level')} {level}
            </GlowingText>
          </VStack>
          <Box position="relative" width="120px" height="120px">
            <Box
              position="relative"
              borderRadius="50%"
              w="120px"
              h="120px"
              border="5px solid"
              borderColor={getColor()}
              boxShadow={`0 0 20px ${getColor()}`}
              transition="all 1s ease"
            >
              <Box
                position="absolute"
                overflow="hidden"
                zIndex="2"
                borderRadius="50%"
                w="110px"
                h="110px"
                border="5px solid rgba(255, 255, 255, 0.1)"
                transition="all 1s ease"
              >
                <Flex
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="24px"
                  color={getColor()}
                  zIndex="3"
                >
                  {percent}%
                </Flex>
                <AnimatedWater percent={percent} />
              </Box>
            </Box>
          </Box>
        </HStack>
        <VStack
          spacing={4}
          align="stretch"
          bg="rgba(255, 255, 255, 0.05)"
          p={4}
          borderRadius="md"
          boxShadow="sm"
        >
          <HStack justify="space-between">
            <Text fontWeight="medium" color="gray.300">
              {t('currentXp')}:
            </Text>
            <GlowingText fontWeight="bold" color={getColor()}>
              {xp}
            </GlowingText>
          </HStack>
          <HStack justify="space-between">
            <Text fontWeight="medium" color="gray.300">
              {t('xpToNextLevel')}:
            </Text>
            <GlowingText fontWeight="bold" color={getColor()}>
              {requiredXP}
            </GlowingText>
          </HStack>
          <HStack justify="space-between">
            <Text fontWeight="medium" color="gray.300">
              {t('nextLevel')}:
            </Text>
            <GlowingText fontWeight="bold" color={getColor()}>
              {level + 1}
            </GlowingText>
          </HStack>
        </VStack>
      </VStack>
    </Container>
  )
}

export default React.memo(ProgressBubble)
