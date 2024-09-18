import React, { useState, useRef, useEffect } from 'react'
import { Box, Text, Image, Flex, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

// Assuming these SVG components are available in your project
import CrownSVG from '../../assets/svg/CrownSVG'
import TrophySVG from '../../assets/svg/TrophySVG'
import Medal from '../../assets/svg/Medal'

const badgeConfig = {
  1: {
    image: '/images/goldTourBadge.webp',
    textPosition: { x: -57, y: 40, bottom: '15%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: props => <CrownSVG {...props} />,
  },
  2: {
    image: '/images/silverTourBadge.webp',
    textPosition: { x: -50, y: 25, bottom: '12%' },
    style: {
      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
    },
    icon: props => <TrophySVG {...props} />,
  },
  3: {
    image: '/images/bronzeTourBadge.webp',
    textPosition: { x: -55, y: 85, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
      color: '#FFFFFF',
      textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px rgba(205, 127, 50, 0.5)',
    },
    icon: props => <Medal {...props} />,
  },
}

const DIALOG_WIDTH = 250 // Set a fixed width for the dialog

const TournamentBadge = ({
  tournamentNumber,
  rank,
  name,
  inGameName,
  participantCnt,
}) => {
  const [showDialog, setShowDialog] = useState(false)
  const badgeRef = useRef(null)
  const dialogRef = useRef(null)
  const { image, textPosition, style, icon: RankIcon } = badgeConfig[rank] || {}

  useEffect(() => {
    if (showDialog && badgeRef.current && dialogRef.current) {
      const badgeRect = badgeRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth

      let topPosition = badgeRect.bottom + window.scrollY
      let leftPosition =
        badgeRect.left + badgeRect.width / 2 - DIALOG_WIDTH / 2 + window.scrollX

      // Ensure the dialog doesn't go off the right edge of the screen
      if (leftPosition + DIALOG_WIDTH > windowWidth) {
        leftPosition = windowWidth - DIALOG_WIDTH - 10 // 10px margin
      }

      // Ensure the dialog doesn't go off the left edge of the screen
      if (leftPosition < 10) {
        leftPosition = 10 // 10px margin
      }

      // If the dialog would go off the bottom of the screen, position it above the badge instead
      if (topPosition + dialogRef.current.offsetHeight > window.innerHeight) {
        topPosition =
          badgeRect.top - dialogRef.current.offsetHeight + window.scrollY
      }

      dialogRef.current.style.top = `${topPosition}px`
      dialogRef.current.style.left = `${leftPosition}px`
    }
  }, [showDialog])

  if (!tournamentNumber || !rank) return null

  return (
    <Box position="relative" ref={badgeRef}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDialog(!showDialog)}
      >
        <Box
          position="relative"
          width="80px"
          height="80px"
          borderRadius="50%"
          overflow="hidden"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          transition="all 0.3s ease"
          _hover={{
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Image
            src={image}
            alt={`Rank ${rank} Badge`}
            width="100%"
            height="100%"
            objectFit="contain"
          />
          <Text
            position="absolute"
            bottom={textPosition.bottom}
            left="50%"
            transform={`translateX(${textPosition.x}%) translateY(${textPosition.y}%)`}
            color="white"
            fontSize="8px"
            fontWeight="bold"
            textShadow="1px 1px 2px rgba(0,0,0,0.6)"
          >
            #{tournamentNumber.toString().padStart(3, '0')}
          </Text>
        </Box>
      </motion.div>

      <AnimatePresence>
        {showDialog && (
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            style={{
              position: 'fixed',
              zIndex: 9999,
              pointerEvents: 'auto',
              width: `${DIALOG_WIDTH}px`,
            }}
          >
            <Box
              p={4}
              borderRadius="md"
              width="100%"
              {...style}
              position="relative"
            >
              <VStack spacing={2} align="center">
                <Flex alignItems="center" justifyContent="center" mb={2}>
                  <Box
                    bg="rgba(255, 255, 255, 0.2)"
                    borderRadius="50%"
                    p={1}
                    mr={2}
                  >
                    <RankIcon
                      size="24px"
                      style={{
                        filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
                      }}
                      color={style.color}
                    />
                  </Box>
                  <Text fontWeight="bold" fontSize="xl">
                    {name}
                  </Text>
                </Flex>
                <Text fontSize="md" opacity={0.8}>
                  @{inGameName}
                </Text>
                <Text fontSize="lg" fontWeight="semibold">
                  Rank {rank} in Tournament #
                  {String(tournamentNumber).padStart(3, '0')}
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Out of {participantCnt} participants
                </Text>
              </VStack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default TournamentBadge
