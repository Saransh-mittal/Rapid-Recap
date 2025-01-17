import React, { useState, useRef, useEffect } from 'react'
import { Box, HStack, VStack, Text, useMediaQuery } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)

const COLORS = {
  background: {
    default: 'rgba(19, 16, 41, 0.95)',
    active: 'rgba(89, 46, 156, 0.15)',
    hover: 'rgba(255, 255, 255, 0.05)',
    boostActive: 'rgba(19, 16, 41, 0.95)',
  },
  text: {
    default: 'rgba(255, 255, 255, 0.85)',
    active: '#8B5CF6',
    boost: '#FFB800',
  },
  indicator: {
    default: '#8B5CF6',
    boost: '#FFB800',
  },
  frame: {
    boost: 'linear-gradient(45deg, #FFB800, #FFF4D4, #FFB800)',
  },
}

// Particle effect component for boost animation
const BoostParticles = () => {
  return (
    <AnimatePresence>
      {Array.from({ length: 12 }).map((_, i) => (
        <MotionBox
          key={i}
          position="absolute"
          width="2px"
          height="2px"
          borderRadius="full"
          bg="#FFB800"
          initial={{
            x: '50%',
            y: '50%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: `${50 + Math.cos(i * 30) * 100}%`,
            y: `${50 + Math.sin(i * 30) * 100}%`,
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          style={{
            boxShadow: '0 0 10px rgba(255, 184, 0, 0.6)',
          }}
        />
      ))}
    </AnimatePresence>
  )
}

const ModernCategories = ({
  activeCategory,
  handleActiveCategory,
  categories,
  categoryRefs,
  trackCategoryClick,
  notLoggedIn,
}) => {
  const [isMobile] = useMediaQuery('(max-width: 992px)')
  const [isClient, setIsClient] = useState(false)
  const scrollContainerRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const { t } = useTranslation('categories')
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current
      const maxScrollWidth = scrollWidth - clientWidth
      setMaxScroll(maxScrollWidth)
      setScrollProgress(scrollLeft / maxScrollWidth)
    }
  }

  useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [])

  const renderCategory = (category, idx) => {
    if (!category) return null
    const isActive =
      category?.key?.toLowerCase() === activeCategory?.toLowerCase()
    const isBoost = category.isBoostAvailable
    const Component = isMobile ? MobileCategory : DesktopCategory

    return (
      <Component
        key={category.key}
        category={t(`categories.${category.key}`).toUpperCase()}
        isActive={isActive}
        isBoost={isBoost}
        onClick={() => {
          handleActiveCategory({ category: category.key })
          trackCategoryClick(category.key)
        }}
        ref={el => (categoryRefs.current[idx] = el)}
        display={notLoggedIn && category.key === 'all' ? 'none' : undefined}
      />
    )
  }

  if (!isClient) {
    return (
      <Box
        position="fixed"
        width="220px"
        height="calc(100vh - 80px)"
        visibility="hidden"
      />
    )
  }

  if (isMobile) {
    return (
      <Box
        position="fixed"
        bottom={2}
        left="50%"
        transform="translateX(-50%)"
        width="92%"
        zIndex={900}
        align="center"
      >
        <MotionBox
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          bg={COLORS.background.default}
          borderRadius="2xl"
          backdropFilter="blur(8px)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
          overflow="hidden"
          position="relative"
        >
          <Box
            ref={scrollContainerRef}
            overflowX="auto"
            py={2.5}
            px={4}
            onScroll={handleScroll}
            css={{
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <HStack spacing={1} minW="min-content">
              {categories?.map((category, idx) =>
                renderCategory(category, idx),
              )}
            </HStack>
          </Box>

          {maxScroll > 0 && (
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height="2px"
              bg="rgba(255, 255, 255, 0.1)"
              overflow="hidden"
            >
              <MotionBox
                position="absolute"
                height="100%"
                bg="rgba(139, 92, 246, 0.5)"
                initial={{ width: '33.33%' }}
                animate={{
                  left: `${scrollProgress * (100 - 33.33)}%`,
                }}
                style={{
                  width: '33.33%',
                  backgroundImage:
                    'linear-gradient(to right, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.8), rgba(139, 92, 246, 0.3))',
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </Box>
          )}
        </MotionBox>
      </Box>
    )
  }

  return (
    <Box
      position="fixed"
      top={!isAuthenticated ? '75px' : '75px'}
      left={2}
      zIndex={900}
      maxH="calc(100vh - 80px)"
      overflowY="hidden"
    >
      <MotionBox
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        bgGradient="linear(135deg, rgba(28, 20, 56, 0.85) 0%, rgba(15, 13, 21, 0.85) 100%)"
        borderRight="1px solid rgba(255, 255, 255, 0.08)"
        boxShadow="4px 0 30px rgba(0, 0, 0, 0.1)"
        borderRadius="2xl"
        width="220px"
        backdropFilter="blur(8px)"
        overflow="hidden"
      >
        <Box
          maxH="calc(100vh - 80px)"
          overflowY="auto"
          py={2}
          css={{
            '&::-webkit-scrollbar': { width: '2px' },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(139, 92, 246, 0.3)',
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(139, 92, 246, 0.5)',
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(139, 92, 246, 0.3) rgba(255, 255, 255, 0.05)',
          }}
        >
          <VStack spacing={0.5} align="stretch" px={2}>
            {categories?.map((category, idx) => renderCategory(category, idx))}
          </VStack>
        </Box>
      </MotionBox>
    </Box>
  )
}

const MobileCategory = React.forwardRef(
  ({ category, isActive, isBoost, onClick, display }, ref) => (
    <MotionBox
      ref={ref}
      position="relative"
      px={4}
      py={2}
      borderRadius="xl"
      bg={
        isActive && isBoost
          ? COLORS.background.boostActive
          : isActive
          ? COLORS.background.active
          : 'transparent'
      }
      cursor="pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      display={display || 'flex'}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="40px"
      overflow="hidden"
    >
      {isActive && isBoost && (
        <>
          <BoostParticles />
          <Box
            position="absolute"
            inset={0}
            padding="1.5px"
            borderRadius="xl"
            background={COLORS.frame.boost}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Box
              width="100%"
              height="100%"
              borderRadius="xl"
              bg={COLORS.background.boostActive}
            />
          </Box>
        </>
      )}

      {isBoost && !isActive && (
        <MotionBox
          position="absolute"
          inset={0}
          animate={{
            background: [
              'linear-gradient(45deg, rgba(255,184,0,0.15) 0%, rgba(255,214,107,0.25) 50%, rgba(255,184,0,0.15) 100%)',
              'linear-gradient(45deg, rgba(255,184,0,0.25) 0%, rgba(255,214,107,0.35) 50%, rgba(255,184,0,0.25) 100%)',
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      )}

      <Text
        fontSize="xs"
        fontWeight={isActive || isBoost ? '600' : '500'}
        color={
          isActive
            ? isBoost
              ? COLORS.text.boost
              : COLORS.text.active
            : isBoost
            ? COLORS.text.boost
            : COLORS.text.default
        }
        letterSpacing="0.4px"
        whiteSpace="nowrap"
        style={{
          textShadow: isBoost
            ? '0 0 12px rgba(255,184,0,0.7)'
            : isActive
            ? '0 0 8px rgba(139,92,246,0.5)'
            : 'none',
        }}
        zIndex={1}
      >
        {category}
      </Text>

      {isActive && (
        <MotionBox
          position="absolute"
          bottom="2px"
          left="50%"
          transform="translateX(-50%)"
          width="3px"
          height="3px"
          borderRadius="full"
          bg={isBoost ? COLORS.indicator.boost : COLORS.indicator.default}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{
            boxShadow: `0 0 12px ${
              isBoost ? 'rgba(255,184,0,0.7)' : 'rgba(139,92,246,0.7)'
            }`,
          }}
          zIndex={1}
        />
      )}
    </MotionBox>
  ),
)

const DesktopCategory = React.forwardRef(
  ({ category, isActive, isBoost, onClick, display }, ref) => (
    <MotionBox
      ref={ref}
      px={4}
      py={2.5}
      mx={1}
      borderRadius="xl"
      cursor="pointer"
      position="relative"
      display={display || 'block'}
      whileHover={{
        backgroundColor: isActive
          ? isBoost
            ? COLORS.background.boostActive
            : COLORS.background.active
          : COLORS.background.hover,
        scale: 1.05,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      overflow="hidden"
    >
      {isActive && isBoost && (
        <>
          <BoostParticles />
          <Box
            position="absolute"
            inset={0}
            padding="1.5px"
            borderRadius="xl"
            background={COLORS.frame.boost}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Box
              width="100%"
              height="100%"
              borderRadius="xl"
              bg={COLORS.background.boostActive}
            />
          </Box>
        </>
      )}

      {isBoost && !isActive && (
        <MotionBox
          position="absolute"
          inset={0}
          animate={{
            background: [
              'linear-gradient(45deg, rgba(255,184,0,0.25) 0%, rgba(255,214,107,0.35) 50%, rgba(255,184,0,0.25) 100%)',
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      )}

      {isActive && (
        <MotionBox
          position="absolute"
          left="-1px"
          top="50%"
          width="3px"
          height="50%"
          borderRadius="full"
          bg={isBoost ? COLORS.indicator.boost : COLORS.indicator.default}
          transform="translateY(-50%)"
          animate={{
            opacity: [0.7, 1, 0.7],
            height: ['40%', '50%', '40%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          style={{
            boxShadow: `0 0 12px ${
              isBoost ? 'rgba(255,184,0,0.7)' : 'rgba(139,92,246,0.7)'
            }`,
          }}
          zIndex={1}
        />
      )}

      <Text
        fontSize="sm"
        fontWeight={isActive || isBoost ? '600' : '500'}
        color={
          isActive
            ? isBoost
              ? COLORS.text.boost
              : COLORS.text.active
            : isBoost
            ? COLORS.text.boost
            : COLORS.text.default
        }
        letterSpacing="0.3px"
        transition="all 0.2s"
        _hover={{
          color: isActive
            ? isBoost
              ? COLORS.text.boost
              : COLORS.text.active
            : isBoost
            ? COLORS.text.boost
            : 'white',
        }}
        style={{
          textShadow: isBoost
            ? '0 0 12px rgba(255,184,0,0.7)'
            : isActive
            ? '0 0 8px rgba(139,92,246,0.5)'
            : 'none',
        }}
        zIndex={1}
        position="relative"
      >
        {category}
      </Text>

      {/* Add floating particles for boost active state */}
      {isActive && isBoost && (
        <MotionBox
          position="absolute"
          right="4px"
          top="50%"
          width="4px"
          height="4px"
          borderRadius="full"
          bg={COLORS.indicator.boost}
          transform="translateY(-50%)"
          animate={{
            y: ['-50%', '-100%', '-50%'],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            boxShadow: '0 0 12px rgba(255,184,0,0.7)',
          }}
          zIndex={1}
        />
      )}
    </MotionBox>
  ),
)

export default ModernCategories
