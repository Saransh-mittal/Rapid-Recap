// components/quickClashComponents/ui/CustomTabs.jsx
import React, { useState } from 'react'
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  Flex,
  Icon,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Swords, History, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

/**
 * CustomTabs component for Quick Clash tabs
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab panels
 * @param {number} props.initialTabIndex - Initial active tab index
 */
const CustomTabs = ({ children, initialTabIndex = 0 }) => {
  const { t } = useTranslation('QuickClash')
  const [tabIndex, setTabIndex] = useState(initialTabIndex)
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Tab data with icons and labels
  const tabs = [
    {
      label: t('Active Challenges'),
      icon: Swords,
      ariaLabel: 'Active challenges tab',
      color: 'purple.400',
    },
    {
      label: t('History'),
      icon: History,
      ariaLabel: 'Challenge history tab',
      color: 'blue.400',
    },
    {
      label: t('Matchmaking'),
      icon: Users,
      ariaLabel: 'Matchmaking tab',
      color: 'green.400',
    },
  ]

  return (
    <Tabs
      index={tabIndex}
      onChange={setTabIndex}
      variant="unstyled"
      colorScheme="purple"
      isLazy
    >
      <TabList
        bg="whiteAlpha.100"
        borderRadius="lg"
        p={1}
        mb={4}
        display="flex"
        justifyContent="space-between"
      >
        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            flex={1}
            py={2}
            borderRadius="md"
            position="relative"
            color="whiteAlpha.700"
            _selected={{ color: 'white' }}
            _hover={{ color: 'white' }}
            aria-label={tab.ariaLabel}
          >
            <Flex
              direction={isMobile ? 'column' : 'row'}
              align="center"
              gap={isMobile ? 1 : 2}
            >
              <Icon as={tab.icon} boxSize={isMobile ? 5 : 4} />
              <Text
                fontSize={isMobile ? 'xs' : 'sm'}
                fontWeight={tabIndex === idx ? 'bold' : 'medium'}
              >
                {tab.label}
              </Text>
            </Flex>

            {/* Active tab indicator */}
            {tabIndex === idx && (
              <MotionBox
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                height="100%"
                borderRadius="md"
                bg="whiteAlpha.200"
                layoutId="tab-indicator"
                initial={false}
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                zIndex={-1}
              />
            )}
          </Tab>
        ))}
      </TabList>

      <TabPanels>{children}</TabPanels>
    </Tabs>
  )
}

export default CustomTabs
