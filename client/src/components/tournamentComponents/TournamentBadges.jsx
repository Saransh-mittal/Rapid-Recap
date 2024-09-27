import React, { useState, useRef, useEffect } from 'react'
import { Box, Text, Image, Flex, VStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'

const CrownSVG = React.lazy(() => import('../../assets/svg/CrownSVG'))
const TrophySVG = React.lazy(() => import('../../assets/svg/TrophySVG'))
const Medal = React.lazy(() => import('../../assets/svg/Medal'))

const badgeConfig = {
  RANK_1: {
    image: '/images/goldTourBadge.webp',
    textPosition: { x: -57, y: 140, bottom: '15%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: props => <CrownSVG {...props} />,
    sizeValues: {
      base: { width: '40px', height: '40px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '9px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  RANK_2: {
    image: '/images/silverTourBadge.webp',
    textPosition: { x: -50, y: 130, bottom: '12%' },
    style: {
      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
    },
    icon: props => <TrophySVG {...props} />,
    sizeValues: {
      base: { width: '40px', height: '40px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '9px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  RANK_3: {
    image: '/images/bronzeTourBadge.webp',
    textPosition: { x: -55, y: 130, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
      color: '#FFFFFF',
      textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px rgba(205, 127, 50, 0.5)',
    },
    icon: props => <Medal {...props} />,
    sizeValues: {
      base: { width: '40px', height: '40px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '9px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  TOP_5: {
    image: '/images/top5.webp',
    textPosition: { x: -55, y: 85, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: props => <Medal {...props} />,
    sizeValues: {
      base: { width: '60px', height: '60px', fontSize: '8px' },
      sm: { width: '60px', height: '60px', fontSize: '8px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  TOP_10: {
    image: '/images/top10.webp',
    textPosition: { x: -54, y: 85, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: props => <Medal {...props} />,
    sizeValues: {
      base: { width: '60px', height: '60px', fontSize: '8px' },
      sm: { width: '50px', height: '50px', fontSize: '8px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  TOP_25: {
    image: '/images/top25.webp',
    textPosition: { x: -55, y: 85, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    icon: props => <Medal {...props} />,
    sizeValues: {
      base: { width: '60px', height: '60px', fontSize: '8px' },
      sm: { width: '60px', height: '60px', fontSize: '8px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  QUIZ_WARRIOR: {
    image: '/images/quizWarrior.webp',
    textPosition: { x: -52, y: 105, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #B0C4DE, #4682B4)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(176, 196, 222, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '55px', height: '55px', fontSize: '10px' },
      md: { width: '70px', height: '70px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  ACE: {
    image: '/images/ace_category.webp',
    textPosition: { x: -52, y: 110, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '45px', height: '45px', fontSize: '8px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  PRO: {
    image: '/images/pro_category.webp',
    textPosition: { x: -52, y: 130, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
      color: '#000000',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 10px rgba(192, 192, 192, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '45px', height: '45px', fontSize: '8px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
  CHAMP: {
    image: '/images/champ_category.webp',
    textPosition: { x: -52, y: 130, bottom: '18%' },
    style: {
      background: 'linear-gradient(135deg, #CD7F32, #B8860B)',
      color: '#FFFFFF',
      textShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px rgba(205, 127, 50, 0.5)',
    },
    sizeValues: {
      base: { width: '30px', height: '30px', fontSize: '6px' },
      sm: { width: '45px', height: '45px', fontSize: '8px' },
      md: { width: '60px', height: '60px', fontSize: '11px' },
      lg: { width: '80px', height: '80px', fontSize: '12px' },
    },
  },
}

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

  const { width, height, fontSize } = sizeValues[size] || sizeValues.md

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

  // if (!tournamentNumber || !badgeName) return null

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
          <Text
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
            {badgeName?.text ||
              '#' + tournamentNumber?.toString().padStart(3, '0')}
          </Text>
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
