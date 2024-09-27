import React, { useState, useRef, useEffect } from 'react'
import { Box, Text, Image, Flex, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { badgeConfig } from '../../models/badgeConfig'

const DIALOG_WIDTH = 250 // Set a fixed width for the dialog

const TournamentBadge = ({
  tournamentNumber,
  rank,
  name,
  inGameName,
  participantCnt,
  size = 'md',
  badgeName = null,
}) => {
  const [showDialog, setShowDialog] = useState(false)
  const badgeRef = useRef(null)
  const dialogRef = useRef(null)
  const {
    image,
    textPosition,
    style,
    icon: RankIcon,
    sizeValues,
  } = badgeConfig[badgeName?.name] || {}

  const sizeValue = sizeValues ? sizeValues[size] || sizeValues?.md : null
  const width = sizeValue?.width
  const height = sizeValue?.height
  const fontSize = sizeValue?.fontSize

  useEffect(() => {
    if (showDialog && badgeRef.current && dialogRef.current) {
      const badgeRect = badgeRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

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
      if (topPosition + dialogRef.current.offsetHeight > windowHeight) {
        topPosition =
          badgeRect.top - dialogRef.current.offsetHeight + window.scrollY
      }

      dialogRef.current.style.top = `${topPosition}px`
      dialogRef.current.style.left = `${leftPosition}px`
    }
  }, [showDialog])

  const handleClick = e => {
    e.stopPropagation() // Prevent event from bubbling up
    setShowDialog(prevState => !prevState)
  }

  if (!tournamentNumber || !badgeName.name) return null

  const dialogContent = showDialog && (
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
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <VStack spacing={2} align="center">
          <Flex alignItems="center" justifyContent="center" mb={0}>
            <Box bg="rgba(255, 255, 255, 0.2)" borderRadius="50%" p={1} mr={2}>
              {RankIcon && (
                <RankIcon
                  size="24px"
                  style={{
                    filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
                  }}
                  color={style?.color}
                />
              )}
            </Box>
            <Flex flexDirection={'column'}>
              <Text fontWeight="bold" fontSize="xl" mb={0}>
                {name}
              </Text>
              <Text fontSize="md" opacity={0.8}>
                @{inGameName}
              </Text>
            </Flex>
          </Flex>

          <Text fontSize="md" fontWeight="semibold">
            Rank {rank} in Tournament #
            {String(tournamentNumber)?.padStart(3, '0')}
          </Text>
          <Text fontSize="sm" opacity={0.9}>
            Out of {participantCnt} participants
          </Text>
        </VStack>
      </Box>
    </motion.div>
  )

  return (
    <Box position="relative" ref={badgeRef}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        <Box
          position="relative"
          width={width}
          height={height}
          borderRadius="50%"
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
          <Flex
            flexDirection={'column'}
            position="absolute"
            bottom={textPosition?.bottom}
            left="50%"
            transform={`translateX(${textPosition?.x}%) translateY(${textPosition?.y}%)`}
            color="white"
            fontSize={fontSize}
            fontWeight="bold"
            textShadow="1px 1px 2px rgba(0,0,0,0.6)"
            textTransform={'capitalize'}
          >
            <Flex>{badgeName?.text}</Flex>
            <Flex justifyContent={'center'} mt={-1}>
              {'#' + tournamentNumber?.toString().padStart(3, '0')}
            </Flex>
          </Flex>
        </Box>
      </motion.div>
      {createPortal(
        <AnimatePresence>{dialogContent}</AnimatePresence>,
        document.body,
      )}
    </Box>
  )
}

export default TournamentBadge
