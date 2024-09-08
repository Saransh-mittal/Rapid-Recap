import React, { useState } from 'react'
import {
  VStack,
  Button,
  Alert,
  AlertIcon,
  SimpleGrid,
  Box,
  Heading,
} from '@chakra-ui/react'

import { useSelector } from 'react-redux'
import CategoryCard from './CategoryCard'

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

const RegistrationForm = ({ onRegister, registerLoading }) => {
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
      userId: user._id,
      selectedCategories: [...selectedCategories],
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
        isLoading={registerLoading}
      >
        Register for Tournament
      </Button>
    </VStack>
  )
}

export default RegistrationForm
