// components/quickClashComponents/ui/EnhancedTrophyChangeDisplay.jsx
import React, { useEffect } from 'react'
import { Box, Flex, Icon, Text, HStack, Tooltip } from '@chakra-ui/react'
import { motion, useAnimation } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  ChevronUp,
  ChevronDown,
  Shield,
  Equal,
  Minus,
  Trophy,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionText = motion(Text)
const MotionIcon = motion(Icon)

// Define keyframe animations for premium effects
const premiumAnimations = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes glow {
    0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
    50% { filter: drop-shadow(0 0 12px currentColor); }
  }
`

/**
 * Premium sleek trophy change display component with animated trophy icons
 */
const EnhancedTrophyChangeDisplay = ({
  trophyChange,
  showAnimation = false,
  size = 'sm',
  protectionApplied = false,
  isTie = false,
}) => {
  const { t } = useTranslation('QuickClash')
  const controls = useAnimation()
  const trophyControls = useAnimation()

  useEffect(() => {
    if (showAnimation) {
      // Main content animation - reduced intensity
      controls.start({
        scale: [1, 1.08, 1],
        transition: {
          duration: 0.5,
          repeat: 1,
          repeatType: 'reverse',
        },
      })

      // Trophy icon animation - reduced intensity
      trophyControls.start({
        rotate: [0, 8, -8, 0],
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.6,
          repeat: 0,
          repeatType: 'reverse',
        },
      })
    }
  }, [showAnimation, controls, trophyControls])

  if (trophyChange === undefined) return null

  // Determine sizes - adjusted thickness and increased font size
  const iconSize = size === 'xs' ? 2.5 : size === 'sm' ? 3 : 3.5
  const trophyIconSize = size === 'xs' ? 2 : size === 'sm' ? 3 : 4
  const fontSize = size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'md'
  const paddingX = size === 'xs' ? 1.5 : size === 'sm' ? 2.5 : 3
  const paddingY = size === 'xs' ? 0.5 : size === 'sm' ? 1 : 1.5
  const minHeight = size === 'xs' ? '22px' : size === 'sm' ? '26px' : '30px'
  const maxHeight = size === 'xs' ? '26px' : size === 'sm' ? '30px' : '34px'

  // Enhanced Zero change display
  if (trophyChange === 0) {
    // Determine the reason and styling for zero change
    const getZeroChangeConfig = () => {
      if (protectionApplied) {
        return {
          icon: Shield,
          color: 'blue.400',
          bgGradient:
            'linear(135deg, rgba(66, 153, 225, 0.25), rgba(99, 179, 237, 0.15))',
          borderColor: 'rgba(66, 153, 225, 0.6)',
          shadowColor: 'rgba(66, 153, 225, 0.4)',
          text: t('Protected'),
          tooltip: t('Your trophies were protected from loss'),
          pulseAnimation: true,
          shimmerEffect: true,
        }
      } else if (isTie) {
        return {
          icon: Equal,
          color: 'yellow.400',
          bgGradient:
            'linear(135deg, rgba(236, 201, 75, 0.25), rgba(251, 211, 141, 0.15))',
          borderColor: 'rgba(236, 201, 75, 0.6)',
          shadowColor: 'rgba(236, 201, 75, 0.4)',
          text: t('Tie'),
          tooltip: t('Equal performance - no trophy change'),
          pulseAnimation: true,
          shimmerEffect: true,
        }
      } else {
        return {
          icon: Minus,
          color: 'gray.400',
          bgGradient:
            'linear(135deg, rgba(160, 160, 160, 0.2), rgba(160, 160, 160, 0.1))',
          borderColor: 'rgba(160, 160, 160, 0.4)',
          shadowColor: 'rgba(160, 160, 160, 0.3)',
          text: '0',
          tooltip: t('No trophy change'),
          pulseAnimation: false,
          shimmerEffect: false,
        }
      }
    }

    const config = getZeroChangeConfig()

    return (
      <>
        <style>{premiumAnimations}</style>
        <Tooltip label={config.tooltip} placement="top" hasArrow>
          <MotionBox
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
          >
            <MotionFlex
              align="center"
              bgGradient={config.bgGradient}
              px={paddingX}
              py={paddingY}
              borderRadius="full"
              borderWidth="1px"
              borderColor={config.borderColor}
              boxShadow={`0 0 8px ${config.shadowColor}`}
              minH={minHeight}
              maxH={maxHeight}
              cursor="default"
              position="relative"
              overflow="hidden"
              animate={
                config.pulseAnimation
                  ? {
                      boxShadow: [
                        `0 0 8px ${config.shadowColor}`,
                        `0 0 10px ${config.shadowColor}`,
                        `0 0 8px ${config.shadowColor}`,
                      ],
                      transition: {
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      },
                    }
                  : {}
              }
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 12px ${config.shadowColor}`,
              }}
              _before={
                config.shimmerEffect
                  ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s infinite linear',
                      borderRadius: 'full',
                    }
                  : {}
              }
            >
              {/* Trophy icon - positioned on the left */}
              <MotionIcon
                as={Trophy}
                color="yellow.400"
                boxSize={trophyIconSize}
                mr={1}
                animate={
                  showAnimation
                    ? {
                        rotate: [0, 6, 0, -6, 0],
                        transition: {
                          duration: 1,
                          repeat: 0,
                          repeatType: 'reverse',
                        },
                      }
                    : trophyControls
                }
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
                }}
              />

              {/* Status icon and text */}
              <HStack spacing={0.5}>
                <MotionIcon
                  as={config.icon}
                  color={config.color}
                  boxSize={iconSize}
                  animate={
                    showAnimation && config.pulseAnimation
                      ? {
                          rotate: [0, 3, 0, -3, 0],
                          transition: {
                            duration: 0.6,
                            repeat: 1,
                            repeatType: 'reverse',
                          },
                        }
                      : {}
                  }
                />
                <MotionText
                  color={config.color}
                  fontWeight="semibold"
                  fontSize={fontSize}
                  lineHeight="1"
                  animate={controls}
                >
                  {config.text}
                </MotionText>
              </HStack>
            </MotionFlex>
          </MotionBox>
        </Tooltip>
      </>
    )
  }

  // Positive change
  if (trophyChange > 0) {
    return (
      <>
        <style>{premiumAnimations}</style>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9, y: 3 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 400,
              damping: 20,
            },
          }}
        >
          <MotionFlex
            align="center"
            bgGradient="linear(135deg, rgba(72, 187, 120, 0.25), rgba(104, 211, 145, 0.15))"
            px={paddingX}
            py={paddingY}
            borderRadius="full"
            borderWidth="1px"
            borderColor="rgba(72, 187, 120, 0.6)"
            boxShadow="0 0 8px rgba(72, 187, 120, 0.3)"
            minH={minHeight}
            maxH={maxHeight}
            position="relative"
            overflow="hidden"
            animate={controls}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 12px rgba(72, 187, 120, 0.5)',
            }}
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              backgroundSize: '200% 100%',
              animation: showAnimation ? 'shimmer 2s infinite linear' : 'none',
              borderRadius: 'full',
            }}
          >
            {/* Trophy icon - positioned on the left */}
            <MotionIcon
              as={Trophy}
              color="yellow.400"
              boxSize={trophyIconSize}
              mr={1}
              animate={trophyControls}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
              }}
            />

            {/* Change indicator and value */}
            <HStack spacing={0.5}>
              <MotionIcon
                as={ChevronUp}
                color="green.400"
                boxSize={iconSize}
                animate={
                  showAnimation
                    ? {
                        y: [0, -1, 0],
                        transition: {
                          duration: 0.6,
                          repeat: 1,
                          repeatType: 'reverse',
                        },
                      }
                    : {}
                }
              />
              <MotionText
                color="green.300"
                fontWeight="bold"
                fontSize={fontSize}
                lineHeight="1"
                animate={controls}
              >
                +{trophyChange}
              </MotionText>
            </HStack>
          </MotionFlex>
        </MotionBox>
      </>
    )
  }

  // Negative change
  return (
    <>
      <style>{premiumAnimations}</style>
      <MotionBox
        initial={{ opacity: 0, scale: 0.9, y: 3 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 400,
            damping: 20,
          },
        }}
      >
        <MotionFlex
          align="center"
          bgGradient="linear(135deg, rgba(245, 101, 101, 0.25), rgba(252, 129, 129, 0.15))"
          px={paddingX}
          py={paddingY}
          borderRadius="full"
          borderWidth="1px"
          borderColor="rgba(245, 101, 101, 0.6)"
          boxShadow="0 0 8px rgba(245, 101, 101, 0.3)"
          minH={minHeight}
          maxH={maxHeight}
          position="relative"
          overflow="hidden"
          animate={controls}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 12px rgba(245, 101, 101, 0.5)',
          }}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            backgroundSize: '200% 100%',
            animation: showAnimation ? 'shimmer 2s infinite linear' : 'none',
            borderRadius: 'full',
          }}
        >
          {/* Trophy icon - positioned on the left */}
          <MotionIcon
            as={Trophy}
            color="yellow.400"
            boxSize={trophyIconSize}
            mr={1}
            animate={trophyControls}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
            }}
          />

          {/* Change indicator and value */}
          <HStack spacing={0.5}>
            <MotionIcon
              as={ChevronDown}
              color="red.400"
              boxSize={iconSize}
              animate={
                showAnimation
                  ? {
                      y: [0, 1, 0],
                      transition: {
                        duration: 0.6,
                        repeat: 1,
                        repeatType: 'reverse',
                      },
                    }
                  : {}
              }
            />
            <MotionText
              color="red.300"
              fontWeight="bold"
              fontSize={fontSize}
              lineHeight="1"
              animate={controls}
            >
              {trophyChange}
            </MotionText>
          </HStack>
        </MotionFlex>
      </MotionBox>
    </>
  )
}

export default EnhancedTrophyChangeDisplay
