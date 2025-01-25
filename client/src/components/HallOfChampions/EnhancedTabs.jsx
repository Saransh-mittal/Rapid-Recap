import React, { useState } from 'react'
import { Box, HStack, Button, Flex } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import LeaderboardFilter from './LeaderboardFilter'
import TournamentFilter from './TournamentFilter'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

const CustomTab = ({ children, isSelected, onClick }) => {
  return (
    <MotionButton
      onClick={onClick}
      position="relative"
      px={8}
      py={3}
      borderRadius="full"
      fontSize="lg"
      fontWeight="medium"
      color={isSelected ? 'white' : 'whiteAlpha.700'}
      bg="transparent"
      _hover={{ bg: 'transparent', color: 'white' }}
      transition="all 0.3s"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      sx={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      <AnimatePresence>
        {isSelected && (
          <MotionBox
            position="absolute"
            inset={0}
            zIndex={-1}
            borderRadius="full"
            bgGradient="linear(to-r, pink.500, purple.500, blue.500)"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.4, ease: 'easeOut' },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.3, ease: 'easeIn' },
            }}
            layoutId="tab-background"
          />
        )}
      </AnimatePresence>

      <Box
        position="absolute"
        inset={0}
        zIndex={-2}
        borderRadius="full"
        bg="whiteAlpha.50"
        backdropFilter="blur(8px)"
      />
    </MotionButton>
  )
}

const TabPanel = ({ children, isSelected }) => (
  <AnimatePresence mode="wait">
    {isSelected && (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: 'easeOut',
            when: 'beforeChildren',
          },
        }}
        exit={{
          opacity: 0,
          y: -20,
          transition: {
            duration: 0.3,
            ease: 'easeIn',
          },
        }}
        position="absolute"
        width="100%"
      >
        {children}
      </MotionBox>
    )}
  </AnimatePresence>
)

const EnhancedTabs = ({
  onTournamentChange,
  onLeaderboardFilterChange,
  children,
}) => {
  const [selectedTab, setSelectedTab] = useState(0)

  const handleTabClick = index => {
    setSelectedTab(index)
  }

  const handleLeaderboardFilterChange = filterId => {
    // Handle filter change logic here
    onLeaderboardFilterChange(filterId)
  }

  return (
    <Box position="relative" w="full">
      <Flex
        direction="column"
        gap={6}
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: { duration: 0.5, ease: 'easeOut' },
        }}
        mb={8}
      >
        {/* Tabs */}
        <HStack spacing={4} justify="center">
          <CustomTab
            isSelected={selectedTab === 0}
            onClick={() => handleTabClick(0)}
          >
            Champion's League
          </CustomTab>
          <CustomTab
            isSelected={selectedTab === 1}
            onClick={() => handleTabClick(1)}
          >
            Tournament
          </CustomTab>
        </HStack>

        {/* Filter */}
        <Flex justify="center" px={4}>
          {selectedTab === 0 ? (
            <LeaderboardFilter
              type="champions"
              onFilterChange={handleLeaderboardFilterChange}
            />
          ) : (
            <TournamentFilter onFilterChange={onTournamentChange} />
          )}
        </Flex>
      </Flex>

      {/* Tab Panels Container */}
      <Box position="relative" minH="400px">
        <TabPanel isSelected={selectedTab === 0}>{children[0]}</TabPanel>
        <TabPanel isSelected={selectedTab === 1}>{children[1]}</TabPanel>
      </Box>
    </Box>
  )
}

export default EnhancedTabs
