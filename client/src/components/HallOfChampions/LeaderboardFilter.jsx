import React, { useState } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Clock, Trophy } from 'lucide-react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionMenuList = motion(MenuList)

const seasonData = [
  { id: 'season3', label: 'Season 3 (Current)', icon: Trophy },
  { id: 'season2', label: 'Season 2', icon: Clock },
  { id: 'season1', label: 'Season 1', icon: Clock },
]

const tournamentData = [
  { id: 'tournament50', label: 'Tournament #050 (Current)', icon: Trophy },
  { id: 'tournament49', label: 'Tournament #049', icon: Clock },
  { id: 'tournament48', label: 'Tournament #048', icon: Clock },
  { id: 'tournament47', label: 'Tournament #047', icon: Clock },
]

const FilterButton = ({ isOpen, onClick, children, isActive }) => (
  <MenuButton
    as={MotionButton}
    px={6}
    py={3}
    position="relative"
    borderRadius="xl"
    bg="transparent"
    color={isActive ? 'white' : 'whiteAlpha.800'}
    _hover={{ color: 'white' }}
    _active={{ bg: 'transparent' }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    rightIcon={
      <Icon
        as={ChevronDown}
        transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
        transition="transform 0.2s"
      />
    }
  >
    {children}
    <Box
      position="absolute"
      inset={0}
      borderRadius="xl"
      bg={isActive ? 'whiteAlpha.200' : 'whiteAlpha.100'}
      backdropFilter="blur(8px)"
      zIndex={-1}
      transition="all 0.3s"
    />
  </MenuButton>
)

const LeaderboardFilter = ({ type = 'champions', onFilterChange }) => {
  const [selectedFilter, setSelectedFilter] = useState(
    type === 'champions' ? 'season3' : 'tournament50',
  )

  const handleSelect = filterId => {
    setSelectedFilter(filterId)
    onFilterChange?.(filterId)
  }

  const data = type === 'champions' ? seasonData : tournamentData

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      sx={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <Menu placement="bottom">
        {({ isOpen }) => (
          <>
            <FilterButton isOpen={isOpen} isActive={true}>
              <HStack spacing={2}>
                <Icon
                  as={
                    data.find(item => item.id === selectedFilter)?.icon ||
                    Trophy
                  }
                  size={16}
                />
                <Text>
                  {data.find(item => item.id === selectedFilter)?.label ||
                    'Select'}
                </Text>
              </HStack>
            </FilterButton>

            <AnimatePresence>
              {isOpen && (
                <MotionMenuList
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  bg="rgba(23, 25, 35, 0.98)"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  backdropFilter="blur(16px)"
                  boxShadow="lg"
                  py={2}
                  zIndex={100}
                >
                  {data.map(item => (
                    <MenuItem
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      bg="transparent"
                      _hover={{
                        bg: 'whiteAlpha.200',
                      }}
                      color="white"
                      px={4}
                      py={3}
                    >
                      <HStack spacing={3} align="center">
                        <Icon as={item.icon} size={16} />
                        <VStack spacing={0} align="start">
                          <Text fontSize="md">{item.label}</Text>
                          {item.id === selectedFilter && (
                            <Text fontSize="xs" color="pink.300">
                              Currently Selected
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                    </MenuItem>
                  ))}
                </MotionMenuList>
              )}
            </AnimatePresence>
          </>
        )}
      </Menu>
    </MotionBox>
  )
}

export default LeaderboardFilter
