import React, { useState } from 'react'
import {
  VStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  SimpleGrid,
  Box,
  Heading,
} from '@chakra-ui/react'
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
import { useSelector } from 'react-redux'

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

const categories = [
  'world',
  'politics',
  'business',
  'technology',
  'sports',
  'health',
  'science',
  'environment',
  'crime',
  'education',
  'entertainment',
  'food',
  'lifestyle',
  'tourism',
]

const CategoryCard = ({ category, isSelected, onSelect }) => {
  const IconComponent = categoryIcons[category] || FaGlobeAmericas

  return (
    <MotionBox
      borderWidth="1px"
      borderRadius="lg"
      borderColor={isSelected ? 'pink.500' : 'gray.700'}
      bg={isSelected ? 'rgba(237, 100, 166, 0.1)' : 'gray.800'}
      p={4}
      cursor="pointer"
      onClick={() => onSelect(category)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      boxShadow={isSelected ? '0 0 0 2px rgba(237, 100, 166, 0.6)' : 'none'}
    >
      <VStack spacing={2}>
        <Box
          as={IconComponent}
          size="30px"
          color={isSelected ? 'pink.400' : 'gray.400'}
        />
        <Text
          fontWeight="bold"
          textAlign="center"
          fontSize="sm"
          color={isSelected ? 'pink.400' : 'gray.300'}
          textTransform="capitalize"
        >
          {category}
        </Text>
      </VStack>
    </MotionBox>
  )
}

const RegistrationForm = ({ onRegister }) => {
  const { user } = useSelector(state => state.auth)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [error, setError] = useState('')

  const handleCategorySelect = category => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleRegister = () => {
    if (selectedCategories.length !== 5) {
      setError('Please select exactly 5 categories.')
      return
    }
    onRegister({
      username,
      categories: [...selectedCategories, 'Current Affairs'],
    })
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" mb={4} color="white">
          Select 5 categories:
        </Heading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4}>
          {categories.map(category => (
            <CategoryCard
              key={category}
              category={category}
              isSelected={selectedCategories.includes(category)}
              onSelect={handleCategorySelect}
            />
          ))}
        </SimpleGrid>
      </Box>
      {error && (
        <Alert status="error" borderRadius="md" bg="red.900" color="white">
          <AlertIcon color="red.300" />
          {error}
        </Alert>
      )}
      <Button
        colorScheme="pink"
        onClick={handleRegister}
        size="lg"
        fontWeight="bold"
        boxShadow="0px 4px 10px rgba(237, 100, 166, 0.3)"
        _hover={{
          boxShadow: '0px 6px 15px rgba(237, 100, 166, 0.4)',
          transform: 'translateY(-2px)',
        }}
        transition="all 0.2s"
      >
        Register for Tournament
      </Button>
    </VStack>
  )
}

export default RegistrationForm
