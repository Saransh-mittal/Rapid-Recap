// Ultra-refined BookmarkIcon component with perfect alignment and sizing
// Location: client/src/components/articleComponents/articleHeaderComponents/BookmarkIcon.jsx

import React from 'react'
import { Flex, useBreakpointValue, Tooltip } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import BookmarkSVG from '../../../assets/svg/BookmarkSVG'
import FilledBookmarkSVG from '../../../assets/svg/FilledBookmarkSVG'

const MotionFlex = motion(Flex)

const BookmarkIcon = React.memo(({ bookmark, onBookmarkClick, playClick }) => {
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

  return (
    <Tooltip
      label={bookmark ? 'Remove bookmark' : 'Add bookmark'}
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
        onClick={() => {
          playClick()
          onBookmarkClick()
        }}
        cursor="pointer"
        alignItems="center"
        justifyContent="center"
        h={containerSize}
        w={containerSize}
        borderRadius="lg"
        bg="rgba(255, 255, 255, 0.08)"
        backdropFilter="blur(6px)"
        border="1px solid rgba(255, 255, 255, 0.15)"
        transition="all 0.3s ease"
        whileHover={{
          scale: 1.05,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          bg: 'rgba(255, 255, 255, 0.12)',
        }}
        whileTap={{ scale: 0.95 }}
        _hover={{
          boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
        }}
        position="relative"
        overflow="hidden"
        boxShadow="0 1px 4px rgba(0,0,0,0.1)"
      >
        {/* Ultra-refined background glow effect when bookmarked */}
        {bookmark && (
          <motion.div
            style={{
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              right: '-1px',
              bottom: '-1px',
              borderRadius: '8px',
              background:
                'linear-gradient(45deg, rgba(236, 201, 75, 0.25), rgba(255, 215, 0, 0.25))',
              zIndex: -1,
            }}
            animate={{
              opacity: [0.25, 0.4, 0.25],
              scale: [1, 1.005, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Ultra-refined icon with enhanced styling */}
        <motion.div
          whileHover={{ rotate: bookmark ? 0 : 2 }}
          transition={{ duration: 0.2 }}
        >
          {bookmark ? (
            <FilledBookmarkSVG width={iconSize} height={iconSize} />
          ) : (
            <BookmarkSVG width={iconSize} height={iconSize} />
          )}
        </motion.div>

        {/* Ultra-refined click ripple effect */}
        <motion.div
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: bookmark
              ? 'rgba(236, 201, 75, 0.25)'
              : 'rgba(255, 255, 255, 0.2)',
            pointerEvents: 'none',
          }}
          initial={{ scale: 0, opacity: 0.4 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          key={bookmark ? 'filled' : 'empty'} // Re-trigger animation on bookmark change
        />
      </MotionFlex>
    </Tooltip>
  )
})

BookmarkIcon.displayName = 'BookmarkIcon'

export default BookmarkIcon
