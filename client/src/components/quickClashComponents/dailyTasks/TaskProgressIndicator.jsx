// components/quickClashComponents/dailyTasks/TaskProgressIndicator.jsx
import React from 'react'
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Icon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Trophy, Star, Gift } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'

const MotionBox = motion(Box)

// Keyframes for the glowing effect
const glowPulse = keyframes`
  0% { box-shadow: 0 0 8px #F7D147, 0 0 4px #F7D147; }
  50% { box-shadow: 0 0 16px #F7D147, 0 0 8px #F7D147; }
  100% { box-shadow: 0 0 8px #F7D147, 0 0 4px #F7D147; }
`

// Keyframes for the star rotation
const rotateStar = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

/**
 * A gamified task progress indicator that matches the Quick Clash UI
 * @param {Object} props - Component props
 * @param {Function} props.onViewTasks - Optional callback for when the indicator is clicked
 * @param {string} props.size - Size of the indicator ('sm', 'md', 'lg')
 */
const TaskProgressIndicator = ({ onViewTasks, size = 'md' }) => {
  const { t } = useTranslation('QuickClash')
  const { tasks } = useSelector(state => state.quickClashDailyTasks)

  // Calculate progress
  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length || 1 // Prevent division by zero
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)
  const isComplete = progressPercentage === 100

  // Get count of unclaimed rewards
  const unclaimedRewards = tasks.filter(
    task => task.completed && !task.rewardClaimed,
  ).length

  // Size mappings
  const sizeMap = {
    sm: {
      container: '42px',
      outerContainer: '46px',
      thickness: '4px',
      icon: '18px',
      badge: '18px',
      badgeFont: '10px',
      badgeOffset: '-5px',
      starSize: '10px',
    },
    md: {
      container: '48px',
      outerContainer: '56px',
      thickness: '5px',
      icon: '22px',
      badge: '22px',
      badgeFont: '12px',
      badgeOffset: '-8px',
      starSize: '12px',
    },
    lg: {
      container: '56px',
      outerContainer: '64px',
      thickness: '6px',
      icon: '26px',
      badge: '24px',
      badgeFont: '14px',
      badgeOffset: '-8px',
      starSize: '14px',
    },
  }

  const currentSize = sizeMap[size] || sizeMap.md

  // If there are no tasks, return empty box with same dimensions
  if (totalTasks === 0) {
    return (
      <Box
        width={currentSize.outerContainer}
        height={currentSize.outerContainer}
      />
    )
  }

  // The icon to display - Trophy for completed, Gift otherwise
  const ProgressIcon = isComplete ? Trophy : Gift

  return (
    <MotionBox
      onClick={onViewTasks}
      cursor={onViewTasks ? 'pointer' : 'default'}
      position="relative"
      height={currentSize.outerContainer}
      width={currentSize.outerContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={
        onViewTasks
          ? {
              scale: 1.08,
              transition: { duration: 0.2 },
            }
          : {}
      }
      whileTap={onViewTasks ? { scale: 0.95 } : {}}
      // Outer container - darker circular background
      borderRadius="full"
      bg="rgba(30, 24, 50, 0.8)"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.4)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      transition="all 0.2s"
      _hover={{
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5)',
      }}
      // Border glow effect for complete tasks
      css={
        isComplete
          ? {
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: 'full',
                border: '2px solid #F7D147',
                animation: `${glowPulse} 2s infinite ease-in-out`,
              },
            }
          : {}
      }
    >
      {/* Decorative stars when complete */}
      {isComplete && (
        <>
          <Box
            position="absolute"
            top="0"
            right="5%"
            boxSize={currentSize.starSize}
            color="#F7D147"
            as={motion.div}
            animate={{
              y: [0, -4, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Icon as={Star} boxSize="100%" />
          </Box>
          <Box
            position="absolute"
            bottom="10%"
            left="0"
            boxSize={currentSize.starSize}
            color="#F7D147"
            as={motion.div}
            animate={{
              y: [0, 3, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 0.5,
            }}
          >
            <Icon as={Star} boxSize="100%" />
          </Box>
        </>
      )}

      {/* Inner container with subtle gradient background */}
      <Box
        position="relative"
        height={currentSize.container}
        width={currentSize.container}
        borderRadius="full"
        bgGradient="linear(to-b, rgba(114, 94, 204, 0.2), rgba(70, 58, 126, 0.2))"
        display="flex"
        alignItems="center"
        justifyContent="center"
        border="2px solid rgba(138, 116, 219, 0.3)"
      >
        {/* Progress Circle */}
        <CircularProgress
          value={progressPercentage}
          size={currentSize.container}
          thickness={currentSize.thickness}
          color={isComplete ? '#F7D147' : '#9F7AFA'}
          trackColor="rgba(255, 255, 255, 0.08)"
          capIsRound
        >
          <CircularProgressLabel>
            <Box position="relative">
              <Icon
                as={ProgressIcon}
                color={isComplete ? '#F7D147' : '#9F7AFA'}
                boxSize={currentSize.icon}
                filter={
                  isComplete
                    ? 'drop-shadow(0 0 4px rgba(247, 209, 71, 0.6))'
                    : 'none'
                }
                animate={
                  isComplete
                    ? {
                        scale: [1, 1.1, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />

              {/* Badge for unclaimed rewards */}
              {unclaimedRewards > 0 && (
                <MotionBox
                  position="absolute"
                  bottom={currentSize.badgeOffset}
                  right={currentSize.badgeOffset}
                  width={currentSize.badge}
                  height={currentSize.badge}
                  borderRadius="full"
                  bgGradient="linear(to-br, #FF5757, #FF2E2E)"
                  color="white"
                  fontSize={currentSize.badgeFont}
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 2px 8px rgba(255, 86, 86, 0.6)"
                  border="2px solid rgba(255, 255, 255, 0.7)"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [1, 1.15, 1],
                    transition: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    },
                  }}
                >
                  {unclaimedRewards}
                </MotionBox>
              )}
            </Box>
          </CircularProgressLabel>
        </CircularProgress>
      </Box>
    </MotionBox>
  )
}

export default TaskProgressIndicator
