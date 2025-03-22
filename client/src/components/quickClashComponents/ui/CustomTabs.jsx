// components/quickClashComponents/ui/CustomTabs.jsx
import React, { useState, useCallback } from 'react'
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
import { Swords, Users, Zap, CheckCircle, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionBadge = motion(Badge)

/**
 * Enhanced CustomTabs component for Quick Clash tabs with gamified styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab panels
 * @param {number} props.initialTabIndex - Initial active tab index
 * @param {Function} props.onChange - Callback when tab changes
 * @param {Array} props.tabNames - Optional custom tab names
 */
const CustomTabs = ({ children, initialTabIndex = 0, onChange, tabNames }) => {
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
      label: t('Challenges'),
      icon: Swords,
      ariaLabel: 'active challenges tab',
      color: 'purple.400',
      hoverColor: 'purple.300',
      activeGradient: 'linear(to-r, purple.600, purple.400)',
      iconAnimation: { rotate: [0, 15, -15, 0], transition: { duration: 0.5 } },
    },
    /* Comment out Analysis tab as requested
    {
      label: t('Analysis'),
      icon: History,
      ariaLabel: 'Challenge AI Analysis tab',
      color: 'blue.400',
      hoverColor: 'blue.300',
      activeGradient: 'linear(to-r, blue.600, blue.400)',
      iconAnimation: { rotate: [0, 360], transition: { duration: 0.7 } },
    },
    */
    {
      label: t('Daily Tasks'),
      icon: Calendar,
      ariaLabel: 'Daily Tasks tab',
      color: 'yellow.400',
      hoverColor: 'yellow.300',
      activeGradient: 'linear(to-r, yellow.600, yellow.400)',
      iconAnimation: { y: [0, -3, 0], transition: { duration: 0.5 } },
    },
    {
      label: t('Matchmaking'),
      icon: Users,
      ariaLabel: 'Matchmaking tab',
      color: 'green.400',
      hoverColor: 'green.300',
      activeGradient: 'linear(to-r, green.600, green.400)',
      iconAnimation: { scale: [1, 1.2, 1], transition: { duration: 0.5 } },
    },
  ]

  // Handle tab change
  const handleTabChange = useCallback(
    index => {
      setTabIndex(index)
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

        {defaultTabs.map((tab, idx) => (
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
              {tab.label === t('Daily Tasks') && pendingTasks.length > 0 && (
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
