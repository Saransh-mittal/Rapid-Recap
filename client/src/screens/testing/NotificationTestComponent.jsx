// NotificationTestComponent.jsx
import React from 'react'
import { useDispatch } from 'react-redux'
import {
  Box,
  VStack,
  Button,
  Text,
  Heading,
  Flex,
  Divider,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react'
import * as TestNotifications from './NotificationTestExamples'

/**
 * A component to display buttons for testing all notification types
 * Place this component anywhere in your app for testing
 */
const NotificationTestComponent = () => {
  const dispatch = useDispatch()
  const bgColor = useColorModeValue('gray.100', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const sections = [
    {
      title: 'Basic Notifications',
      tests: [
        {
          name: 'Basic Text Notification',
          fn: TestNotifications.testBasicNotification,
        },
        {
          name: 'With Actions',
          fn: TestNotifications.testBasicNotificationWithActions,
        },
      ],
    },
    {
      title: 'XP Award Notifications',
      tests: [
        {
          name: 'Standard XP Award',
          fn: TestNotifications.testXpAwardNotification,
        },
        {
          name: 'Milestone Award',
          fn: TestNotifications.testMilestoneXpAwardNotification,
        },
        {
          name: 'Named Milestone',
          fn: TestNotifications.testNamedMilestoneXpAwardNotification,
        },
        {
          name: 'Level Up',
          fn: TestNotifications.testLevelUpXpAwardNotification,
        },
      ],
    },
    {
      title: 'Streak Notifications',
      tests: [
        {
          name: 'Active Streak',
          fn: TestNotifications.testActiveStreakNotification,
        },
        {
          name: 'Broken Streak',
          fn: TestNotifications.testBrokenStreakNotification,
        },
        {
          name: 'Streak Revival',
          fn: TestNotifications.testStreakRevivalNotification,
        },
        {
          name: 'Streak Revived',
          fn: TestNotifications.testRevivedStreakNotification,
        },
      ],
    },
    {
      title: 'Tournament Notifications',
      tests: [
        {
          name: 'Registration Open',
          fn: TestNotifications.testTournamentRegistrationNotification,
        },
        {
          name: 'Tournament Locked',
          fn: TestNotifications.testTournamentLockedNotification,
        },
        {
          name: 'Tournament Ongoing',
          fn: TestNotifications.testTournamentOngoingNotification,
        },
      ],
    },
    {
      title: 'Quick Clash Notifications',
      tests: [
        {
          name: 'New Challenge',
          fn: TestNotifications.testQuickClashNewChallengeNotification,
        },
        {
          name: 'Challenge Accepted',
          fn: TestNotifications.testQuickClashChallengeAcceptedNotification,
        },
        {
          name: 'Challenge Rejected',
          fn: TestNotifications.testQuickClashChallengeRejectedNotification,
        },
        {
          name: 'Challenge Completed',
          fn: TestNotifications.testQuickClashChallengeCompletedNotification,
        },
        {
          name: 'Both Completed',
          fn: TestNotifications.testQuickClashBothCompletedNotification,
        },
        {
          name: 'Analysis Ready',
          fn: TestNotifications.testQuickClashAnalysisReadyNotification,
        },
      ],
    },
    {
      title: 'Feedback Notifications',
      tests: [
        {
          name: 'Story Feedback',
          fn: TestNotifications.testStoryFeedbackNotification,
        },
        {
          name: 'Quiz Feedback',
          fn: TestNotifications.testQuizFeedbackNotification,
        },
        {
          name: 'Tournament Feedback',
          fn: TestNotifications.testTournamentQuizFeedbackNotification,
        },
      ],
    },
    {
      title: 'Special Cases',
      tests: [
        {
          name: 'Performance Warning',
          fn: TestNotifications.testPerformanceWarningNotification,
        },
        {
          name: 'Multiple Notifications',
          fn: TestNotifications.testMultipleNotifications,
        },
      ],
    },
  ]

  return (
    <Box
      mx="auto"
      p={6}
      maxW="container.lg"
      bg={bgColor}
      borderRadius="lg"
      boxShadow="lg"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Notification System Test Panel</Heading>
          <Text fontSize="sm" color="gray.500">
            Click any button to dispatch a test notification
          </Text>
        </Flex>

        <Divider />

        {sections.map((section, idx) => (
          <Box key={idx} mb={6}>
            <Heading size="md" mb={4} color="purple.500">
              {section.title}
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {section.tests.map((test, testIdx) => (
                <Button
                  key={testIdx}
                  onClick={() => test.fn(dispatch)}
                  colorScheme="blue"
                  size="sm"
                  variant="outline"
                  height="auto"
                  py={2}
                  whiteSpace="normal"
                  textAlign="center"
                >
                  {test.name}
                </Button>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </VStack>
    </Box>
  )
}

export default NotificationTestComponent
