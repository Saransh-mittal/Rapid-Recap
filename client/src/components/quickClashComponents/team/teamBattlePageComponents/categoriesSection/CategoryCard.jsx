// components/quickClashComponents/team/teamBattlePageComponents/categoriesSection/CategoryCard.jsx
import React, { memo, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play, FileText, CheckCircle } from 'lucide-react'

import CategoryIcon from './CategoryIcon'
import CategoryStatusBadge from './CategoryStatusBadge'
import { getCategoryInfo } from './categoryUtils'

const MotionBox = motion(Box)

/**
 * Individual Category Card Component - Optimized for performance
 */
const CategoryCard = memo(
  ({
    challenge,
    isAvailable,
    isCompleted,
    isSelectedByTeammate,
    isUserAssigned,
    userScore,
    opponentScore,
    onSelectCategory,
    onViewReport,
    reportModalLoading,
    categorySelectionLoading,
    selectedCategoryId,
    userTeam,
    user,
  }) => {
    const { t } = useTranslation('QuickClash')
    const navigate = useNavigate()

    // Responsive values
    const cardPadding = useBreakpointValue({ base: 3, sm: 4 })
    const cardHeight = useBreakpointValue({
      base: '170px',
      sm: '200px',
      md: '230px',
    })
    const buttonSize = useBreakpointValue({ base: 'sm', sm: 'md' })
    const smallButtonFontSize = useBreakpointValue({
      base: '10px',
      sm: '11px',
      md: '12px',
    })

    // Memoized category info
    const categoryInfo = useMemo(
      () => getCategoryInfo(challenge.category),
      [challenge.category],
    )

    // Memoized card styling
    const cardStyling = useMemo(() => {
      let cardBg = 'rgba(15, 23, 42, 0.9)'
      let borderColorValue = 'rgba(71, 85, 105, 0.3)'
      let shadowColor = 'rgba(0, 0, 0, 0.1)'

      if (isCompleted) {
        borderColorValue = '#10B981'
        shadowColor = 'rgba(16, 185, 129, 0.3)'
      } else if (isAvailable) {
        borderColorValue = categoryInfo.primaryColor
        shadowColor = `${categoryInfo.primaryColor}40`
      } else if (isSelectedByTeammate) {
        borderColorValue = '#F59E0B'
        shadowColor = 'rgba(245, 158, 11, 0.3)'
      }

      return { cardBg, borderColorValue, shadowColor }
    }, [
      isCompleted,
      isAvailable,
      isSelectedByTeammate,
      categoryInfo.primaryColor,
    ])

    // Event handlers
    const handleCardClick = e => {
      e.stopPropagation()
      if (isAvailable) {
        onSelectCategory(challenge.category, challenge.challenge?._id)
      }
    }

    const handleViewReport = e => {
      e.stopPropagation()
      onViewReport(challenge.challenge?._id)
    }

    const handleContinue = e => {
      e.stopPropagation()
      navigate(`/quickclash/session/${challenge.challenge?._id}`)
    }

    return (
      <MotionBox
        bg={cardStyling.cardBg}
        borderRadius="xl"
        p={cardPadding}
        position="relative"
        overflow="hidden"
        height={cardHeight}
        display="flex"
        flexDirection="column"
        border="2px solid"
        borderColor={cardStyling.borderColorValue}
        boxShadow={`0 8px 25px ${cardStyling.shadowColor}`}
        backdropFilter="blur(10px)"
        whileHover={{
          y: isAvailable ? -6 : -3,
          scale: isAvailable ? 1.03 : 1.01,
          boxShadow: `0 12px 35px ${cardStyling.shadowColor}`,
          transition: { duration: 0.3, ease: 'easeOut' },
        }}
        cursor={isAvailable ? 'pointer' : 'default'}
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: `linear(135deg, ${categoryInfo.primaryColor}15, transparent 60%)`,
          opacity: 0.8,
          zIndex: 0,
        }}
        onClick={handleCardClick}
      >
        {/* Battle Icon */}
        <Icon
          as={categoryInfo.battleIcon}
          position="absolute"
          top="8px"
          right="8px"
          boxSize={{ base: '14px', sm: '16px' }}
          color={categoryInfo.primaryColor}
          opacity={0.4}
          zIndex={1}
        />

        {/* Completed Check */}
        {isCompleted && (
          <Icon
            as={CheckCircle}
            position="absolute"
            top="8px"
            left="8px"
            boxSize={{ base: '16px', sm: '18px' }}
            color="#10B981"
            opacity={0.9}
            zIndex={1}
          />
        )}

        {/* Main Content */}
        <VStack
          spacing={{ base: 1, sm: 1.5 }}
          alignItems="center"
          flex={1}
          position="relative"
          zIndex={2}
          justify="space-between"
          py={{ base: 1, sm: 1.5 }}
        >
          {isCompleted ? (
            <CompletedCategoryContent
              categoryInfo={categoryInfo}
              challenge={challenge}
              userScore={userScore}
              opponentScore={opponentScore}
              t={t}
            />
          ) : (
            <ActiveCategoryContent
              categoryInfo={categoryInfo}
              challenge={challenge}
              isUserAssigned={isUserAssigned}
              isSelectedByTeammate={isSelectedByTeammate}
              isAvailable={isAvailable}
              t={t}
            />
          )}

          {/* Action Button */}
          <Box w="100%">
            {isCompleted ? (
              <Button
                size={buttonSize}
                variant="outline"
                borderColor="#10B981"
                color="#10B981"
                bg="rgba(16, 185, 129, 0.08)"
                _hover={{
                  bg: 'rgba(16, 185, 129, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(16, 185, 129, 0.25)',
                }}
                leftIcon={
                  <Icon as={FileText} boxSize={{ base: '11px', sm: '13px' }} />
                }
                width="100%"
                onClick={handleViewReport}
                isLoading={reportModalLoading}
                borderRadius="lg"
                fontSize={smallButtonFontSize}
                fontWeight="semibold"
              >
                {t('View Report')}
              </Button>
            ) : isUserAssigned && !isCompleted ? (
              <Button
                size={buttonSize}
                bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                color="white"
                _hover={{
                  filter: 'brightness(110%)',
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${categoryInfo.primaryColor}50`,
                }}
                leftIcon={
                  <Icon as={Play} boxSize={{ base: '12px', sm: '14px' }} />
                }
                width="100%"
                onClick={handleContinue}
                borderRadius="lg"
                fontSize={smallButtonFontSize}
                fontWeight="bold"
              >
                {t('Continue')}
              </Button>
            ) : (
              isAvailable && (
                <MotionBox
                  as={Button}
                  size={buttonSize}
                  bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                  color="white"
                  leftIcon={
                    <Icon as={Play} boxSize={{ base: '12px', sm: '14px' }} />
                  }
                  width="100%"
                  onClick={handleCardClick}
                  isLoading={
                    categorySelectionLoading &&
                    selectedCategoryId === challenge.challenge?._id
                  }
                  loadingText={t('Starting...')}
                  borderRadius="lg"
                  fontSize={smallButtonFontSize}
                  fontWeight="bold"
                  boxShadow={`0 4px 15px ${categoryInfo.primaryColor}40`}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    boxShadow: `0 8px 25px ${categoryInfo.primaryColor}60`,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                  _hover={{}}
                  _active={{}}
                >
                  {t('Start Challenge')}
                </MotionBox>
              )
            )}
          </Box>
        </VStack>
      </MotionBox>
    )
  },
)

/**
 * Completed Category Content Layout
 */
const CompletedCategoryContent = memo(
  ({ categoryInfo, challenge, userScore, opponentScore, t }) => (
    <VStack
      w="full"
      spacing={{ base: 1, sm: 1.5 }}
      alignItems="flex-start"
      mt={{ base: 1, sm: 1.5 }}
    >
      {/* Icon and Category Name - centered */}
      <VStack
        spacing={{ base: 0.5, sm: 1 }}
        alignItems="center"
        w="full"
        alignSelf="center"
      >
        <CategoryIcon categoryInfo={categoryInfo} />
        <Text
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight="bold"
          color="white"
          textAlign="center"
          lineHeight="1.2"
          textTransform="capitalize"
          letterSpacing="0.5px"
        >
          {challenge.category}
        </Text>
      </VStack>

      {/* Score Display */}
      <Box
        w="full"
        bg="rgba(15, 23, 42, 0.4)"
        borderRadius="md"
        p={{ base: 1.5, sm: 2 }}
        border="1px solid"
        borderColor="rgba(16, 185, 129, 0.15)"
        backdropFilter="blur(3px)"
      >
        <HStack
          spacing={1.5}
          alignItems="center"
          justifyContent="flex-start"
          w="full"
        >
          <Text
            color="gray.300"
            fontWeight="medium"
            fontSize={{ base: '11px', sm: '12px', md: '13px' }}
            letterSpacing="0.3px"
          >
            RQM:
          </Text>
          <HStack spacing={1} alignItems="center">
            <Text
              color="#10B981"
              fontWeight="bold"
              fontSize={{ base: '13px', sm: '14px', md: '15px' }}
              bg="rgba(16, 185, 129, 0.1)"
              px={1.5}
              py={0.5}
              borderRadius="sm"
              minW="20px"
              textAlign="center"
            >
              {userScore !== undefined ? userScore : '-'}
            </Text>
            <Text
              color="gray.400"
              fontSize={{ base: '10px', sm: '11px', md: '12px' }}
              fontWeight="medium"
              mx={0.5}
            >
              VS
            </Text>
            <Text
              color="#EF4444"
              fontWeight="bold"
              fontSize={{ base: '13px', sm: '14px', md: '15px' }}
              bg="rgba(239, 68, 68, 0.1)"
              px={1.5}
              py={0.5}
              borderRadius="sm"
              minW="20px"
              textAlign="center"
            >
              {opponentScore !== undefined ? opponentScore : '-'}
            </Text>
          </HStack>
        </HStack>
      </Box>
    </VStack>
  ),
)

/**
 * Active Category Content Layout
 */
const ActiveCategoryContent = memo(
  ({
    categoryInfo,
    challenge,
    isUserAssigned,
    isSelectedByTeammate,
    isAvailable,
    t,
  }) => (
    <VStack
      w="full"
      spacing={{ base: 2, sm: 2.5 }}
      alignItems="center"
      justify="center"
      flex={1}
    >
      {/* Icon and Category Name */}
      <VStack spacing={{ base: 1, sm: 1.5 }} alignItems="center">
        <CategoryIcon categoryInfo={categoryInfo} />
        <Text
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight="bold"
          color="white"
          textAlign="center"
          lineHeight="1.2"
          textTransform="capitalize"
          letterSpacing="0.5px"
        >
          {challenge.category}
        </Text>
      </VStack>

      {/* Status Badge */}
      <Box textAlign="center">
        <CategoryStatusBadge
          isUserAssigned={isUserAssigned}
          isSelectedByTeammate={isSelectedByTeammate}
          isAvailable={isAvailable}
          t={t}
        />
      </Box>
    </VStack>
  ),
)

CompletedCategoryContent.displayName = 'CompletedCategoryContent'
ActiveCategoryContent.displayName = 'ActiveCategoryContent'
CategoryCard.displayName = 'CategoryCard'

export default CategoryCard
