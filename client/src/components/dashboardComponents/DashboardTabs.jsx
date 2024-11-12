import React from 'react'
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react'
import { UsersDataTab } from './tabs/UsersDataTab'
import { ManagementTab } from './tabs/ManagementTab'
import { FeedbackTab } from './tabs/FeedbackTab'

export const DashboardTabs = () => {
  const textColor = useColorModeValue('gray.200', 'gray.200')
  const buttonColorScheme = 'teal'

  return (
    <Tabs isFitted variant="soft-rounded" colorScheme={buttonColorScheme}>
      <TabList mb="1em" mx={{ base: 0, md: '2rem' }}>
        <Tab color={textColor}>Users Data</Tab>
        <Tab color={textColor}>Management</Tab>
        <Tab color={textColor}>Feedback</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <UsersDataTab />
        </TabPanel>
        <TabPanel>
          <ManagementTab />
        </TabPanel>
        <TabPanel>
          <FeedbackTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
