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
  Tooltip,
  Spinner,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  Play,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  X,
  Lock,
} from 'lucide-react'

import CategoryIcon from './CategoryIcon'
import CategoryStatusBadge from './CategoryStatusBadge'
import { getCategoryInfo } from './categoryUtils'

/**
 * Individual Category Card Component with Enhanced Loading States and Selection Logic
 */
const CategoryCard = memo(
  ({
    challenge,
    isAvailable,
    isCompleted,
    isInProgress,
    isStartedButExited,
    isSelectedButNotStarted,
    isSelectedByTeammate,
    isUserAssigned,
    userScore,
    opponentScore,
    // Loading states
    isLoading,
    loadingType,
    isDisabled,
    // Enhanced lock states
    isLockedDueToExit,
    isLockedDueToSelection, // NEW PROP
    isLocked, // Combined lock state
    isThisTheParticipatedCategory,
    isThisTheSelectedCategory, // NEW PROP
    // Actions
    onSelectCategory,
    onDeselectCategory,
    onBeginChallenge,
    onViewReport,
    reportModalLoading,
    // Legacy props for backward compatibility
    categorySelectionLoading,
    selectedCategoryId,
    userTeam,
    user,
  }) => {
    const { t } = useTranslation('QuickClash')

    // UPDATED: Better responsive values for mobile devices
    const cardPadding = useBreakpointValue({ base: 2, sm: 3, md: 4 })
    const cardHeight = useBreakpointValue({
      base: '180px',
      sm: '200px',
      md: '220px',
      lg: '240px',
    })
    const buttonSize = useBreakpointValue({ base: 'xs', sm: 'sm', md: 'md' })
    const smallButtonFontSize = useBreakpointValue({
      base: '9px',
      sm: '10px',
      md: '11px',
    })
    const iconBoxSize = useBreakpointValue({
      base: '12px',
      sm: '14px',
      md: '16px',
    })
    const battleIconSize = useBreakpointValue({
      base: '12px',
      sm: '14px',
      md: '16px',
    })
    const statusIconSize = useBreakpointValue({
      base: '14px',
      sm: '16px',
      md: '18px',
    })

    // Memoized category info
    const categoryInfo = useMemo(
      () => getCategoryInfo(challenge.category),
      [challenge.category],
    )

    // Memoized loading states
    const loadingStates = useMemo(() => {
      return {
        isSelectingThis: isLoading && loadingType === 'selecting',
        isDeselectingThis: isLoading && loadingType === 'deselecting',
        isBeginningThis: isLoading && loadingType === 'beginning',
        isAnyLoading: isLoading || isDisabled,
      }
    }, [isLoading, loadingType, isDisabled])

    // Memoized card styling based on state - UPDATED
    const cardStyling = useMemo(() => {
      let cardBg = 'rgba(15, 23, 42, 0.9)'
      let borderColorValue = 'rgba(71, 85, 105, 0.3)'
      let shadowColor = 'rgba(0, 0, 0, 0.1)'

      if (isCompleted) {
        borderColorValue = '#10B981'
        shadowColor = 'rgba(16, 185, 129, 0.3)'
      } else if (isStartedButExited) {
        borderColorValue = '#EF4444'
        shadowColor = 'rgba(239, 68, 68, 0.3)'
      } else if (isInProgress) {
        borderColorValue = '#F59E0B'
        shadowColor = 'rgba(245, 158, 11, 0.3)'
      } else if (isSelectedButNotStarted) {
        borderColorValue = '#3B82F6'
        shadowColor = 'rgba(59, 130, 246, 0.3)'
      } else if (isAvailable) {
        borderColorValue = categoryInfo.primaryColor
        shadowColor = `${categoryInfo.primaryColor}40`
      } else if (isSelectedByTeammate) {
        borderColorValue = '#8B5CF6'
        shadowColor = 'rgba(139, 92, 246, 0.3)'
      } else if (isLockedDueToSelection) {
        // NEW: Locked due to selection state styling
        borderColorValue = '#F59E0B'
        shadowColor = 'rgba(245, 158, 11, 0.2)'
        cardBg = 'rgba(15, 23, 42, 0.7)' // Slightly dimmed
      } else if (isLockedDueToExit) {
        // Locked due to exit state styling
        borderColorValue = '#6B7280'
        shadowColor = 'rgba(107, 114, 128, 0.3)'
        cardBg = 'rgba(15, 23, 42, 0.6)' // More dimmed
      }

      // Dim the card if disabled or locked
      if (isDisabled || isLocked) {
        cardBg = 'rgba(15, 23, 42, 0.6)'
        shadowColor = 'rgba(0, 0, 0, 0.1)'
      }

      return { cardBg, borderColorValue, shadowColor }
    }, [
      isCompleted,
      isStartedButExited,
      isInProgress,
      isSelectedButNotStarted,
      isAvailable,
      isSelectedByTeammate,
      isLockedDueToExit,
      isLockedDueToSelection, // NEW
      isDisabled,
      isLocked,
      categoryInfo.primaryColor,
    ])

    // Event handlers - UPDATED
    const handleSelectCategory = e => {
      e.stopPropagation()
      if (!loadingStates.isAnyLoading && isAvailable && !isLocked) {
        onSelectCategory(challenge.category)
      }
    }

    const handleDeselectCategory = e => {
      e.stopPropagation()
      if (!loadingStates.isAnyLoading && !isLocked) {
        onDeselectCategory()
      }
    }

    const handleBeginChallenge = e => {
      e.stopPropagation()
      if (!loadingStates.isAnyLoading && !isLocked) {
        onBeginChallenge()
      }
    }

    const handleViewReport = e => {
      e.stopPropagation()
      if (!reportModalLoading) {
        onViewReport(challenge.challenge?._id)
      }
    }

    // Get loading text based on operation type
    const getLoadingText = operationType => {
      switch (operationType) {
        case 'selecting':
          return t('Selecting...')
        case 'deselecting':
          return t('Deselecting...')
        case 'beginning':
          return t('Starting...')
        default:
          return t('Loading...')
      }
    }

    return (
      <Box
        bg={cardStyling.cardBg}
        borderRadius={{ base: 'lg', sm: 'xl' }}
        p={cardPadding}
        position="relative"
        overflow="hidden"
        height={cardHeight}
        width="100%"
        maxW="100%"
        display="flex"
        flexDirection="column"
        border="2px solid"
        borderColor={cardStyling.borderColorValue}
        boxShadow={`0 6px 20px ${cardStyling.shadowColor}`}
        backdropFilter="blur(10px)"
        cursor={
          isAvailable && !loadingStates.isAnyLoading && !isLocked
            ? 'pointer'
            : 'default'
        }
        opacity={isDisabled || isLocked ? 0.6 : 1}
        _hover={
          isAvailable && !loadingStates.isAnyLoading && !isLocked
            ? {
                boxShadow: `0 8px 25px ${cardStyling.shadowColor}`,
                transform: 'translateY(-2px)',
              }
            : {}
        }
        transition="all 0.3s ease"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: `linear(135deg, ${categoryInfo.primaryColor}15, transparent 60%)`,
          opacity: isDisabled || isLocked ? 0.3 : 0.8,
          zIndex: 0,
        }}
        onClick={
          isAvailable && !loadingStates.isAnyLoading && !isLocked
            ? handleSelectCategory
            : undefined
        }
      >
        {/* Loading Overlay */}
        {isLoading && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.7)"
            borderRadius={{ base: 'lg', sm: 'xl' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={10}
          >
            <VStack spacing={2}>
              <Spinner
                size={{ base: 'sm', sm: 'md' }}
                color={categoryInfo.primaryColor}
                thickness="3px"
                speed="0.8s"
              />
              <Text
                color="white"
                fontSize={{ base: '2xs', sm: 'xs' }}
                fontWeight="medium"
                textAlign="center"
              >
                {getLoadingText(loadingType)}
              </Text>
            </VStack>
          </Box>
        )}

        {/* Battle Icon */}
        <Icon
          as={categoryInfo.battleIcon}
          position="absolute"
          top={{ base: '6px', sm: '8px' }}
          right={{ base: '6px', sm: '8px' }}
          boxSize={battleIconSize}
          color={categoryInfo.primaryColor}
          opacity={isDisabled || isLocked ? 0.3 : 0.4}
          zIndex={1}
        />

        {/* Status Icons - UPDATED with responsive sizes */}
        {isCompleted && (
          <Icon
            as={CheckCircle}
            position="absolute"
            top={{ base: '6px', sm: '8px' }}
            left={{ base: '6px', sm: '8px' }}
            boxSize={statusIconSize}
            color="#10B981"
            opacity={0.9}
            zIndex={1}
          />
        )}

        {isStartedButExited && (
          <Tooltip
            label={t('Challenge cannot be continued once exited')}
            placement="top"
            bg="red.600"
            color="white"
            fontSize="xs"
            p={2}
            borderRadius="md"
          >
            <Box
              position="absolute"
              top={{ base: '6px', sm: '8px' }}
              left={{ base: '6px', sm: '8px' }}
              zIndex={1}
            >
              <Icon
                as={XCircle}
                boxSize={statusIconSize}
                color="#EF4444"
                opacity={0.9}
              />
            </Box>
          </Tooltip>
        )}

        {isInProgress && (
          <Icon
            as={Zap}
            position="absolute"
            top={{ base: '6px', sm: '8px' }}
            left={{ base: '6px', sm: '8px' }}
            boxSize={statusIconSize}
            color="#F59E0B"
            opacity={0.9}
            zIndex={1}
          />
        )}

        {isSelectedButNotStarted && (
          <Icon
            as={CheckCircle}
            position="absolute"
            top={{ base: '6px', sm: '8px' }}
            left={{ base: '6px', sm: '8px' }}
            boxSize={statusIconSize}
            color="#3B82F6"
            opacity={0.9}
            zIndex={1}
          />
        )}

        {/* NEW: Locked due to selection icon */}
        {isLockedDueToSelection && (
          <Tooltip
            label={t(
              'You have already selected another category. Please deselect it first to choose this one.',
            )}
            placement="top"
            bg="orange.600"
            color="white"
            fontSize="xs"
            p={2}
            borderRadius="md"
          >
            <Box
              position="absolute"
              top={{ base: '6px', sm: '8px' }}
              left={{ base: '6px', sm: '8px' }}
              zIndex={1}
            >
              <Icon
                as={Lock}
                boxSize={statusIconSize}
                color="#F59E0B"
                opacity={0.9}
              />
            </Box>
          </Tooltip>
        )}

        {/* Locked due to exit icon */}
        {isLockedDueToExit && !isLockedDueToSelection && (
          <Tooltip
            label={t(
              'You cannot select this category because you have already participated in another challenge',
            )}
            placement="top"
            bg="gray.600"
            color="white"
            fontSize="xs"
            p={2}
            borderRadius="md"
          >
            <Box
              position="absolute"
              top={{ base: '6px', sm: '8px' }}
              left={{ base: '6px', sm: '8px' }}
              zIndex={1}
            >
              <Icon
                as={X}
                boxSize={statusIconSize}
                color="#6B7280"
                opacity={0.9}
              />
            </Box>
          </Tooltip>
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
          {/* Content based on state */}
          {isCompleted ? (
            <CompletedCategoryContent
              categoryInfo={categoryInfo}
              challenge={challenge}
              userScore={userScore}
              opponentScore={opponentScore}
              t={t}
            />
          ) : isStartedButExited ? (
            <ExitedChallengeContent
              categoryInfo={categoryInfo}
              challenge={challenge}
              t={t}
            />
          ) : isLockedDueToSelection ? (
            <LockedDueToSelectionContent
              categoryInfo={categoryInfo}
              challenge={challenge}
              t={t}
            />
          ) : isLockedDueToExit ? (
            <LockedCategoryContent
              categoryInfo={categoryInfo}
              challenge={challenge}
              t={t}
            />
          ) : (
            <ActiveCategoryContent
              categoryInfo={categoryInfo}
              challenge={challenge}
              isInProgress={isInProgress}
              isSelectedButNotStarted={isSelectedButNotStarted}
              isSelectedByTeammate={isSelectedByTeammate}
              isAvailable={isAvailable}
              t={t}
            />
          )}

          {/* Action Buttons - UPDATED with better mobile sizing */}
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
                }}
                leftIcon={<Icon as={FileText} boxSize={iconBoxSize} />}
                width="100%"
                onClick={handleViewReport}
                isLoading={reportModalLoading}
                loadingText={t('Loading...')}
                borderRadius="lg"
                fontSize={smallButtonFontSize}
                fontWeight="semibold"
                isDisabled={loadingStates.isAnyLoading}
                minH={{ base: '28px', sm: '32px', md: '36px' }}
              >
                {t('View Report')}
              </Button>
            ) : isStartedButExited ? (
              <Tooltip
                label={t(
                  'Once you exit a challenge, you cannot continue it. This prevents unfair advantages in team battles.',
                )}
                placement="top"
                bg="red.600"
                color="white"
                fontSize="xs"
                p={3}
                borderRadius="md"
                maxW="200px"
                textAlign="center"
              >
                <Button
                  size={buttonSize}
                  variant="outline"
                  borderColor="#EF4444"
                  color="#EF4444"
                  bg="rgba(239, 68, 68, 0.08)"
                  cursor="not-allowed"
                  leftIcon={<Icon as={XCircle} boxSize={iconBoxSize} />}
                  width="100%"
                  borderRadius="lg"
                  fontSize={smallButtonFontSize}
                  fontWeight="semibold"
                  _hover={{
                    bg: 'rgba(239, 68, 68, 0.08)',
                  }}
                  isDisabled
                  minH={{ base: '28px', sm: '32px', md: '36px' }}
                >
                  {t('Cannot Continue')}
                </Button>
              </Tooltip>
            ) : isLockedDueToSelection ? (
              <Tooltip
                label={t(
                  'You have already selected another category. Please deselect it first to choose this one.',
                )}
                placement="top"
                bg="orange.600"
                color="white"
                fontSize="xs"
                p={3}
                borderRadius="md"
                maxW="200px"
                textAlign="center"
              >
                <Button
                  size={buttonSize}
                  variant="outline"
                  borderColor="#F59E0B"
                  color="#F59E0B"
                  bg="rgba(245, 158, 11, 0.08)"
                  cursor="not-allowed"
                  leftIcon={<Icon as={Lock} boxSize={iconBoxSize} />}
                  width="100%"
                  borderRadius="lg"
                  fontSize={smallButtonFontSize}
                  fontWeight="semibold"
                  _hover={{
                    bg: 'rgba(245, 158, 11, 0.08)',
                  }}
                  isDisabled
                  minH={{ base: '28px', sm: '32px', md: '36px' }}
                >
                  {t('Change Selection')}
                </Button>
              </Tooltip>
            ) : isLockedDueToExit ? (
              <Tooltip
                label={t(
                  'You cannot select this category because you have already participated in another challenge in this battle.',
                )}
                placement="top"
                bg="gray.600"
                color="white"
                fontSize="xs"
                p={3}
                borderRadius="md"
                maxW="200px"
                textAlign="center"
              >
                <Button
                  size={buttonSize}
                  variant="outline"
                  borderColor="#6B7280"
                  color="#6B7280"
                  bg="rgba(107, 114, 128, 0.08)"
                  cursor="not-allowed"
                  leftIcon={<Icon as={X} boxSize={iconBoxSize} />}
                  width="100%"
                  borderRadius="lg"
                  fontSize={smallButtonFontSize}
                  fontWeight="semibold"
                  _hover={{
                    bg: 'rgba(107, 114, 128, 0.08)',
                  }}
                  isDisabled
                  minH={{ base: '28px', sm: '32px', md: '36px' }}
                >
                  {t('Locked')}
                </Button>
              </Tooltip>
            ) : isInProgress ? (
              <Button
                size={buttonSize}
                variant="outline"
                borderColor="#F59E0B"
                color="#F59E0B"
                bg="rgba(245, 158, 11, 0.08)"
                cursor="not-allowed"
                leftIcon={<Icon as={Zap} boxSize={iconBoxSize} />}
                width="100%"
                borderRadius="lg"
                fontSize={smallButtonFontSize}
                fontWeight="semibold"
                isDisabled
                minH={{ base: '28px', sm: '32px', md: '36px' }}
              >
                {t('In Progress')}
              </Button>
            ) : isSelectedButNotStarted ? (
              <VStack spacing={{ base: 1, sm: 2 }} w="100%">
                <Button
                  size={buttonSize}
                  bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                  color="white"
                  leftIcon={
                    loadingStates.isBeginningThis ? (
                      <Spinner size="xs" />
                    ) : (
                      <Icon as={Play} boxSize={iconBoxSize} />
                    )
                  }
                  width="100%"
                  onClick={handleBeginChallenge}
                  isLoading={loadingStates.isBeginningThis}
                  loadingText={t('Starting...')}
                  borderRadius="lg"
                  fontSize={smallButtonFontSize}
                  fontWeight="bold"
                  boxShadow={`0 4px 15px ${categoryInfo.primaryColor}40`}
                  _hover={{
                    filter:
                      loadingStates.isAnyLoading || isLocked
                        ? 'none'
                        : 'brightness(110%)',
                  }}
                  isDisabled={loadingStates.isAnyLoading || isLocked}
                  minH={{ base: '28px', sm: '32px', md: '36px' }}
                >
                  {t('Begin Challenge')}
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  color="gray.400"
                  leftIcon={
                    loadingStates.isDeselectingThis ? (
                      <Spinner size="xs" />
                    ) : (
                      <Icon as={RotateCcw} boxSize="8px" />
                    )
                  }
                  onClick={handleDeselectCategory}
                  fontSize={{ base: '8px', sm: '9px' }}
                  _hover={{
                    color:
                      loadingStates.isAnyLoading || isLocked
                        ? 'gray.400'
                        : 'white',
                    bg:
                      loadingStates.isAnyLoading || isLocked
                        ? 'transparent'
                        : 'rgba(255, 255, 255, 0.1)',
                  }}
                  isLoading={loadingStates.isDeselectingThis}
                  loadingText={t('Deselecting...')}
                  isDisabled={loadingStates.isAnyLoading || isLocked}
                  minH={{ base: '20px', sm: '24px' }}
                >
                  {t('Change Selection')}
                </Button>
              </VStack>
            ) : isAvailable && !isLocked ? (
              <Button
                size={buttonSize}
                bg={`linear-gradient(135deg, ${categoryInfo.primaryColor}, ${categoryInfo.secondaryColor})`}
                color="white"
                leftIcon={
                  loadingStates.isSelectingThis ? (
                    <Spinner size="xs" />
                  ) : (
                    <Icon as={Play} boxSize={iconBoxSize} />
                  )
                }
                width="100%"
                onClick={handleSelectCategory}
                isLoading={loadingStates.isSelectingThis}
                loadingText={t('Selecting...')}
                borderRadius="lg"
                fontSize={smallButtonFontSize}
                fontWeight="bold"
                boxShadow={`0 4px 15px ${categoryInfo.primaryColor}40`}
                _hover={{
                  filter: loadingStates.isAnyLoading
                    ? 'none'
                    : 'brightness(110%)',
                }}
                isDisabled={loadingStates.isAnyLoading}
                minH={{ base: '28px', sm: '32px', md: '36px' }}
              >
                {t('Select Category')}
              </Button>
            ) : null}
          </Box>
        </VStack>
      </Box>
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
          fontSize={{ base: '2xs', sm: 'xs' }}
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
        p={{ base: 1, sm: 1.5 }}
        border="1px solid"
        borderColor="rgba(16, 185, 129, 0.15)"
        backdropFilter="blur(3px)"
      >
        <HStack
          spacing={1}
          alignItems="center"
          justifyContent="center"
          w="full"
        >
          <Text
            color="gray.300"
            fontWeight="medium"
            fontSize={{ base: '9px', sm: '10px', md: '11px' }}
            letterSpacing="0.3px"
          >
            RQM:
          </Text>
          <HStack spacing={0.5} alignItems="center">
            <Text
              color="#10B981"
              fontWeight="bold"
              fontSize={{ base: '10px', sm: '11px', md: '12px' }}
              bg="rgba(16, 185, 129, 0.1)"
              px={1}
              py={0.5}
              borderRadius="sm"
              minW="18px"
              textAlign="center"
            >
              {userScore !== undefined ? userScore : '-'}
            </Text>
            <Text
              color="gray.400"
              fontSize={{ base: '8px', sm: '9px', md: '10px' }}
              fontWeight="medium"
              mx={0.5}
            >
              VS
            </Text>
            <Text
              color="#EF4444"
              fontWeight="bold"
              fontSize={{ base: '10px', sm: '11px', md: '12px' }}
              bg="rgba(239, 68, 68, 0.1)"
              px={1}
              py={0.5}
              borderRadius="sm"
              minW="18px"
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
 * Exited Challenge Content Layout
 */
const ExitedChallengeContent = memo(({ categoryInfo, challenge, t }) => (
  <VStack
    w="full"
    spacing={{ base: 1.5, sm: 2 }}
    alignItems="center"
    justify="center"
    flex={1}
  >
    {/* Icon and Category Name */}
    <VStack spacing={{ base: 1, sm: 1.5 }} alignItems="center">
      <CategoryIcon categoryInfo={categoryInfo} />
      <Text
        fontSize={{ base: '2xs', sm: 'xs' }}
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

    {/* Warning Message */}
    <Box
      bg="rgba(239, 68, 68, 0.1)"
      borderRadius="md"
      p={{ base: 1.5, sm: 2 }}
      border="1px solid"
      borderColor="rgba(239, 68, 68, 0.3)"
      w="full"
    >
      <VStack spacing={1} align="center">
        <Icon as={AlertTriangle} color="#EF4444" boxSize={3} />
        <Text
          color="#EF4444"
          fontSize={{ base: '8px', sm: '9px' }}
          fontWeight="medium"
          textAlign="center"
          lineHeight="1.3"
        >
          {t('Challenge Exited')}
        </Text>
        <Text
          color="red.200"
          fontSize={{ base: '7px', sm: '8px' }}
          textAlign="center"
          lineHeight="1.2"
          opacity={0.8}
        >
          {t('Cannot resume')}
        </Text>
      </VStack>
    </Box>
  </VStack>
))

/**
 * NEW: Locked Due to Selection Category Content Layout
 */
const LockedDueToSelectionContent = memo(({ categoryInfo, challenge, t }) => (
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
        fontSize={{ base: '2xs', sm: 'xs' }}
        fontWeight="bold"
        color="white"
        textAlign="center"
        lineHeight="1.2"
        textTransform="capitalize"
        letterSpacing="0.5px"
        opacity={0.8}
      >
        {challenge.category}
      </Text>
    </VStack>

    {/* Locked Message */}
    <Box
      bg="rgba(245, 158, 11, 0.1)"
      borderRadius="md"
      p={{ base: 1.5, sm: 2 }}
      border="1px solid"
      borderColor="rgba(245, 158, 11, 0.3)"
      w="full"
    >
      <VStack spacing={1} align="center">
        <Icon as={Lock} color="#F59E0B" boxSize={3} />
        <Text
          color="#F59E0B"
          fontSize={{ base: '8px', sm: '9px' }}
          fontWeight="medium"
          textAlign="center"
          lineHeight="1.3"
        >
          {t('Another Selected')}
        </Text>
        <Text
          color="orange.200"
          fontSize={{ base: '7px', sm: '8px' }}
          textAlign="center"
          lineHeight="1.2"
          opacity={0.8}
        >
          {t('Change selection')}
        </Text>
      </VStack>
    </Box>
  </VStack>
))

/**
 * Locked Category Content Layout
 */
const LockedCategoryContent = memo(({ categoryInfo, challenge, t }) => (
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
        fontSize={{ base: '2xs', sm: 'xs' }}
        fontWeight="bold"
        color="white"
        textAlign="center"
        lineHeight="1.2"
        textTransform="capitalize"
        letterSpacing="0.5px"
        opacity={0.7}
      >
        {challenge.category}
      </Text>
    </VStack>

    {/* Locked Message */}
    <Box
      bg="rgba(107, 114, 128, 0.1)"
      borderRadius="md"
      p={{ base: 1.5, sm: 2 }}
      border="1px solid"
      borderColor="rgba(107, 114, 128, 0.3)"
      w="full"
    >
      <VStack spacing={1} align="center">
        <Icon as={X} color="#6B7280" boxSize={3} />
        <Text
          color="#6B7280"
          fontSize={{ base: '8px', sm: '9px' }}
          fontWeight="medium"
          textAlign="center"
          lineHeight="1.3"
        >
          {t('Category Locked')}
        </Text>
        <Text
          color="gray.400"
          fontSize={{ base: '7px', sm: '8px' }}
          textAlign="center"
          lineHeight="1.2"
          opacity={0.8}
        >
          {t('Already participated')}
        </Text>
      </VStack>
    </Box>
  </VStack>
))

/**
 * Active Category Content Layout
 */
const ActiveCategoryContent = memo(
  ({
    categoryInfo,
    challenge,
    isInProgress,
    isSelectedButNotStarted,
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
          fontSize={{ base: '2xs', sm: 'xs' }}
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
          isInProgress={isInProgress}
          isSelectedButNotStarted={isSelectedButNotStarted}
          isSelectedByTeammate={isSelectedByTeammate}
          isAvailable={isAvailable}
          t={t}
        />
      </Box>
    </VStack>
  ),
)

// Add display names
CompletedCategoryContent.displayName = 'CompletedCategoryContent'
ExitedChallengeContent.displayName = 'ExitedChallengeContent'
LockedDueToSelectionContent.displayName = 'LockedDueToSelectionContent'
LockedCategoryContent.displayName = 'LockedCategoryContent'
ActiveCategoryContent.displayName = 'ActiveCategoryContent'
CategoryCard.displayName = 'CategoryCard'

export default CategoryCard
