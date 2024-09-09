import React from 'react'
import { VStack, Text, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  FaGlobeAmericas,
  FaLandmark,
  FaChartLine,
  FaMicrochip,
  FaFootballBall,
  FaHeartbeat,
  FaFlask,
  FaLeaf,
  FaGavel,
  FaGraduationCap,
  FaFilm,
  FaUtensils,
  FaUserTie,
  FaPlane,
} from 'react-icons/fa'

const MotionBox = motion(Box)

const categoryIcons = {
  world: FaGlobeAmericas,
  politics: FaLandmark,
  business: FaChartLine,
  technology: FaMicrochip,
  sports: FaFootballBall,
  health: FaHeartbeat,
  science: FaFlask,
  environment: FaLeaf,
  crime: FaGavel,
  education: FaGraduationCap,
  entertainment: FaFilm,
  food: FaUtensils,
  lifestyle: FaUserTie,
  tourism: FaPlane,
}

const CategoryCard = ({ category, isSelected, isCompleted, onSelect }) => {
  const IconComponent = categoryIcons[category] || FaGlobeAmericas

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
      onClick={() => onSelect(category)}
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
        <Box
          as={IconComponent}
          size="30px"
          color={
            isCompleted ? 'green.400' : isSelected ? 'pink.400' : 'gray.400'
          }
        />
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
