import React, { useState, useEffect, Suspense } from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

// Lazy load SVG components
const GlobeAmericas = React.lazy(() =>
  import('../../../../../assets/svg/GlobeAmericas'),
)
const Landmark = React.lazy(() => import('../../../../../assets/svg/Landmark'))
const ChartLine = React.lazy(() =>
  import('../../../../../assets/svg/ChartLine'),
)
const MicroChip = React.lazy(() =>
  import('../../../../../assets/svg/MicroChip'),
)
const FootballBall = React.lazy(() =>
  import('../../../../../assets/svg/FootballBall'),
)
const RevivalSVG = React.lazy(() =>
  import('../../../../../assets/svg/RevivalSVG'),
)
const Flask = React.lazy(() => import('../../../../../assets/svg/Flask'))
const Leaf = React.lazy(() => import('../../../../../assets/svg/Leaf'))
const Gavel = React.lazy(() => import('../../../../../assets/svg/Gavel'))
const GraduationCap = React.lazy(() =>
  import('../../../../../assets/svg/GraduationCap'),
)
const Film = React.lazy(() => import('../../../../../assets/svg/Film'))
const Utensils = React.lazy(() => import('../../../../../assets/svg/Utensils'))
const UserTie = React.lazy(() => import('../../../../../assets/svg/UserTie'))
const Plane = React.lazy(() => import('../../../../../assets/svg/Plane'))

// Map category to icons
const categoryIcons = {
  world: GlobeAmericas,
  politics: Landmark,
  business: ChartLine,
  technology: MicroChip,
  sports: FootballBall,
  health: RevivalSVG,
  science: Flask,
  environment: Leaf,
  crime: Gavel,
  education: GraduationCap,
  entertainment: Film,
  food: Utensils,
  lifestyle: UserTie,
  tourism: Plane,
}

const CategoryBox = ({ category, isSelected, onClick, variant }) => {
  const IconComponent = categoryIcons[category] || GlobeAmericas

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      cursor="pointer"
      position="relative"
      onClick={onClick}
      overflow="hidden"
      p={3}
      borderRadius="lg"
      bg={isSelected ? variant.cardBg : 'whiteAlpha.50'}
      border="1px solid"
      borderColor={isSelected ? variant.buttonBorderColor : 'whiteAlpha.100'}
      transition="all 0.2s"
      _hover={{
        borderColor: variant.buttonBorderColor,
        boxShadow: `0 0 15px ${variant.glowColor}`,
      }}
      w="full"
      maxW="150px"
    >
      {/* Glow Effect */}
      {isSelected && (
        <Box
          position="absolute"
          inset={0}
          bg={variant.shimmerColor}
          filter="blur(12px)"
          opacity={0.3}
        />
      )}

      {/* Category Content */}
      <VStack spacing={2} position="relative">
        <Box
          p={2}
          borderRadius="md"
          bg={isSelected ? variant.iconBg : 'whiteAlpha.200'}
          transition="all 0.2s"
        >
          <Suspense fallback={<Box h="20px" w="20px" />}>
            <IconComponent
              size="20px"
              color={
                isSelected
                  ? `var(--chakra-colors-${variant.iconColor
                      ?.split('.')
                      .join('-')})`
                  : 'white'
              }
            />
          </Suspense>
        </Box>
        <Text
          fontSize="xs"
          fontWeight="bold"
          textAlign="center"
          bgGradient={isSelected ? variant.titleGradient : 'none'}
          bgClip={isSelected ? 'text' : 'inherit'}
          color={isSelected ? undefined : 'whiteAlpha.900'}
          noOfLines={1}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </VStack>

      {/* Shimmer Effect */}
      {isSelected && (
        <Box
          position="absolute"
          inset={0}
          bgGradient={`linear(to-r, transparent, ${variant.shimmerColor}, transparent)`}
          transform="translateX(-100%)"
          animation="shimmer 2s infinite"
          sx={{
            '@keyframes shimmer': {
              '100%': {
                transform: 'translateX(100%)',
              },
            },
          }}
        />
      )}
    </Box>
  )
}

const CategorySelector = ({ badgeName, onCategorySelected, variant }) => {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation('rewards')
  const toast = useToast()

  useEffect(() => {
    fetchValidCategories()
  }, [])

  const fetchValidCategories = async () => {
    try {
      const { data } = await axios.get(`/api/user/valid-categories`)
      setCategories(data.validCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: t('categorySelector.errors.fetchError'),
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast({
        title: t('categorySelector.errors.selectCategory'),
        status: 'warning',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)
    try {
      const { data } = await axios.put('/api/user/update-category', {
        badgeName,
        selectedCategory,
      })
      console.log(data)
      if (data.invalidCategory) {
        toast({
          title: t('categorySelector.errors.invalidCategory.title'),
          description: t('categorySelector.errors.invalidCategory.description'),
          status: 'error',
          duration: 3000,
        })
        return
      }

      onCategorySelected(data.updatedBadge)
      toast({
        title: t('categorySelector.success'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error updating category:', error)
      toast({
        title: t('categorySelector.errors.updateError.title'),
        description:
          error.response?.data?.message ||
          t('categorySelector.errors.updateError.fallback'),
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      w="full"
      maxW="4xl"
      mx="auto"
      p={2}
    >
      <VStack spacing={6} align="stretch">
        <Text
          fontSize="xl"
          fontWeight="bold"
          textAlign="center"
          bgGradient={variant.titleGradient}
          bgClip="text"
          letterSpacing="wide"
        >
          {t('categorySelector.title')}
        </Text>

        {/* Scrollable Category Grid Container */}
        <Box
          maxH="250px"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: variant.buttonBorderColor,
              borderRadius: '4px',
            },
          }}
          px={2}
        >
          <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={3} py={2}>
            {categories.map((category, index) => (
              <CategoryBox
                key={category}
                category={t(
                  `categorySelector.categories.${category.toLocaleLowerCase()}`,
                )}
                isSelected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                variant={variant}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              />
            ))}
          </SimpleGrid>
        </Box>

        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          bgGradient={variant.buttonGradient}
          color="white"
          height="12"
          fontSize="md"
          borderRadius="lg"
          _hover={{
            transform: 'scale(1.02)',
            boxShadow: `0 0 20px ${variant.glowColor}`,
          }}
          _active={{
            transform: 'scale(0.98)',
          }}
          transition="all 0.2s"
        >
          {t('categorySelector.confirmButton')}
        </Button>
      </VStack>
    </Box>
  )
}

export default CategorySelector
