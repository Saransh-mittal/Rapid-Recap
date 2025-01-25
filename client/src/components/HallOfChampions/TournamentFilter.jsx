import React, { useState, useEffect } from 'react'
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
  Skeleton,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Trophy, Medal } from 'lucide-react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)
const MotionMenuList = motion(MenuList)

const FilterButton = ({ isOpen, onClick, children, isActive, isLoading }) => (
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
    disabled={isLoading}
    rightIcon={
      <Icon
        as={ChevronDown}
        transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
        transition="transform 0.2s"
      />
    }
  >
    {isLoading ? <Skeleton height="24px" width="120px" /> : children}
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

const TournamentFilter = ({ onFilterChange }) => {
  const [tournaments, setTournaments] = useState([])
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tournament/completed-tournaments')
      const data = await response.json()
      if (data.status === 'success') {
        const transformedData = data.data.map(tournament => ({
          id: tournament.id,
          label: `Tournament #${tournament.tournamentNumber}`,
          tournamentNumber: tournament.tournamentNumber,
          icon:
            tournament.tournamentNumber === data.data[0].tournamentNumber
              ? Trophy
              : Medal,
        }))
        setTournaments(transformedData)

        if (transformedData.length > 0) {
          setSelectedTournament(transformedData[0])
          onFilterChange?.(transformedData[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = tournament => {
    setSelectedTournament(tournament)
    onFilterChange?.(tournament.id)
  }

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
            <FilterButton isOpen={isOpen} isActive={true} isLoading={isLoading}>
              {selectedTournament && (
                <HStack spacing={2}>
                  <Icon as={selectedTournament.icon} size={16} />
                  <Text>{selectedTournament.label}</Text>
                </HStack>
              )}
            </FilterButton>

            <AnimatePresence>
              {isOpen && !isLoading && (
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
                  maxH="300px"
                  overflowY="auto"
                >
                  {tournaments.map(tournament => (
                    <MenuItem
                      key={tournament.id}
                      onClick={() => handleSelect(tournament)}
                      bg="transparent"
                      _hover={{
                        bg: 'whiteAlpha.200',
                      }}
                      color="white"
                      px={4}
                      py={3}
                    >
                      <HStack spacing={3} align="center">
                        <Icon as={tournament.icon} size={16} />
                        <VStack spacing={0} align="start">
                          <Text fontSize="md">{tournament.label}</Text>
                          {tournament.id === selectedTournament?.id && (
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

export default TournamentFilter
