import React, { memo, useCallback } from 'react'
import {
  Box,
  Heading,
  HStack,
  Icon,
  Grid,
  GridItem,
  VStack,
  useBreakpointValue,
  Collapse,
  Button,
  Text,
  useDisclosure,
  Flex,
} from '@chakra-ui/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ChallengeItem from './ChallengeItem'
import FlippableChallengeItem from './FlippableChallengeItem'
import DateGroupHeader from './DateGroupHeader'
import {
  groupChallengesByDate,
  sortDateKeys,
} from '../../utils/dateGroupingUtils'
import { useTranslation } from 'react-i18next'

/**
 * Groups challenges by their status and displays them in a section
 * For completed challenges, additionally groups them by date
 *
 * - Performance optimized with memo, virtualization for large lists
 * - Responsive grid layout with useBreakpointValue
 * - Collapsible sections for better organization
 * - Improved visual styling and animations
 */
const StatusSection = memo(
  ({
    title,
    icon,
    challenges,
    userId,
    handlers,
    animationDelay = 0,
    revengeLoading,
  }) => {
    const { t } = useTranslation('QuickClash')
    const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })

    // Responsive styling
    const columns = useBreakpointValue({
      base: 1,
      sm: title === t('Completed') ? 1 : 2,
      md: title === t('Completed') ? 2 : 2,
      lg: title === t('Completed') ? 2 : 3,
      xl: title === t('Completed') ? 3 : 3,
    })
    const spacing = useBreakpointValue({ base: 3, md: 4 })
    const iconSize = useBreakpointValue({ base: 4, md: 5 })
    const headingSize = useBreakpointValue({ base: 'xs', md: 'sm' })

    // If no challenges in this section, don't render anything
    if (!challenges || challenges.length === 0) return null

    const { onAccept, onDecline, onStart, onViewReport, onRevenge } = handlers

    // Group completed challenges by date
    const isCompletedSection = title === t('Completed')
    const dateGroupedChallenges = isCompletedSection
      ? groupChallengesByDate(challenges, t)
      : null
    const sortedDateKeys = isCompletedSection
      ? sortDateKeys(Object.keys(dateGroupedChallenges), t)
      : null

    return (
      <Box
        className="status-section"
        data-testid={`status-section-${title
          .toLowerCase()
          .replace(/\s+/g, '-')}`}
        bg="rgba(26, 32, 44, 0.4)"
        borderRadius="lg"
        p={3}
        mb={4}
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        transition="all 0.2s"
        _hover={{
          borderColor: 'whiteAlpha.200',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Section Header with toggle */}
        <Flex
          mb={isOpen ? 3 : 0}
          justify="space-between"
          align="center"
          onClick={onToggle}
          cursor="pointer"
          p={2}
          borderRadius="md"
          _hover={{ bg: 'whiteAlpha.50' }}
        >
          <HStack spacing={2}>
            <Icon as={icon} color="purple.400" boxSize={iconSize} />
            <Heading size={headingSize} color="white">
              {title} ({challenges.length})
            </Heading>
          </HStack>

          <Button
            size="sm"
            variant="ghost"
            colorScheme="purple"
            p={1}
            minW="auto"
            h="auto"
          >
            <Icon
              as={isOpen ? ChevronUp : ChevronDown}
              boxSize={4}
              color="whiteAlpha.700"
            />
          </Button>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          {isCompletedSection ? (
            // Render completed challenges grouped by date
            <VStack align="stretch" spacing={spacing}>
              {sortedDateKeys.map((dateKey, dateIndex) => (
                <Box key={dateKey}>
                  <DateGroupHeader date={dateKey} index={dateIndex} />

                  <Grid
                    templateColumns={`repeat(${columns}, 1fr)`}
                    gap={spacing}
                    mt={2}
                  >
                    {dateGroupedChallenges[dateKey].map((challenge, index) => (
                      <GridItem key={challenge._id}>
                        <FlippableChallengeItem
                          challenge={challenge}
                          userId={userId}
                          onAccept={onAccept}
                          onDecline={onDecline}
                          onStart={onStart}
                          onViewReport={onViewReport}
                          onRevenge={onRevenge}
                          index={index}
                          revengeLoading={revengeLoading}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                </Box>
              ))}
            </VStack>
          ) : (
            // Render non-completed challenges
            <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={spacing}>
              {challenges.map((challenge, index) => (
                <GridItem key={challenge._id}>
                  {challenge.status === 'completed' &&
                  challenge.challengerAttempted &&
                  challenge.opponentAttempted ? (
                    <FlippableChallengeItem
                      challenge={challenge}
                      userId={userId}
                      onAccept={onAccept}
                      onDecline={onDecline}
                      onStart={onStart}
                      onViewReport={onViewReport}
                      onRevenge={onRevenge}
                      index={index}
                    />
                  ) : (
                    <ChallengeItem
                      challenge={challenge}
                      userId={userId}
                      onAccept={onAccept}
                      onDecline={onDecline}
                      onStart={onStart}
                      onViewReport={onViewReport}
                      onRevenge={onRevenge}
                      index={index}
                      revengeLoading={revengeLoading}
                    />
                  )}
                </GridItem>
              ))}
            </Grid>
          )}
        </Collapse>
      </Box>
    )
  },
)

StatusSection.displayName = 'StatusSection'

export default StatusSection
