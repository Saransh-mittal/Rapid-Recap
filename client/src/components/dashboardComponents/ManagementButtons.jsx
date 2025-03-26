// src/components/dashboard/ManagementButtons.jsx
import React from 'react'
import { SimpleGrid, Button } from '@chakra-ui/react'

const ManagementButtons = ({
  onNotificationStatusOpen,
  onTournamentManagementOpen,
  onArticleManagementOpen,
  onCurrentAffairsOpen,
  onTestTournamentManagementOpen,
  onOnboardingArticleOpen,
  onMaintenanceOpen,
  onAnnouncementOpen,
  onQuickClashAnalyticsOpen,
  onInterBotQuickClashOpen,
  onSpecialCategoryManagementOpen,
}) => {
  const buttonColorScheme = 'teal'

  return (
    <SimpleGrid columns={[1, null, 3]} spacing={4}>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onNotificationStatusOpen}
      >
        Notification Status
      </Button>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onTournamentManagementOpen}
      >
        Manage Tournaments
      </Button>
      <Button colorScheme={buttonColorScheme} onClick={onArticleManagementOpen}>
        Manage Articles
      </Button>
      <Button colorScheme={buttonColorScheme} onClick={onCurrentAffairsOpen}>
        Current Affairs
      </Button>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onTestTournamentManagementOpen}
      >
        Manage Test Tournament
      </Button>
      <Button colorScheme={buttonColorScheme} onClick={onOnboardingArticleOpen}>
        Manage Onboarding Articles
      </Button>
      <Button colorScheme={buttonColorScheme} onClick={onMaintenanceOpen}>
        Manage Maintenance
      </Button>
      <Button onClick={onAnnouncementOpen} colorScheme={buttonColorScheme}>
        Send Announcement
      </Button>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onQuickClashAnalyticsOpen}
      >
        Quick Clash Analytics
      </Button>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onInterBotQuickClashOpen}
      >
        Inter-Bot Quick Clash
      </Button>
      <Button
        colorScheme={buttonColorScheme}
        onClick={onSpecialCategoryManagementOpen}
      >
        Special Categories
      </Button>
    </SimpleGrid>
  )
}

export default ManagementButtons
