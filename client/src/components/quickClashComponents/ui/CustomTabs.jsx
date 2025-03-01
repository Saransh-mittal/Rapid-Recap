import React, { memo } from 'react'
import { Tabs, TabList, TabPanels, Tab, Icon } from '@chakra-ui/react'
import { Clock, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CustomTabs = ({ children }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
      <TabList
        mb={4}
        overflowX="auto"
        css={{
          scrollbarWidth: 'none',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        <Tab
          color="white"
          _selected={{
            color: 'white',
            bg: 'purple.600',
            fontWeight: 'medium',
          }}
          borderRadius="md"
          px={4}
          py={2}
          mr={2}
        >
          <Icon as={Clock} mr={2} />
          {t('Active Challenges')}
        </Tab>
        <Tab
          color="white"
          _selected={{
            color: 'white',
            bg: 'purple.600',
            fontWeight: 'medium',
          }}
          borderRadius="md"
          px={4}
          py={2}
        >
          <Icon as={Trophy} mr={2} />
          {t('History')}
        </Tab>
      </TabList>

      <TabPanels>{children}</TabPanels>
    </Tabs>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(CustomTabs)
