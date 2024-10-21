import React from 'react'
import { VStack, Text, Button, SimpleGrid, Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { categories } from '../../assets/Categories'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const CategorySelection = ({ selectedCategories, onCategoryToggle }) => {
  const { t } = useTranslation('categories')
  return (
    <Box
      key={i18n.language}
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        w="100%"
        maxW="1200px"
      >
        <VStack spacing={8} align="stretch">
          <Text
            fontSize="5xl"
            fontWeight="bold"
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            textAlign="center"
          >
            Select Your Interests
          </Text>
          <Text
            fontSize="xl"
            color="whiteAlpha.800"
            textAlign="center"
            maxW="800px"
            mx="auto"
          >
            Choose 5 categories that interest you most. These will help us
            personalize your content.
          </Text>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={6}>
            {categories.map(
              category =>
                category.labelForBoarding !== 'all' && (
                  <Button
                    key={`${category.key}-${i18n.language}`}
                    onClick={() => onCategoryToggle(category.key)}
                    bg={
                      selectedCategories.includes(category.key)
                        ? 'purple.600'
                        : 'rgba(255,255,255,0.1)'
                    }
                    color="white"
                    size="lg"
                    height="80px"
                    _hover={{
                      bg: selectedCategories.includes(category.key)
                        ? 'purple.700'
                        : 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-5px)',
                      boxShadow: 'xl',
                    }}
                    transition="all 0.2s"
                    textTransform={'capitalize'}
                  >
                    {t(`categories.${category.labelForBoarding}`)}
                  </Button>
                ),
            )}
          </SimpleGrid>
        </VStack>
      </MotionBox>
    </Box>
  )
}

export default CategorySelection
