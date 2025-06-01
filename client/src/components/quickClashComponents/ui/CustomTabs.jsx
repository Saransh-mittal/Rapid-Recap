// components/quickClashComponents/ui/CustomTabs.jsx
import React, { useState, useCallback, useEffect } from 'react'
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
  useTheme,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Swords, Zap, Calendar, Users, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)

// Map tab names to URL hashes
const TAB_HASH_MAP = {
  0: 'active',
  1: 'tasks',
  2: 'teams',
}

// Reverse map for looking up index from hash
const HASH_TAB_MAP = {
  active: 0,
  tasks: 1,
  teams: 2,
}

// Map icon names to actual icon components
const ICON_MAP = {
  Swords: Swords,
  Zap: Zap,
  Calendar: Calendar,
  Users: Users,
}

/**
 * Enhanced CustomTabs component for Quick Clash tabs with gamified styling
 * Now supports sub-routes (e.g., #active/1v1, #active/4v4)
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab panels
 * @param {number} props.initialTabIndex - Initial active tab index
 * @param {Function} props.onChange - Callback when tab changes
 * @param {Array} props.tabNames - Optional custom tab names
 * @param {Array} props.tabIcons - Optional icon names for tabs
 */
const CustomTabs = ({
  children,
  initialTabIndex = 0,
  onChange,
  tabNames,
  tabIcons = [],
}) => {
  const { t } = useTranslation('QuickClash')
  const [tabIndex, setTabIndex] = useState(initialTabIndex)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const theme = useTheme()

  // Get daily tasks progress
  const { tasks } = useSelector(state => state.quickClashDailyTasks)
  const pendingTasks = tasks.filter(task => !task.completed)

  // Tab data with icons, labels and colors
  const defaultTabs = [
    {
      label: tabNames?.[0] || t('Challenges'),
      icon: tabIcons[0] ? ICON_MAP[tabIcons[0]] : Swords,
      ariaLabel: 'active challenges tab',
      color: 'purple.400',
      hoverColor: 'purple.300',
      activeGradient: 'linear(to-r, purple.600, purple.400)',
      iconAnimation: { rotate: [0, 15, -15, 0], transition: { duration: 0.5 } },
      hash: 'active',
    },
    {
      label: tabNames?.[1] || t('Tasks'),
      icon: tabIcons[1] ? ICON_MAP[tabIcons[1]] : Calendar,
      ariaLabel: 'Daily Tasks tab',
      color: 'yellow.400',
      hoverColor: 'yellow.300',
      activeGradient: 'linear(to-r, yellow.600, yellow.400)',
      iconAnimation: { y: [0, -3, 0], transition: { duration: 0.5 } },
      hash: 'tasks',
    },
    // New tab for Teams
    {
      label: tabNames?.[2] || t('Teams'),
      icon: tabIcons[2] ? ICON_MAP[tabIcons[2]] : Users,
      ariaLabel: 'Teams tab',
      color: 'blue.400',
      hoverColor: 'blue.300',
      activeGradient: 'linear(to-r, blue.600, blue.400)',
      iconAnimation: { scale: [1, 1.1, 1], transition: { duration: 0.5 } },
      hash: 'teams',
    },
  ]

  // Only use tabs that have names provided
  const tabs = tabNames
    ? defaultTabs.slice(0, tabNames.length)
    : defaultTabs.slice(0, 2) // Default to just the first two tabs if no names provided

  // Enhanced hash parsing that supports sub-routes
  const getTabIndexFromHash = useCallback(hash => {
    if (!hash) return 0

    // Remove # symbol and split by /
    const hashParts = hash.substring(1).split('/')
    const mainRoute = hashParts[0]

    // Find the corresponding tab index for main route
    return HASH_TAB_MAP[mainRoute] !== undefined ? HASH_TAB_MAP[mainRoute] : 0
  }, [])

  // Check URL hash on mount and when hash changes
  useEffect(() => {
    const syncTabWithHash = () => {
      // Get current hash
      const hash = window.location.hash
      const newIndex = getTabIndexFromHash(hash)

      if (newIndex !== tabIndex) {
        setTabIndex(newIndex)
        if (onChange) {
          onChange(newIndex)
        }
      }
    }

    // Initial sync on component mount
    syncTabWithHash()

    // Listen for hash changes
    window.addEventListener('hashchange', syncTabWithHash)

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', syncTabWithHash)
    }
  }, [onChange, tabIndex, getTabIndexFromHash])

  // Handle tab change
  const handleTabChange = useCallback(
    index => {
      setTabIndex(index)

      // Update URL hash without triggering a page reload
      const hash = TAB_HASH_MAP[index] || 'active'

      // For the active tab, preserve sub-routes or default to 1v1
      if (hash === 'active') {
        const currentHash = window.location.hash.substring(1)
        if (currentHash.startsWith('active/')) {
          // Keep existing sub-route
          return // Don't change hash as it already has proper format
        } else {
          // Set default sub-route for active tab
          window.history.pushState(null, '', `#${hash}/1v1`)
        }
      } else {
        // For other tabs, just set the main route
        window.history.pushState(null, '', `#${hash}`)
      }

      if (onChange) {
        onChange(index)
      }
    },
    [onChange],
  )

  return (
    <Tabs
      index={tabIndex}
      onChange={handleTabChange}
      variant="unstyled"
      colorScheme="purple"
      isLazy
    >
      <TabList
        bg="rgba(20, 15, 35, 0.7)"
        borderRadius="xl"
        p={1.5}
        mb={5}
        display="flex"
        justifyContent="space-between"
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.25)"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        overflow="hidden"
        position="relative"
      >
        {/* Animated background glow effect */}
        <MotionBox
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="radial(circle at top right, rgba(128, 90, 213, 0.15), transparent 70%)"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          zIndex="0"
        />

        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            flex={1}
            py={isMobile ? 3 : 2.5}
            px={3}
            borderRadius="lg"
            position="relative"
            color={tabIndex === idx ? 'white' : 'whiteAlpha.700'}
            _hover={{ color: 'white' }}
            aria-label={tab.ariaLabel}
            transition="all 0.2s"
            zIndex="1"
          >
            <MotionFlex
              direction={isMobile ? 'column' : 'row'}
              align="center"
              justify="center"
              gap={isMobile ? 1.5 : 2}
              animate={tabIndex === idx ? 'active' : 'inactive'}
              variants={{
                active: { scale: 1.05 },
                inactive: { scale: 1 },
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              position="relative"
            >
              <MotionBox
                animate={tabIndex === idx ? tab.iconAnimation : {}}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon
                  as={tab.icon}
                  boxSize={isMobile ? 5 : 5}
                  color={tabIndex === idx ? 'white' : tab.color}
                />
              </MotionBox>

              <Text
                fontSize={isMobile ? 'sm' : 'md'}
                fontWeight={tabIndex === idx ? 'bold' : 'medium'}
                letterSpacing="wide"
              >
                {tab.label}
              </Text>

              {/* Badge for Daily Tasks */}
              {tab.label === t('Tasks') && pendingTasks.length > 0 && (
                <MotionBadge
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="xs"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [0.8, 1.2, 1],
                    transition: {
                      duration: 0.5,
                      repeat: 3,
                      repeatType: 'reverse',
                      repeatDelay: 5,
                    },
                  }}
                >
                  {pendingTasks.length}
                </MotionBadge>
              )}

              {/* Active indicator dot - shows for active tab only */}
              {tabIndex === idx && (
                <MotionBox
                  position="absolute"
                  bottom="-10px"
                  left="50%"
                  transform="translateX(-50%)"
                  width="4px"
                  height="4px"
                  borderRadius="full"
                  bgColor="white"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                />
              )}
            </MotionFlex>

            {/* Active tab indicator */}
            {tabIndex === idx && (
              <MotionBox
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                borderRadius="lg"
                bgGradient={tab.activeGradient}
                layoutId="tab-indicator"
                initial={false}
                transition={{
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                  mass: 1,
                }}
                boxShadow={`0 0 15px ${
                  theme.colors[tab.color.split('.')[0]][500]
                }`}
                zIndex="-1"
              >
                {/* Animated sparkle effects */}
                <MotionBox
                  position="absolute"
                  top="10%"
                  right="10%"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    rotate: [0, 90, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: Math.random(),
                  }}
                >
                  <Icon as={Zap} color="white" opacity={0.8} boxSize={3} />
                </MotionBox>

                <MotionBox
                  position="absolute"
                  bottom="15%"
                  left="15%"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    rotate: [0, -90, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: Math.random() * 0.5,
                  }}
                >
                  <Icon as={Zap} color="white" opacity={0.8} boxSize={3} />
                </MotionBox>
              </MotionBox>
            )}
          </Tab>
        ))}
      </TabList>

      <TabPanels>
        {React.Children.map(children, (child, idx) => (
          <MotionBox
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: tabIndex === idx ? 1 : 0,
              y: tabIndex === idx ? 0 : 10,
            }}
            transition={{ duration: 0.3 }}
            display={tabIndex === idx ? 'block' : 'none'}
          >
            {child}
          </MotionBox>
        ))}
      </TabPanels>
    </Tabs>
  )
}

export default CustomTabs
