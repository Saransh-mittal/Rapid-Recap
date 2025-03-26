// components/quickClashComponents/modals/newChallengeComponents/CategorySelectionStep.jsx
import React from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  VStack,
  Text,
  Flex,
  Badge,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Icon,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const CategoryGrid = ({ categories, selectedCategories, toggleCategory }) => (
  <Flex wrap="wrap" gap={2} justify="center">
    {categories.map(category => {
      const isSelected = selectedCategories.includes(category.key)
      const isSpecial = category.isSpecial

      return (
        <MotionBox
          key={category.key}
          onClick={() => toggleCategory(category.key)}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          width="calc(50% - 8px)"
          p={3}
          borderRadius="md"
          bg={
            isSelected
              ? `${category.color}.700`
              : isSpecial
              ? `${category.color}.900`
              : 'whiteAlpha.100'
          }
          borderWidth="1px"
          borderColor={
            isSelected
              ? `${category.color}.500`
              : isSpecial
              ? `${category.color}.600`
              : 'whiteAlpha.200'
          }
          cursor="pointer"
          transition="all 0.2s"
          boxShadow={
            isSelected
              ? `0 0 15px rgba(138, 43, 226, 0.4)`
              : isSpecial
              ? `0 0 8px rgba(138, 43, 226, 0.2)`
              : 'none'
          }
          mb={2}
          position="relative"
        >
          <VStack spacing={1} align="center">
            <Icon
              as={category.icon}
              color={`${category.color}.300`}
              boxSize={5}
            />
            <Text
              color="white"
              fontWeight={
                isSelected ? 'bold' : isSpecial ? 'semibold' : 'normal'
              }
              fontSize="sm"
              textAlign="center"
            >
              {category.label}
            </Text>

            {/* Special category indicator */}
            {isSpecial && (
              <Badge
                colorScheme={category.color}
                fontSize="2xs"
                variant="solid"
                px={1}
                borderRadius="full"
                position="absolute"
                top={-1}
                right={-1}
                boxShadow="0 0 5px rgba(0,0,0,0.3)"
              >
                <Icon as={Sparkles} boxSize={2} mr={1} />
                SPECIAL
              </Badge>
            )}
          </VStack>
        </MotionBox>
      )
    })}
  </Flex>
)

const CategoryTags = ({
  selectedCategories,
  categories,
  tagSize,
  removeCategory,
}) => (
  <Flex mt={2} flexWrap="wrap" gap={2}>
    {selectedCategories.map(cat => {
      const category = categories.find(c => c.key === cat)
      return (
        <Tag
          key={cat}
          colorScheme={category?.color || 'purple'}
          size={tagSize}
          borderRadius="full"
          pr={1}
          boxShadow="0 3px 10px rgba(0,0,0,0.3)"
        >
          {category?.isSpecial && (
            <Icon as={Sparkles} boxSize={3} mr={1} color="yellow.300" />
          )}
          <TagLabel>{category?.label}</TagLabel>
          <TagCloseButton onClick={() => removeCategory(cat)} />
        </Tag>
      )
    })}
  </Flex>
)

const CategorySelectionStep = ({
  processedCategories,
  selectedCategories,
  toggleCategory,
  removeCategory,
  isMobile,
  tagSize,
}) => {
  const { t } = useTranslation('QuickClash')

  // Show selected categories visualization
  const showTagsSection = selectedCategories.length > 0

  // Count special categories to conditionally show a subtitle
  const specialCategoriesCount = processedCategories.filter(
    c => c.isSpecial,
  ).length

  return (
    <VStack spacing={6}>
      <FormControl>
        <FormLabel color="whiteAlpha.900" fontWeight="medium">
          {t('Select Battle Category')}
        </FormLabel>

        {/* Special categories subtitle if any special categories exist */}
        {specialCategoriesCount > 0 && (
          <Text
            color="yellow.300"
            fontSize="sm"
            mb={2}
            textAlign="center"
            fontStyle="italic"
          >
            <Icon as={Sparkles} boxSize={3} mr={1} />
            {t('Special categories available!')}
          </Text>
        )}

        {/* Grid view for both desktop and mobile */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CategoryGrid
            categories={processedCategories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
          />
          <Text color="gray.300" fontSize="xs" mt={3} textAlign="center">
            {isMobile
              ? t('Tap to select a category')
              : t('Click to select a category')}
          </Text>
        </MotionBox>

        {/* Selected categories visualization */}
        {showTagsSection && (
          <Box mt={4}>
            <Divider my={2} borderColor="whiteAlpha.300" />
            <HStack>
              <Text fontSize="sm" color="whiteAlpha.700">
                {t('Selected Category')}:
              </Text>
              <Badge
                colorScheme={selectedCategories.length === 1 ? 'green' : 'red'}
              >
                {selectedCategories.length}/1
              </Badge>
            </HStack>
            <CategoryTags
              selectedCategories={selectedCategories}
              categories={processedCategories}
              tagSize={tagSize}
              removeCategory={removeCategory}
            />
            {selectedCategories.length !== 1 && (
              <Text color="red.300" fontSize="xs" mt={2}>
                <Icon as={AlertTriangle} boxSize={3} mr={1} />
                {t('Please select a category')}
              </Text>
            )}
          </Box>
        )}
      </FormControl>
    </VStack>
  )
}

export default CategorySelectionStep
