import React, { useState } from 'react'
import {
  VStack,
  Button,
  Alert,
  AlertIcon,
  SimpleGrid,
  Box,
  Heading,
  Flex,
  Icon,
  useToast,
} from '@chakra-ui/react'

import { useSelector } from 'react-redux'
import CategoryCard from './CategoryCard'
import { FaDice } from 'react-icons/fa'

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
  const toast = useToast()

  const handleCategorySelect = category => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else if (selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleRandomPick = () => {
    const shuffled = [...categories].sort(() => 0.5 - Math.random())
    setSelectedCategories(shuffled.slice(0, 5))
    setError('')
  }

  const handleRegister = async () => {
    if (selectedCategories.length !== 5) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select exactly 5 categories.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
      return
    }

    try {
      await onRegister({
        userId: user._id,
        selectedCategories: [...selectedCategories],
      })
      toast({
        title: 'Registration Successful',
        description:
          'You have been successfully registered for the tournament.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    } catch (err) {
      toast({
        title: 'Registration Failed',
        description:
          'There was an error during registration. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Flex justifyContent={'space-between'} alignItems={'center'} mb={4}>
          <Heading size="md" color="white">
            Select 5 categories:
          </Heading>
          <Button
            onClick={handleRandomPick}
            variant="outline"
            size="md"
            fontWeight="medium"
            leftIcon={<Icon as={FaDice} />}
            color="pink.300"
            borderColor="pink.300"
            _hover={{
              bg: 'rgba(237, 100, 166, 0.1)',
              borderColor: 'pink.400',
              color: 'pink.400',
              boxShadow: '0px 0px 8px rgba(237, 100, 166, 0.4)',
            }}
            _active={{
              bg: 'rgba(237, 100, 166, 0.2)',
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s"
          >
            Surprise Me
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} spacing={4}>
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
