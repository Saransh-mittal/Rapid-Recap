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
 * Individual Category Card Component with Enhanced Loading States and Fixed Priority Logic
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
    isLockedDueToSelection,
    isLocked,
    isThisTheParticipatedCategory,
    isThisTheSelectedCategory,
    // Teammate completion state
    isCompletedByTeammate,
    // Teammate information
    teammateInfo,
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

    // Responsive values
    const cardPadding = useBreakpointValue({ base: 2, sm: 3, md: 4 })
    const cardHeight = useBreakpointValue({
      base: '180px',
      sm: '210px',
      md: '240px',
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

    // Determine the primary state with proper priority ordering
    const primaryState = useMemo(() => {
      // Priority 1: User's own completion/participation states (highest priority)
      if (isCompleted) return 'userCompleted'
      if (isStartedButExited) return 'userExited'
      if (isInProgress) return 'userInProgress'
      if (isSelectedButNotStarted) return 'userSelectedNotStarted'

      // Priority 2: Teammate states (medium-high priority)
      if (isCompletedByTeammate) return 'teammateCompleted'
      if (isSelectedByTeammate) return 'teammateSelected'

      // Priority 3: Lock states due to user actions (medium priority)
      if (isLockedDueToExit) return 'lockedDueToExit'
      if (isLockedDueToSelection) return 'lockedDueToSelection'

      // Priority 4: Available state (lowest priority)
      if (isAvailable) return 'available'

      // Default: unavailable
      return 'unavailable'
    }, [
      isCompleted,
      isStartedButExited,
      isInProgress,
      isSelectedButNotStarted,
      isCompletedByTeammate,
      isSelectedByTeammate,
      isLockedDueToExit,
      isLockedDueToSelection,
      isAvailable,
    ])

    // Memoized card styling based on primary state
    const cardStyling = useMemo(() => {
      let cardBg = 'rgba(15, 23, 42, 0.9)'
      let borderColorValue = 'rgba(71, 85, 105, 0.3)'
      let shadowColor = 'rgba(0, 0, 0, 0.1)'

      switch (primaryState) {
        case 'userCompleted':
          borderColorValue = '#10B981'
          shadowColor = 'rgba(16, 185, 129, 0.3)'
          break
        case 'userExited':
          borderColorValue = '#EF4444'
          shadowColor = 'rgba(239, 68, 68, 0.3)'
          break
        case 'userInProgress':
          borderColorValue = '#F59E0B'
          shadowColor = 'rgba(245, 158, 11, 0.3)'
          break
        case 'userSelectedNotStarted':
          borderColorValue = '#3B82F6'
          shadowColor = 'rgba(59, 130, 246, 0.3)'
          break
        case 'teammateCompleted':
        case 'teammateSelected':
          borderColorValue = '#8B5CF6'
          shadowColor = 'rgba(139, 92, 246, 0.3)'
          break
        case 'lockedDueToSelection':
          borderColorValue = '#F59E0B'
          shadowColor = 'rgba(245, 158, 11, 0.2)'
          cardBg = 'rgba(15, 23, 42, 0.7)'
          break
        case 'lockedDueToExit':
          borderColorValue = '#6B7280'
          shadowColor = 'rgba(107, 114, 128, 0.3)'
          cardBg = 'rgba(15, 23, 42, 0.6)'
          break
        case 'available':
          borderColorValue = categoryInfo.primaryColor
          shadowColor = `${categoryInfo.primaryColor}40`
          break
        default:
          borderColorValue = 'rgba(71, 85, 105, 0.3)'
          shadowColor = 'rgba(0, 0, 0, 0.1)'
          cardBg = 'rgba(15, 23, 42, 0.6)'
          break
      }

      // Dim the card if disabled or locked, BUT NOT if teammate completed
      if ((isDisabled || isLocked) && primaryState !== 'teammateCompleted') {
        cardBg = 'rgba(15, 23, 42, 0.6)'
        shadowColor = 'rgba(0, 0, 0, 0.1)'
      }

      return { cardBg, borderColorValue, shadowColor }
    }, [primaryState, isDisabled, isLocked, categoryInfo.primaryColor])

    // Event handlers
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
        opacity={
          (isDisabled || isLocked) && primaryState !== 'teammateCompleted'
            ? 0.6
            : 1
        }
        _hover={
          isAvailable && !loadingStates.isAnyLoading && !isLocked
            ? {
                boxShadow: `0 8px 25px ${cardStyling.shadowColor}`,
                transform: 'translateY(-2px)',
              }
            : primaryState === 'teammateCompleted'
            ? {
                boxShadow: `0 8px 25px ${cardStyling.shadowColor}`,
                transform: 'translateY(-1px)',
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
          opacity={
            (isDisabled || isLocked) && primaryState !== 'teammateCompleted'
              ? 0.3
              : 0.4
          }
          zIndex={1}
        />

        {/* Status Icons - based on primaryState */}
        {primaryState === 'userCompleted' && (
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

        {primaryState === 'teammateCompleted' && (
          <Icon
            as={CheckCircle}
            position="absolute"
            top={{ base: '6px', sm: '8px' }}
            left={{ base: '6px', sm: '8px' }}
            boxSize={statusIconSize}
            color="#8B5CF6"
            opacity={0.9}
            zIndex={1}
          />
        )}

        {primaryState === 'userExited' && (
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

        {primaryState === 'userInProgress' && (
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

        {primaryState === 'userSelectedNotStarted' && (
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

        {primaryState === 'lockedDueToSelection' && (
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

        {primaryState === 'lockedDueToExit' && (
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
          spacing={{ base: 0.5, sm: 1 }}
          alignItems="center"
          flex={1}
          position="relative"
          zIndex={2}
          justify="space-between"
          py={{ base: 0.5, sm: 1 }}
          minH="0"
        >
          {/* Content based on primary state */}
          {(() => {
            switch (primaryState) {
              case 'userCompleted':
                return (
                  <CompletedCategoryContent
                    categoryInfo={categoryInfo}
                    challenge={challenge}
                    userScore={userScore}
                    opponentScore={opponentScore}
                    teammateInfo={teammateInfo}
                    t={t}
                  />
                )
              case 'userExited':
                return (
                  <ExitedChallengeContent
                    categoryInfo={categoryInfo}
                    challenge={challenge}
                    t={t}
                  />
                )
              case 'teammateCompleted':
                return (
                  <CompletedByTeammateContent
                    categoryInfo={categoryInfo}
                    challenge={challenge}
                    teammateInfo={teammateInfo}
                    t={t}
                  />
                )
              case 'lockedDueToSelection':
                return (
                  <LockedDueToSelectionContent
                    categoryInfo={categoryInfo}
                    challenge={challenge}
                    t={t}
                  />
                )
              case 'lockedDueToExit':
                return (
                  <LockedCategoryContent
                    categoryInfo={categoryInfo}
                    challenge={challenge}
                    t={t}
                  />
                )
              default:
                // All other states (userInProgress, userSelectedNotStarted, teammateSelected, available, unavailable)
                return (
                  <ActiveCategoryContent
                    categoryInfo={categoryInfo}
                    challenge={challenge}
                    isInProgress={isInProgress}
                    isSelectedButNotStarted={isSelectedButNotStarted}
                    isSelectedByTeammate={isSelectedByTeammate}
                    isAvailable={isAvailable}
                    isLockedDueToExit={isLockedDueToExit}
                    isLockedDueToSelection={isLockedDueToSelection}
                    isLocked={isLocked}
                    isCompletedByTeammate={isCompletedByTeammate}
                    teammateInfo={teammateInfo}
                    t={t}
                  />
                )
            }
          })()}

          {/* Action Buttons - based on primary state */}
          <Box w="100%" mt={{ base: 1, sm: 2 }}>
            {(() => {
              switch (primaryState) {
                case 'userCompleted':
                  return (
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
                  )

                case 'userExited':
                  return (
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
                  )

                case 'lockedDueToSelection':
                  return (
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
                  )

                case 'lockedDueToExit':
                  return (
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
                  )

                case 'userInProgress':
                  return (
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
                  )

                case 'userSelectedNotStarted':
                  return (
                    <VStack spacing={{ base: 0.5, sm: 1 }} w="100%">
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
                  )

                case 'available':
                  return (
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
                  )

                default:
                  // For teammateSelected and unavailable states
                  return null
              }
            })()}
          </Box>
        </VStack>
      </Box>
    )
  },
)

/**
 * Completed Category Content Layout with Teammate Info
 */
const CompletedCategoryContent = memo(
  ({ categoryInfo, challenge, userScore, opponentScore, teammateInfo, t }) => (
    <VStack
      w="full"
      spacing={{ base: 1, sm: 1.5 }}
      alignItems="center"
      justify="space-between"
      flex={1}
      py={{ base: 0.5, sm: 1 }}
    >
      <VStack
        spacing={{ base: 0.5, sm: 1 }}
        alignItems="center"
        flex={1}
        justify="center"
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

        {teammateInfo?.name && teammateInfo?.hasCompleted && (
          <Text
            fontSize={{ base: '10px', sm: '12px', md: '13px' }}
            color="#6EE7B7"
            fontWeight="medium"
            textAlign="center"
            opacity={0.8}
            maxW="100px"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            mt={{ base: 0.5, sm: 1 }}
            bg="rgba(16, 185, 129, 0.1)"
            px={1.5}
            py={0.5}
            borderRadius="sm"
            border="1px solid rgba(16, 185, 129, 0.2)"
          >
            {teammateInfo.inGameName || teammateInfo.name}
          </Text>
        )}
      </VStack>

      <Box
        w="full"
        bg="rgba(15, 23, 42, 0.4)"
        borderRadius="md"
        p={{ base: 1, sm: 1.5 }}
        border="1px solid"
        borderColor="rgba(16, 185, 129, 0.15)"
        backdropFilter="blur(3px)"
        mt="auto"
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
    py={{ base: 0.5, sm: 1 }}
  >
    <VStack
      spacing={{ base: 0.5, sm: 1 }}
      alignItems="center"
      flex={1}
      justify="center"
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

    <Box
      bg="rgba(239, 68, 68, 0.1)"
      borderRadius="md"
      p={{ base: 1, sm: 1.5 }}
      border="1px solid"
      borderColor="rgba(239, 68, 68, 0.3)"
      w="full"
      mt="auto"
    >
      <VStack spacing={0.5} align="center">
        <Icon as={AlertTriangle} color="#EF4444" boxSize={3} />
        <Text
          color="#EF4444"
          fontSize={{ base: '7px', sm: '8px' }}
          fontWeight="medium"
          textAlign="center"
          lineHeight="1.3"
        >
          {t('Challenge Exited')}
        </Text>
        <Text
          color="red.200"
          fontSize={{ base: '6px', sm: '7px' }}
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
 * Completed by Teammate Content Layout
 */
const CompletedByTeammateContent = memo(
  ({ categoryInfo, challenge, teammateInfo, t }) => (
    <VStack
      w="full"
      spacing={{ base: 1, sm: 1.5 }}
      alignItems="center"
      justify="space-between"
      flex={1}
      py={{ base: 0.5, sm: 1 }}
    >
      <VStack
        spacing={{ base: 0.5, sm: 1 }}
        alignItems="center"
        flex={1}
        justify="center"
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

        {teammateInfo?.name && (
          <Text
            fontSize={{ base: '10px', sm: '12px', md: '13px' }}
            color="#A78BFA"
            fontWeight="medium"
            textAlign="center"
            opacity={0.9}
            maxW="100px"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            mt={{ base: 0.5, sm: 1 }}
            bg="rgba(139, 92, 246, 0.15)"
            px={1.5}
            py={0.5}
            borderRadius="sm"
            border="1px solid rgba(139, 92, 246, 0.25)"
          >
            {teammateInfo.inGameName || teammateInfo.name}
          </Text>
        )}
      </VStack>

      <Box
        w="full"
        bg="rgba(15, 23, 42, 0.4)"
        borderRadius="md"
        p={{ base: 1, sm: 1.5 }}
        border="1px solid"
        borderColor="rgba(139, 92, 246, 0.15)"
        backdropFilter="blur(3px)"
        mt="auto"
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
              color="#8B5CF6"
              fontWeight="bold"
              fontSize={{ base: '10px', sm: '11px', md: '12px' }}
              bg="rgba(139, 92, 246, 0.1)"
              px={1}
              py={0.5}
              borderRadius="sm"
              minW="18px"
              textAlign="center"
            >
              {teammateInfo?.teammateScore !== undefined &&
              teammateInfo?.teammateScore !== null
                ? teammateInfo.teammateScore
                : '-'}
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
              {teammateInfo?.opponentScore !== undefined &&
              teammateInfo?.opponentScore !== null
                ? teammateInfo.opponentScore
                : '-'}
            </Text>
          </HStack>
        </HStack>
      </Box>
    </VStack>
  ),
)

/**
 * Locked Due To Selection Content Layout
 */
const LockedDueToSelectionContent = memo(({ categoryInfo, challenge, t }) => (
  <VStack
    w="full"
    spacing={{ base: 1.5, sm: 2 }}
    alignItems="center"
    justify="center"
    flex={1}
    py={{ base: 0.5, sm: 1 }}
  >
    <VStack
      spacing={{ base: 0.5, sm: 1 }}
      alignItems="center"
      flex={1}
      justify="center"
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
        opacity={0.8}
      >
        {challenge.category}
      </Text>
    </VStack>

    <Box
      bg="rgba(245, 158, 11, 0.1)"
      borderRadius="md"
      p={{ base: 1, sm: 1.5 }}
      border="1px solid"
      borderColor="rgba(245, 158, 11, 0.3)"
      w="full"
      mt="auto"
    >
      <VStack spacing={0.5} align="center">
        <Icon as={Lock} color="#F59E0B" boxSize={3} />
        <Text
          color="#F59E0B"
          fontSize={{ base: '7px', sm: '8px' }}
          fontWeight="medium"
          textAlign="center"
          lineHeight="1.3"
        >
          {t('Another Selected')}
        </Text>
        <Text
          color="orange.200"
          fontSize={{ base: '6px', sm: '7px' }}
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
    spacing={{ base: 1.5, sm: 2 }}
    alignItems="center"
    justify="center"
    flex={1}
    py={{ base: 0.5, sm: 1 }}
  >
    <VStack
      spacing={{ base: 0.5, sm: 1 }}
      alignItems="center"
      flex={1}
      justify="center"
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
        opacity={0.7}
      >
        {challenge.category}
      </Text>
    </VStack>

    <Box
      bg="rgba(107, 114, 128, 0.1)"
      borderRadius="md"
      p={{ base: 1, sm: 1.5 }}
      border="1px solid"
      borderColor="rgba(107, 114, 128, 0.3)"
      w="full"
      mt="auto"
    >
      <VStack spacing={0.5} align="center">
        <Icon as={X} color="#6B7280" boxSize={3} />
        <Text
          color="#6B7280"
          fontSize={{ base: '7px', sm: '8px' }}
          fontWeight="medium"
          textAlign="center"
          lineHeight="1.3"
        >
          {t('Category Locked')}
        </Text>
        <Text
          color="gray.400"
          fontSize={{ base: '6px', sm: '7px' }}
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
 * Active Category Content Layout with Teammate Info
 */
const ActiveCategoryContent = memo(
  ({
    categoryInfo,
    challenge,
    isInProgress,
    isSelectedButNotStarted,
    isSelectedByTeammate,
    isAvailable,
    isLockedDueToExit,
    isLockedDueToSelection,
    isLocked,
    isCompletedByTeammate,
    teammateInfo,
    t,
  }) => (
    <VStack
      w="full"
      spacing={{ base: 1, sm: 1.5 }}
      alignItems="center"
      justify="space-between"
      flex={1}
      py={{ base: 0.5, sm: 1 }}
    >
      <VStack
        spacing={{ base: 0.5, sm: 1 }}
        alignItems="center"
        flex={1}
        justify="center"
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

        {teammateInfo?.name &&
          (isSelectedByTeammate ||
            (isInProgress && teammateInfo.isAssigned)) && (
            <Text
              fontSize={{ base: '10px', sm: '12px', md: '13px' }}
              color="#A78BFA"
              fontWeight="medium"
              textAlign="center"
              opacity={0.8}
              maxW="100px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              mt={{ base: 0.5, sm: 1 }}
              bg="rgba(139, 92, 246, 0.1)"
              px={1.5}
              py={0.5}
              borderRadius="sm"
              border="1px solid rgba(139, 92, 246, 0.2)"
            >
              {teammateInfo.inGameName || teammateInfo.name}
            </Text>
          )}
      </VStack>

      <Box textAlign="center" w="70%" mt="auto">
        <CategoryStatusBadge
          isInProgress={isInProgress}
          isSelectedButNotStarted={isSelectedButNotStarted}
          isSelectedByTeammate={isSelectedByTeammate}
          isAvailable={isAvailable}
          isLockedDueToExit={isLockedDueToExit}
          isLockedDueToSelection={isLockedDueToSelection}
          isLocked={isLocked}
          isCompletedByTeammate={isCompletedByTeammate}
          teammateInfo={teammateInfo}
          t={t}
        />
      </Box>
    </VStack>
  ),
)

// Add display names
CompletedCategoryContent.displayName = 'CompletedCategoryContent'
CompletedByTeammateContent.displayName = 'CompletedByTeammateContent'
ExitedChallengeContent.displayName = 'ExitedChallengeContent'
LockedDueToSelectionContent.displayName = 'LockedDueToSelectionContent'
LockedCategoryContent.displayName = 'LockedCategoryContent'
ActiveCategoryContent.displayName = 'ActiveCategoryContent'
CategoryCard.displayName = 'CategoryCard'

export default CategoryCard
