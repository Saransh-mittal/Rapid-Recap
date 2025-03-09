// components/quickClashComponents/matchmaking/CategorySelectionModal.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  HStack,
  VStack,
  Text,
  Avatar,
  Box,
  Flex,
  SimpleGrid,
  Tag,
  TagLabel,
  TagLeftIcon,
  Icon,
  useBreakpointValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Target, Star, X, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { categories as allCategories } from '../../../assets/Categories'
import { processCategories } from '../../../utils/categoryUtils'

const MotionBox = motion(Box)

/**
 * CategorySelectionModal component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {Object} [props.opponent] - Opponent data (optional)
 * @param {string} [props.title] - Modal title
 * @param {string} [props.subtitle] - Modal subtitle
 * @param {string} [props.submitButtonText] - Submit button text
 * @param {number} [props.requireExactly] - Exact number of categories required
 */
const CategorySelectionModal = ({
  isOpen,
  onClose,
  onSubmit,
  opponent = null,
  title = 'Choose Categories',
  subtitle = 'Select categories for this action',
  submitButtonText = 'Submit',
  requireExactly = 2,
}) => {
  const { t } = useTranslation('QuickClash')
  const [selectedCategories, setSelectedCategories] = useState([])
  const modalSize = useBreakpointValue({ base: 'full', md: 'lg' })

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategories([])
    }
  }, [isOpen])

  // Get processed categories with colors and icons
  const processedCategories = useMemo(() => {
    return processCategories(allCategories)
  }, [])

  // Handle category selection/deselection
  const toggleCategory = useCallback(
    categoryKey => {
      setSelectedCategories(prev => {
        if (prev.includes(categoryKey)) {
          // Remove category
          return prev.filter(c => c !== categoryKey)
        } else {
          // Add category (max based on requireExactly)
          if (prev.length >= requireExactly) {
            // If already have the max, replace the oldest selection
            return [...prev.slice(1), categoryKey]
          }
          return [...prev, categoryKey]
        }
      })
    },
    [requireExactly],
  )

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (selectedCategories.length === requireExactly) {
      onSubmit(selectedCategories)
    }
  }, [selectedCategories, onSubmit, requireExactly])

  // Animation variants
  const categoryVariants = {
    unselected: {
      scale: 1,
      boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
      transition: { duration: 0.2 },
    },
    selected: {
      scale: 1.05,
      boxShadow: '0 0 15px rgba(128, 90, 213, 0.6)',
      transition: { duration: 0.2 },
    },
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(8px)" />
      <ModalContent
        bg="linear-gradient(to bottom, #2d1b54, #1a1527)"
        borderRadius="xl"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.6)"
        borderWidth="1px"
        borderColor="purple.600"
        overflow="hidden"
        mx={3}
      >
        <ModalHeader color="white">{title}</ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Instructions */}
            <Text color="whiteAlpha.800">{subtitle}</Text>

            {/* Opponent Info - Only show if opponent is provided */}
            {opponent && (
              <HStack p={4} bg="whiteAlpha.100" borderRadius="md" spacing={4}>
                <Avatar
                  size="md"
                  name={opponent.name}
                  src={opponent.pic}
                  bg="purple.500"
                />

                <Box flex="1">
                  <Text color="white" fontWeight="bold">
                    {opponent.inGameName || opponent.name}
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    {t('Your opponent')}
                  </Text>
                </Box>

                <Icon as={ChevronRight} color="whiteAlpha.400" boxSize={5} />
              </HStack>
            )}

            {/* Selection count indicator */}
            <Alert
              status={
                selectedCategories.length === requireExactly
                  ? 'success'
                  : 'info'
              }
              borderRadius="md"
            >
              <AlertIcon />
              <Text fontSize="sm">
                {selectedCategories.length === requireExactly
                  ? t("Perfect! You've selected exactly {{count}} categories", {
                      count: requireExactly,
                    })
                  : t(
                      'Please select exactly {{count}} categories ({{selected}} selected)',
                      {
                        count: requireExactly,
                        selected: selectedCategories.length,
                      },
                    )}
              </Text>
            </Alert>

            {/* Category selection */}
            <Box>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                {processedCategories.map(category => (
                  <MotionBox
                    key={category.key}
                    p={3}
                    borderRadius="md"
                    bg="whiteAlpha.100"
                    borderWidth="2px"
                    borderColor={
                      selectedCategories.includes(category.key)
                        ? 'purple.500'
                        : 'transparent'
                    }
                    cursor="pointer"
                    onClick={() => toggleCategory(category.key)}
                    animate={
                      selectedCategories.includes(category.key)
                        ? 'selected'
                        : 'unselected'
                    }
                    variants={categoryVariants}
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    <HStack>
                      <Icon
                        as={category.icon || Star}
                        color={`${category.color}.400`}
                        boxSize={5}
                      />
                      <Text color="white" fontWeight="medium">
                        {category.label}
                      </Text>
                    </HStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </Box>

            {/* Selected categories */}
            {selectedCategories.length > 0 && (
              <Flex wrap="wrap" gap={2}>
                {selectedCategories.map(key => {
                  const category = processedCategories.find(c => c.key === key)
                  return (
                    <Tag
                      key={key}
                      size="lg"
                      colorScheme="purple"
                      borderRadius="full"
                    >
                      <TagLeftIcon as={category?.icon || Star} />
                      <TagLabel>{category?.label || key}</TagLabel>
                      <Box
                        as="span"
                        ml={1}
                        p={1}
                        cursor="pointer"
                        borderRadius="full"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        onClick={e => {
                          e.stopPropagation()
                          toggleCategory(key)
                        }}
                      >
                        <Icon as={X} boxSize={3} />
                      </Box>
                    </Tag>
                  )
                })}
              </Flex>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            color="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            {t('Cancel')}
          </Button>
          <Button
            colorScheme="purple"
            rightIcon={opponent ? <Target size={16} /> : undefined}
            isDisabled={selectedCategories.length !== requireExactly}
            onClick={handleSubmit}
          >
            {submitButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CategorySelectionModal
