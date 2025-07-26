// Enhanced ReadingModeToggle component with full desktop support
// Location: client/src/components/articleComponents/articleHeaderComponents/ReadingModeToggle.jsx

import React, { useEffect } from 'react'
import {
  Flex,
  Box,
  Tooltip,
  Text,
  useBreakpointValue,
  useMediaQuery,
  VStack,
  HStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Book, Sparkles, Monitor, Gamepad2, Maximize } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setImmersiveModeActive } from '../../../redux/articleSlice'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const ReadingModeToggle = React.memo(({ readingMode, onToggle, playClick }) => {
  const dispatch = useDispatch()
  const { isImmersiveModeActive } = useSelector(state => state.articles)
  const isNormalMode = readingMode === 'normal'

  // Enhanced responsive breakpoints for full device support
  const [isMobile] = useMediaQuery('(max-width: 480px)')
  const [isTablet] = useMediaQuery('(max-width: 768px)')
  const [isDesktop] = useMediaQuery('(min-width: 992px)')
  const [isLargeDesktop] = useMediaQuery('(min-width: 1200px)')

  // Enhanced responsive configuration with optimized desktop sizing
  const responsiveConfig = useBreakpointValue({
    base: {
      containerWidth: '140px',
      containerHeight: '28px',
      buttonWidth: '65px',
      fontSize: '3xs',
      iconSize: 9,
      padding: 1,
      borderRadius: 'full',
      spacing: 0.5,
    },
    sm: {
      containerWidth: '150px',
      containerHeight: '30px',
      buttonWidth: '70px',
      fontSize: '2xs',
      iconSize: 10,
      padding: 1.5,
      borderRadius: 'full',
      spacing: 0.5,
    },
    md: {
      containerWidth: '160px',
      containerHeight: '32px',
      buttonWidth: '75px',
      fontSize: '2xs',
      iconSize: 11,
      padding: 1.5,
      borderRadius: 'full',
      spacing: 1,
    },
    lg: {
      containerWidth: '200px', // Enhanced for desktop
      containerHeight: '40px', // Enhanced for desktop
      buttonWidth: '95px', // Enhanced for desktop
      fontSize: 'xs',
      iconSize: 14, // Enhanced for desktop
      padding: 3, // Enhanced for desktop
      borderRadius: 'full',
      spacing: 2, // Enhanced for desktop
    },
    xl: {
      containerWidth: '220px', // Premium desktop experience
      containerHeight: '44px', // Premium desktop experience
      buttonWidth: '105px', // Premium desktop experience
      fontSize: 'sm',
      iconSize: 16, // Premium desktop experience
      padding: 3.5, // Premium desktop experience
      borderRadius: 'full',
      spacing: 2.5, // Premium desktop experience
    },
  })

  const handleToggle = () => {
    if (playClick) playClick()

    // Toggle reading mode
    onToggle()

    // Handle immersive mode based on reading mode
    const newMode = readingMode === 'normal' ? 'game' : 'normal'
    dispatch(setImmersiveModeActive(newMode === 'game'))
  }

  // Sync immersive mode with reading mode
  useEffect(() => {
    const shouldBeImmersive = readingMode === 'game'
    if (isImmersiveModeActive !== shouldBeImmersive) {
      dispatch(setImmersiveModeActive(shouldBeImmersive))
    }
  }, [readingMode, isImmersiveModeActive, dispatch])

  // Enhanced tooltips with device-specific content
  const normalModeTooltip = (
    <VStack spacing={1} align="start" maxW="220px">
      <HStack>
        <Monitor size={12} />
        <Text fontSize="xs" fontWeight="bold">
          Standard Mode
        </Text>
      </HStack>
      <Text fontSize="2xs" color="gray.300">
        {isDesktop
          ? 'Traditional reading with sidebar, navigation menu, and standard layout'
          : 'Traditional reading experience with standard navigation'}
      </Text>
      {isDesktop && (
        <Text fontSize="3xs" color="blue.300">
          Click to enable full-screen immersive experience
        </Text>
      )}
    </VStack>
  )

  const immersiveModeTooltip = (
    <VStack spacing={1} align="start" maxW="220px">
      <HStack>
        <Maximize size={12} />
        <Text fontSize="xs" fontWeight="bold">
          Immersive Mode
        </Text>
      </HStack>
      <Text fontSize="2xs" color="gray.300">
        {isDesktop
          ? 'Full-screen reading with hidden UI, interactive quizzes, and keyboard/mouse navigation'
          : 'Full-screen experience with interactive quizzes and hidden navigation'}
      </Text>
      {isDesktop && (
        <Text fontSize="3xs" color="purple.300">
          Use scroll wheel, arrow keys, or ESC to navigate
        </Text>
      )}
    </VStack>
  )

  return (
    <Tooltip
      label={isNormalMode ? immersiveModeTooltip : normalModeTooltip}
      placement={isDesktop ? 'bottom' : 'top'}
      hasArrow
      bg="rgba(0,0,0,0.95)"
      color="white"
      borderRadius="md"
      px={isDesktop ? 4 : 3}
      py={isDesktop ? 3 : 2}
      fontSize="xs"
      boxShadow={
        isDesktop ? '0 8px 20px rgba(0,0,0,0.5)' : '0 6px 16px rgba(0,0,0,0.4)'
      }
      openDelay={isDesktop ? 300 : 500}
      closeDelay={100}
    >
      <MotionBox
        as="button"
        display="flex"
        alignItems="center"
        bg="rgba(255, 255, 255, 0.08)"
        borderRadius={responsiveConfig.borderRadius}
        p="2px"
        cursor="pointer"
        onClick={handleToggle}
        border="1px solid"
        borderColor="whiteAlpha.250"
        backdropFilter="blur(10px)"
        boxShadow={
          isDesktop
            ? '0 6px 16px rgba(0,0,0,0.3)'
            : isMobile
            ? '0 2px 8px rgba(0,0,0,0.2)'
            : '0 4px 12px rgba(0,0,0,0.25)'
        }
        transition="all 0.3s ease"
        height={responsiveConfig.containerHeight}
        width={responsiveConfig.containerWidth}
        whileHover={{
          borderColor: isDesktop
            ? 'rgba(50, 50, 50, 0.4)'
            : 'rgba(70, 70, 70, 0.4)',
          boxShadow: isDesktop
            ? '0 8px 24px rgba(0,0,0,0.4)'
            : '0 6px 20px rgba(0,0,0,0.35)',
          scale: isDesktop ? 1.03 : 1.02,
        }}
        whileTap={{ scale: 0.97 }}
        position="relative"
        overflow="hidden"
        // Enhanced styling when in immersive mode
        {...(readingMode === 'game' && {
          boxShadow: isDesktop
            ? '0 6px 20px rgba(159, 122, 234, 0.6)'
            : '0 4px 16px rgba(159, 122, 234, 0.5)',
          borderColor: 'purple.300',
        })}
      >
        {/* Enhanced animated background glow for immersive mode */}
        {readingMode === 'game' && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            borderRadius={responsiveConfig.borderRadius}
            bg="linear-gradient(45deg, rgba(159, 122, 234, 0.25), rgba(236, 201, 75, 0.25), rgba(159, 122, 234, 0.25))"
            backgroundSize="200% 200%"
            zIndex={-1}
            animation="enhanced-gradient-shift 2.5s ease infinite"
            sx={{
              '@keyframes enhanced-gradient-shift': {
                '0%, 100%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
              },
            }}
          />
        )}

        {/* Enhanced Standard Mode Button */}
        <MotionFlex
          align="center"
          gap={responsiveConfig.spacing}
          px={responsiveConfig.padding}
          py={1}
          borderRadius={responsiveConfig.borderRadius}
          bg={isNormalMode ? 'white' : 'transparent'}
          color={isNormalMode ? 'gray.800' : 'white'}
          fontWeight="bold"
          transition="all 0.3s ease"
          fontSize={responsiveConfig.fontSize}
          width={responsiveConfig.buttonWidth}
          justify="center"
          position="relative"
          height="calc(100% - 4px)"
          whileHover={isNormalMode ? {} : { bg: 'rgba(255, 255, 255, 0.05)' }}
        >
          <Book size={responsiveConfig.iconSize} />
          <Text
            fontSize={responsiveConfig.fontSize}
            fontWeight="800"
            letterSpacing={isDesktop ? 'wide' : 'wider'}
            textTransform="uppercase"
            lineHeight="1"
          >
            {isDesktop ? 'Standard' : 'STD'}
          </Text>

          {/* Enhanced background when active */}
          {isNormalMode && (
            <Box
              position="absolute"
              top="2px"
              left="2px"
              right="2px"
              bottom="2px"
              borderRadius={responsiveConfig.borderRadius}
              bg="linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))"
              zIndex={-1}
              boxShadow={
                isDesktop
                  ? 'inset 0 2px 4px rgba(0,0,0,0.1), 0 3px 8px rgba(255,255,255,0.3)'
                  : 'inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 6px rgba(255,255,255,0.25)'
              }
            />
          )}
        </MotionFlex>

        {/* Enhanced Immersive Mode Button */}
        <MotionFlex
          align="center"
          gap={responsiveConfig.spacing}
          px={responsiveConfig.padding}
          py={1}
          borderRadius={responsiveConfig.borderRadius}
          bg={!isNormalMode ? 'white' : 'transparent'}
          color={!isNormalMode ? 'gray.800' : 'white'}
          fontWeight="bold"
          transition="all 0.3s ease"
          fontSize={responsiveConfig.fontSize}
          width={responsiveConfig.buttonWidth}
          justify="center"
          position="relative"
          height="calc(100% - 4px)"
          whileHover={!isNormalMode ? {} : { bg: 'rgba(255, 255, 255, 0.05)' }}
        >
          {isDesktop ? (
            <Maximize size={responsiveConfig.iconSize} />
          ) : (
            <Sparkles size={responsiveConfig.iconSize} />
          )}
          <Text
            fontSize={responsiveConfig.fontSize}
            fontWeight="800"
            letterSpacing={isDesktop ? 'wide' : 'wider'}
            textTransform="uppercase"
            lineHeight="1"
          >
            {isDesktop ? 'Immersive' : 'IMM'}
          </Text>

          {/* Enhanced background when active */}
          {!isNormalMode && (
            <Box
              position="absolute"
              top="2px"
              left="2px"
              right="2px"
              bottom="2px"
              borderRadius={responsiveConfig.borderRadius}
              bg="linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,245,255,0.9))"
              zIndex={-1}
              boxShadow={
                isDesktop
                  ? 'inset 0 2px 4px rgba(0,0,0,0.1), 0 3px 8px rgba(159,122,234,0.3)'
                  : 'inset 0 1px 3px rgba(0,0,0,0.1), 0 2px 6px rgba(159,122,234,0.25)'
              }
            />
          )}
        </MotionFlex>

        {/* Enhanced sliding indicator background */}
        <MotionBox
          position="absolute"
          top="2px"
          bottom="2px"
          width={`calc(${responsiveConfig.buttonWidth} - 2px)`}
          borderRadius={responsiveConfig.borderRadius}
          bg="linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))"
          border="1px solid rgba(255,255,255,0.1)"
          initial={false}
          animate={{
            x: isNormalMode
              ? '2px'
              : `calc(${responsiveConfig.buttonWidth} + 2px)`,
          }}
          transition={{
            type: 'spring',
            stiffness: isDesktop ? 600 : 500,
            damping: isDesktop ? 35 : 30,
          }}
          zIndex={-1}
          boxShadow={
            isDesktop
              ? '0 3px 8px rgba(0,0,0,0.18)'
              : '0 2px 6px rgba(0,0,0,0.15)'
          }
        />

        {/* Enhanced particle effects for immersive mode on desktop */}
        {!isNormalMode && isDesktop && (
          <>
            {[...Array(3)].map((_, i) => (
              <Box
                key={i}
                position="absolute"
                w={i === 1 ? '2px' : '1px'}
                h={i === 1 ? '2px' : '1px'}
                bg="rgba(159, 122, 234, 0.8)"
                borderRadius="full"
                top={`${25 + i * 15}%`}
                right={`${15 + i * 20}%`}
                animation={`enhanced-float-particle-${i} ${
                  2 + i * 0.3
                }s ease-in-out infinite`}
                sx={{
                  [`@keyframes enhanced-float-particle-${i}`]: {
                    '0%, 100%': {
                      transform: 'translateY(0px) scale(1)',
                      opacity: 0.4,
                    },
                    '50%': {
                      transform: `translateY(-${3 + i}px) scale(${
                        1.2 + i * 0.3
                      })`,
                      opacity: 1,
                    },
                  },
                }}
                style={{
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </>
        )}

        {/* Desktop-specific glow effect */}
        {isDesktop && !isNormalMode && (
          <Box
            position="absolute"
            top="-2px"
            left="-2px"
            right="-2px"
            bottom="-2px"
            borderRadius={responsiveConfig.borderRadius}
            background="linear-gradient(45deg, rgba(159, 122, 234, 0.3), rgba(214, 158, 46, 0.3))"
            zIndex={-2}
            opacity={0.6}
            animation="desktop-immersive-glow 3s ease-in-out infinite"
            sx={{
              '@keyframes desktop-immersive-glow': {
                '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 0.6, transform: 'scale(1.02)' },
              },
            }}
          />
        )}
      </MotionBox>
    </Tooltip>
  )
})

ReadingModeToggle.displayName = 'ReadingModeToggle'

export default ReadingModeToggle
