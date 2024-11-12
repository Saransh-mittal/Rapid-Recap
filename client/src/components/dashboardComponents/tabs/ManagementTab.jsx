import React, { Suspense } from 'react'
import { SimpleGrid, Button, Spinner } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { ManagementModals } from '../components/ManagementModals'

export const ManagementTab = () => {
  const buttonColorScheme = 'teal'
  const disclosures = {
    notificationStatus: useDisclosure(),
    tournamentManagement: useDisclosure(),
    articleManagement: useDisclosure(),
    currentAffairs: useDisclosure(),
    testTournament: useDisclosure(),
    onboardingArticle: useDisclosure(),
  }

  return (
    <>
      <SimpleGrid columns={[1, null, 3]} spacing={4}>
        <Button
          colorScheme={buttonColorScheme}
          onClick={disclosures.notificationStatus.onOpen}
        >
          Notification Status
        </Button>
        {/* ... other management buttons ... */}
      </SimpleGrid>

      <Suspense fallback={<Spinner />}>
        <ManagementModals disclosures={disclosures} />
      </Suspense>
    </>
  )
}
