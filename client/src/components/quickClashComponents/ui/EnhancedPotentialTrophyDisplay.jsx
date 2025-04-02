// components/quickClashComponents/ui/EnhancedTrophyDisplay.jsx
import React, { useEffect } from 'react'
import { Box, Flex, Icon, Text, Tooltip, HStack } from '@chakra-ui/react'
import { motion, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Trophy, TrendingUp } from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

/**
 * Enhanced component to display potential trophy gains with animation
 */
const EnhancedPotentialTrophyDisplay = ({
  potentialGain = 0,
  showWinLoss = true,
  size = 'md',
  compact = false,
}) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimation()

  // If no potential gain, don't render anything
  if (potentialGain === 0) return null

  // Calculate sizes based on prop
  const iconSize = size === 'sm' ? 3 : size === 'md' ? 4 : 5
  const fontSize = size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'

  useEffect(() => {
    // Run initial animation
    controls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.6 },
    })
  }, [controls])

  // Compact version just shows trophy icon and potential gain
  if (compact) {
    return (
      <Tooltip label={t('Potential trophy gain')}>
        <MotionFlex
          spacing={1}
          align="center"
          bg="rgba(255, 215, 0, 0.15)"
          px={2}
          py={0.5}
          borderRadius="full"
          borderWidth="1px"
          borderColor="rgba(255, 215, 0, 0.4)"
          boxShadow="0 0 8px rgba(255, 215, 0, 0.2)"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            },
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 12px rgba(255, 215, 0, 0.3)',
          }}
        >
          <MotionIcon
            as={Trophy}
            color="yellow.400"
            boxSize={iconSize}
            mr={1}
            animate={{
              rotate: [0, 5, 0, -5, 0],
              transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                repeatDelay: 3,
              },
            }}
          />
          <MotionText
            color="green.400"
            fontWeight="bold"
            fontSize={fontSize}
            animate={controls}
          >
            +{potentialGain}
          </MotionText>
        </MotionFlex>
      </Tooltip>
    )
  }

  return (
    <Tooltip
      label={t('Win to earn trophies and rise in the leaderboard!')}
      placement="top"
      hasArrow
    >
      <MotionBox
        initial={{ opacity: 0, y: 5 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
          },
        }}
      >
        <Flex
          direction="column"
          align="center"
          bg="rgba(26, 32, 44, 0.8)"
          borderRadius="lg"
          p={2.5}
          borderWidth="1px"
          borderColor="rgba(255, 215, 0, 0.4)"
          boxShadow="0 0 15px rgba(255, 215, 0, 0.15)"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            bgGradient: 'linear(to-r, yellow.500, orange.300, yellow.400)',
            borderTopRadius: 'md',
          }}
        >
          <Text
            fontSize={size === 'sm' ? '2xs' : 'xs'}
            color="whiteAlpha.800"
            fontWeight="medium"
            mb={1.5}
            letterSpacing="wide"
          >
            {t('Trophy Stake')}
          </Text>

          {/* Potential gain */}
          {showWinLoss && (
            <HStack spacing={1.5} mb={1}>
              <MotionIcon
                as={TrendingUp}
                color="green.400"
                boxSize={iconSize}
                animate={{
                  y: [0, -2, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    repeatDelay: 2,
                  },
                }}
              />
              <HStack
                spacing={1}
                bg="rgba(72, 187, 120, 0.1)"
                px={2}
                py={0.5}
                borderRadius="full"
              >
                <MotionIcon
                  as={Trophy}
                  color="yellow.400"
                  boxSize={iconSize - 1}
                  animate={{
                    scale: [1, 1.15, 1],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                      repeatDelay: 3,
                    },
                  }}
                />
                <MotionText
                  color="green.400"
                  fontWeight="bold"
                  fontSize={fontSize}
                  animate={controls}
                >
                  +{potentialGain}
                </MotionText>
              </HStack>
            </HStack>
          )}

          {/* Or just show the value */}
          {!showWinLoss && (
            <HStack
              spacing={1.5}
              bg="rgba(72, 187, 120, 0.1)"
              px={2.5}
              py={1}
              borderRadius="full"
              boxShadow="0 0 8px rgba(72, 187, 120, 0.15)"
            >
              <MotionIcon
                as={Trophy}
                color="yellow.400"
                boxSize={iconSize}
                animate={{
                  rotate: [0, 10, 0, -10, 0],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
              />
              <MotionText
                color="green.400"
                fontWeight="bold"
                fontSize={fontSize}
                animate={controls}
              >
                +{potentialGain}
              </MotionText>
            </HStack>
          )}
        </Flex>
      </MotionBox>
    </Tooltip>
  )
}

export default EnhancedPotentialTrophyDisplay
