// Ultra-refined ShareIcon component with perfect alignment and sizing
// Location: client/src/components/articleComponents/articleHeaderComponents/ShareIcon.jsx

import React from 'react'
import { Icon, Tooltip, Flex, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { LockIcon } from '@chakra-ui/icons'
import ShareSVG from '../../../assets/svg/ShareSVG'
import { useDispatch } from 'react-redux'
import { addNoteMessage } from '../../../redux/appSlice'
import { useTranslation } from 'react-i18next'

const MotionFlex = motion(Flex)

const ShareIcon = ({ onShare, isDisabled, onOpenSignin, user, playClick }) => {
  const dispatch = useDispatch()
  const { t } = useTranslation('ShareButton')

  const iconSize = useBreakpointValue({
    base: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
  })

  const containerSize = useBreakpointValue({
    base: '26px',
    sm: '28px',
    md: '30px',
    lg: '32px',
  })

  const handleClick = () => {
    if (playClick) playClick()

    if (user?.role === 'guest') {
      dispatch(
        addNoteMessage({
          title: t('Register to see your IQ score and grow Wise Web'),
          duration: 10000,
          width: '250px',
          actions: [
            {
              actionType: 'SECURE_YOUR_PROGRESS',
            },
          ],
        }),
      )
    } else if (isDisabled) {
      if (onOpenSignin) onOpenSignin()
    } else {
      onShare()
    }
  }

  const isGuestUser = user?.role === 'guest'
  const showLock = isDisabled && !isGuestUser

  return (
    <Tooltip
      label={
        isGuestUser
          ? 'Register to unlock sharing'
          : showLock
          ? 'Sign in to share'
          : 'Share this article'
      }
      placement="top"
      hasArrow
      bg="rgba(0,0,0,0.9)"
      color="white"
      fontSize="xs"
      borderRadius="md"
      px={2}
      py={1}
    >
      <MotionFlex
        position="relative"
        alignItems="center"
        justifyContent="center"
        h={containerSize}
        w={containerSize}
        borderRadius="lg"
        bg={
          showLock ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.08)'
        }
        backdropFilter="blur(6px)"
        border="1px solid"
        borderColor={
          showLock ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)'
        }
        cursor="pointer"
        onClick={handleClick}
        opacity={showLock ? 0.7 : 1}
        transition="all 0.3s ease"
        whileHover={
          !showLock
            ? {
                scale: 1.05,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                bg: 'rgba(255, 255, 255, 0.12)',
              }
            : {
                scale: 1.02,
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }
        }
        whileTap={{ scale: 0.95 }}
        _hover={
          !showLock
            ? {
                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              }
            : {}
        }
        overflow="hidden"
        boxShadow="0 1px 4px rgba(0,0,0,0.1)"
      >
        {/* Ultra-refined guest user glow effect */}
        {isGuestUser && (
          <motion.div
            style={{
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              right: '-1px',
              bottom: '-1px',
              borderRadius: '8px',
              background:
                'linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2))',
              zIndex: -1,
            }}
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1, 1.005, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Ultra-refined lock overlay for disabled non-guest users */}
        {showLock && (
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 400 }}
          >
            <LockIcon
              color="white"
              boxSize={`calc(${iconSize} * 0.65)`}
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
            />
          </motion.div>
        )}

        {/* Ultra-refined share icon with enhanced styling */}
        <motion.div
          whileHover={!showLock ? { rotate: 2 } : {}}
          transition={{ duration: 0.2 }}
        >
          <Icon
            as={ShareSVG}
            h={iconSize}
            w={iconSize}
            color="white"
            opacity={showLock ? 0.4 : 1}
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
          />
        </motion.div>

        {/* Ultra-refined click ripple effect */}
        {!showLock && (
          <motion.div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: isGuestUser
                ? 'rgba(255, 215, 0, 0.25)'
                : 'rgba(255, 255, 255, 0.2)',
              pointerEvents: 'none',
            }}
            initial={{ scale: 0, opacity: 0.4 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            key={Date.now()} // Ensure animation triggers on each click
          />
        )}
      </MotionFlex>
    </Tooltip>
  )
}

ShareIcon.displayName = 'ShareIcon'

export default ShareIcon
