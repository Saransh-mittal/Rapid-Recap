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
  useTheme,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Swords, History, Users, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)

/**
 * Enhanced CustomTabs component for Quick Clash tabs with gamified styling
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab panels
 * @param {number} props.initialTabIndex - Initial active tab index
 */
const CustomTabs = ({ children, initialTabIndex = 0 }) => {
  const { t } = useTranslation('QuickClash')
  const [tabIndex, setTabIndex] = useState(initialTabIndex)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const theme = useTheme()

  // Tab data with icons, labels and colors
  const tabs = [
    {
      label: t('Challenges'),
      icon: Swords,
      ariaLabel: 'challenges tab',
      color: 'purple.400',
      hoverColor: 'purple.300',
      activeGradient: 'linear(to-r, purple.600, purple.400)',
      iconAnimation: { rotate: [0, 15, -15, 0], transition: { duration: 0.5 } },
    },
    {
      label: t('Analysis'),
      icon: History,
      ariaLabel: 'Challenge AI Analysis tab',
      color: 'blue.400',
      hoverColor: 'blue.300',
      activeGradient: 'linear(to-r, blue.600, blue.400)',
      iconAnimation: { rotate: [0, 360], transition: { duration: 0.7 } },
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

  return (
    <Tabs
      index={tabIndex}
      onChange={setTabIndex}
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
