import React from 'react'
import {
  VStack,
  Text,
  Button,
  SimpleGrid,
  Box,
  Flex,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { categories } from '../../assets/Categories'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import { InfoIcon } from '@chakra-ui/icons'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

const CategorySelection = ({ selectedCategories, onCategoryToggle }) => {
  const { t } = useTranslation('categories')
  const { t: onboardingT } = useTranslation('OnboardingProcess')

  // Responsive values
  const containerHeight = useBreakpointValue({ base: 'auto', md: '100vh' })
  const containerPadding = useBreakpointValue({
    base: { top: '2rem', bottom: '2rem', x: '1rem' },
    md: 8,
  })
  const titleFontSize = useBreakpointValue({ base: '3xl', md: '5xl' })
  const spacing = useBreakpointValue({ base: 4, md: 8 })

  return (
    <Box
      key={i18n.language}
      minH={containerHeight}
      display="flex"
      alignItems="center"
      justifyContent="center"
      pt={containerPadding.top || containerPadding}
      pb={containerPadding.bottom || containerPadding}
      px={containerPadding.x || containerPadding}
      overflow="auto"
    >
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        w="100%"
        maxW="1200px"
      >
        <VStack spacing={spacing} align="stretch">
          <Text
            fontSize={titleFontSize}
            fontWeight="bold"
            color="white"
            textShadow="2px 2px 4px rgba(0,0,0,0.4)"
            textAlign="center"
          >
            {onboardingT('selectInterests')}
          </Text>

          <MotionFlex
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            bg="rgba(128, 90, 213, 0.1)"
            borderRadius="xl"
            p={{ base: 3, md: 4 }}
            alignItems="center"
            maxW="800px"
            mx="auto"
            borderWidth="1px"
            borderColor="purple.500"
            boxShadow="0 0 20px rgba(128, 90, 213, 0.2)"
            backdropFilter="blur(10px)"
          >
            <Icon
              as={InfoIcon}
              w={{ base: 4, md: 6 }}
              h={{ base: 4, md: 6 }}
              color="purple.300"
              mr={{ base: 2, md: 4 }}
              flexShrink={0}
            />
            <Text
              fontSize={{ base: 'xs', md: 'md' }}
              color="whiteAlpha.900"
              lineHeight="1.6"
              textShadow="0 2px 4px rgba(0,0,0,0.2)"
            >
              {onboardingT('recommendedArticlesInfo')}
            </Text>
          </MotionFlex>

          <Text
            fontSize={{ base: 'md', md: 'xl' }}
            color="whiteAlpha.800"
            textAlign="center"
            maxW="800px"
            mx="auto"
          >
            {onboardingT('chooseCategories')}
          </Text>

          <SimpleGrid
            columns={{ base: 2, md: 3, lg: 5 }}
            spacing={{ base: 3, md: 6 }}
            mt={{ base: 2, md: 4 }}
          >
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
                    height={{ base: '60px', md: '80px' }}
                    fontSize={{ base: 'sm', md: 'md' }}
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
