import React, { useMemo, useCallback, Suspense } from 'react'
import { VStack, Text, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

// Lazy load the SVGs
const GlobeAmericas = React.lazy(() => import('../../assets/svg/GlobeAmericas'))
const Landmark = React.lazy(() => import('../../assets/svg/Landmark'))
const ChartLine = React.lazy(() => import('../../assets/svg/ChartLine'))
const MicroChip = React.lazy(() => import('../../assets/svg/MicroChip'))
const FootballBall = React.lazy(() => import('../../assets/svg/FootballBall'))
const RevivalSVG = React.lazy(() => import('../../assets/svg/RevivalSVG'))
const Flask = React.lazy(() => import('../../assets/svg/Flask'))
const Leaf = React.lazy(() => import('../../assets/svg/Leaf'))
const Gavel = React.lazy(() => import('../../assets/svg/Gavel'))
const GraduationCap = React.lazy(() => import('../../assets/svg/GraduationCap'))
const Film = React.lazy(() => import('../../assets/svg/Film'))
const Utensils = React.lazy(() => import('../../assets/svg/Utensils'))
const UserTie = React.lazy(() => import('../../assets/svg/UserTie'))
const Plane = React.lazy(() => import('../../assets/svg/Plane'))

const MotionBox = motion(Box)

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

const CategoryCard = ({ category, isSelected, isCompleted, onSelect }) => {
  // Memoize the IconComponent to prevent recalculating
  const IconComponent = useMemo(
    () => categoryIcons[category] || GlobeAmericas,
    [category],
  )

  // Memoize the onSelect handler to prevent unnecessary re-renders
  const handleSelect = useCallback(
    () => onSelect(category),
    [category, onSelect],
  )

  return (
    <MotionBox
      borderWidth="1px"
      borderRadius="lg"
      borderColor={
        isCompleted ? 'green.500' : isSelected ? 'pink.500' : 'gray.700'
      }
      bg={
        isCompleted
          ? 'rgba(72, 187, 120, 0.1)'
          : isSelected
          ? 'rgba(237, 100, 166, 0.1)'
          : 'gray.800'
      }
      p={4}
      cursor="pointer"
      onClick={handleSelect}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      boxShadow={
        isCompleted
          ? '0 0 0 2px rgba(72, 187, 120, 0.6)'
          : isSelected
          ? '0 0 0 2px rgba(237, 100, 166, 0.6)'
          : 'none'
      }
    >
      <VStack spacing={2}>
        <Suspense fallback={<Box size="32px" />}>
          <IconComponent
            size="32px"
            color={isCompleted ? '#68D391' : isSelected ? '#ED64A6' : '#A0AEC0'}
          />
        </Suspense>

        <Text
          fontWeight="bold"
          textAlign="center"
          fontSize="sm"
          color={
            isCompleted ? 'green.400' : isSelected ? 'pink.400' : 'gray.300'
          }
          textTransform="capitalize"
        >
          {category}
        </Text>
      </VStack>
    </MotionBox>
  )
}

export default CategoryCard
