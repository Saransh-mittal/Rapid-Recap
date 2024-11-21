import React, { useState, useRef, useEffect } from 'react'
import { Box, HStack, VStack, Text, useMediaQuery } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const ModernCategories = ({
  activeCategory,
  handleActiveCategory,
  categories,
  categoryRefs,
  trackCategoryClick,
  notLoggedIn,
}) => {
  const [isMobile] = useMediaQuery('(max-width: 992px)')
  const scrollContainerRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const { t } = useTranslation('categories')
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
    const Component = isMobile ? MobileCategory : DesktopCategory

    return (
      <Component
        key={category.key}
        category={t(`categories.${category.key}`).toUpperCase()}
        isActive={isActive}
        onClick={() => {
          handleActiveCategory({ category: category.key })
          trackCategoryClick(category.key)
        }}
        ref={el => (categoryRefs.current[idx] = el)}
        display={notLoggedIn && category.key === 'all' ? 'none' : undefined}
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
          bg="rgba(19, 16, 41, 0.95)"
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
                bg="rgba(237, 100, 166, 0.5)"
                initial={{ width: '33.33%' }}
                animate={{
                  left: `${scrollProgress * (100 - 33.33)}%`,
                }}
                style={{
                  width: '33.33%',
                  backgroundImage:
                    'linear-gradient(to right, rgba(237, 100, 166, 0.3), rgba(237, 100, 166, 0.8), rgba(237, 100, 166, 0.3))',
                  boxShadow: '0 0 10px rgba(237, 100, 166, 0.3)',
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
      top="65px"
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
        // bg="rgba(8, 6, 15, 0.98)"
        borderRadius="2xl"
        width="220px"
        backdropFilter="blur(8px)"
        // boxShadow="0 4px 20px rgba(0, 0, 0, 0.2)"
        overflow="hidden"
      >
        <Box
          maxH="calc(100vh - 80px)"
          overflowY="auto"
          py={2}
          css={{
            '&::-webkit-scrollbar': {
              width: '2px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(237, 100, 166, 0.3)',
              borderRadius: '2px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(237, 100, 166, 0.5)',
            },
            scrollbarWidth: 'thin',
            scrollbarColor:
              'rgba(237, 100, 166, 0.3) rgba(255, 255, 255, 0.05)',
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
  ({ category, isActive, onClick, display }, ref) => (
    <MotionBox
      ref={ref}
      position="relative"
      px={4}
      py={2}
      borderRadius="xl"
      bg={isActive ? 'rgba(237, 100, 166, 0.15)' : 'transparent'}
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
    >
      <Text
        fontSize="xs"
        fontWeight={isActive ? '600' : '500'}
        color={isActive ? '#ED64A6' : 'rgba(255, 255, 255, 0.85)'}
        letterSpacing="0.4px"
        whiteSpace="nowrap"
      >
        {category}
      </Text>

      <MotionBox
        position="absolute"
        bottom="2px"
        left="50%"
        transform="translateX(-50%)"
        width="3px"
        height="3px"
        borderRadius="full"
        bg="#ED64A6"
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: isActive ? 1 : 0,
          scale: isActive ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
        style={{
          boxShadow: isActive ? '0 0 8px rgba(237, 100, 166, 0.5)' : 'none',
        }}
      />
    </MotionBox>
  ),
)

const DesktopCategory = React.forwardRef(
  ({ category, isActive, onClick, display }, ref) => (
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
          ? 'rgba(237, 100, 166, 0.15)'
          : 'rgba(255, 255, 255, 0.03)',
        scale: 1.05,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      _before={
        isActive
          ? {
              content: '""',
              position: 'absolute',
              left: '-1px',
              top: '50%',
              width: '3px',
              height: '50%',
              borderRadius: 'full',
              bg: '#ED64A6',
              transform: 'translateY(-50%)',
              boxShadow: '0 0 8px rgba(237, 100, 166, 0.3)',
            }
          : {}
      }
    >
      <Text
        fontSize="sm"
        fontWeight={isActive ? '600' : '500'}
        color={isActive ? '#ED64A6' : 'rgba(255, 255, 255, 0.85)'}
        letterSpacing="0.3px"
        transition="all 0.2s"
        _hover={{
          color: isActive ? '#ED64A6' : 'white',
        }}
      >
        {category}
      </Text>
    </MotionBox>
  ),
)

export default ModernCategories
