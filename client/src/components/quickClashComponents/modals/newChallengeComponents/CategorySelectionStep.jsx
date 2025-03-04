// components/quickClashComponents/modals/newChallengeComponents/CategorySelectionStep.jsx
import React from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  Select,
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
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const CategoryGrid = ({ categories, selectedCategories, toggleCategory }) => (
  <Flex wrap="wrap" gap={2} justify="center">
    {categories.map(category => (
      <MotionBox
        key={category.key}
        onClick={() => toggleCategory(category.key)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        width="calc(50% - 8px)"
        p={3}
        borderRadius="md"
        bg={
          selectedCategories.includes(category.key)
            ? `${category.color}.700`
            : 'whiteAlpha.100'
        }
        borderWidth="1px"
        borderColor={
          selectedCategories.includes(category.key)
            ? `${category.color}.500`
            : 'whiteAlpha.200'
        }
        cursor="pointer"
        transition="all 0.2s"
        boxShadow={
          selectedCategories.includes(category.key)
            ? `0 0 12px rgba(138, 43, 226, 0.3)`
            : 'none'
        }
        mb={2}
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
              selectedCategories.includes(category.key) ? 'bold' : 'normal'
            }
            fontSize="sm"
          >
            {category.label}
          </Text>
        </VStack>
      </MotionBox>
    ))}
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
        >
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
  handleCategoryChange,
  toggleCategory,
  removeCategory,
  isMobile,
  tagSize,
}) => {
  const { t } = useTranslation('QuickClash')

  // Show selected categories visualization
  const showTagsSection = selectedCategories.length > 0

  return (
    <VStack spacing={6}>
      <FormControl>
        <FormLabel color="whiteAlpha.900" fontWeight="medium">
          {t('Select Battle Categories')}
        </FormLabel>

        {!isMobile ? (
          // Desktop view: Multi-select dropdown
          <Box>
            <Select
              multiple
              size="md"
              onChange={handleCategoryChange}
              bg="whiteAlpha.100"
              color="white"
              borderColor="whiteAlpha.300"
              _hover={{ borderColor: 'purple.400' }}
              _focus={{
                borderColor: 'purple.500',
              }}
              height="120px"
              value={selectedCategories}
            >
              {processedCategories.map(category => (
                <option
                  key={category.key}
                  value={category.key}
                  style={{ background: '#1a1527' }}
                >
                  {category.label}
                </option>
              ))}
            </Select>
            <Text color="gray.300" fontSize="sm" mt={2}>
              {t('Hold Ctrl/Cmd to select exactly 2 categories')}
            </Text>
          </Box>
        ) : (
          // Mobile view: Clickable cards
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
              {t('Tap to select exactly 2 categories')}
            </Text>
          </MotionBox>
        )}

        {/* Selected categories visualization */}
        {showTagsSection && (
          <Box mt={4}>
            <Divider my={2} borderColor="whiteAlpha.300" />
            <HStack>
              <Text fontSize="sm" color="whiteAlpha.700">
                {t('Selected Categories')}:
              </Text>
              <Badge
                colorScheme={selectedCategories.length === 2 ? 'green' : 'red'}
              >
                {selectedCategories.length}/2
              </Badge>
            </HStack>
            <CategoryTags
              selectedCategories={selectedCategories}
              categories={processedCategories}
              tagSize={tagSize}
              removeCategory={removeCategory}
            />
            {selectedCategories.length !== 2 && (
              <Text color="red.300" fontSize="xs" mt={2}>
                <Icon as={AlertTriangle} boxSize={3} mr={1} />
                {t('Please select exactly 2 categories')}
              </Text>
            )}
          </Box>
        )}
      </FormControl>
    </VStack>
  )
}

export default CategorySelectionStep
