import React, { useState, useMemo } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  SimpleGrid,
  useToast,
  Box,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import TournamentBadge from '../../tournamentComponents/TournamentBadges'

const MotionBox = motion(Box)
const MotionSimpleGrid = motion(SimpleGrid)

const TournamentBadgeGallery = ({
  isOpen,
  onClose,
  userBadges,
  onBadgeSelect,
  userName,
  userInGameName,
  displayedBadge,
}) => {
  const [selectedBadgeGroup, setSelectedBadgeGroup] = useState(null)
  const [selectedBadge, setSelectedBadge] = useState(displayedBadge)
  const [savingError, setSavingError] = useState(null)
  const toast = useToast()

  const bg = useColorModeValue('gray.900', 'gray.900')
  const cardBg = useColorModeValue('gray.800', 'gray.800')

  // Group badges by badgeName
  const groupedBadges = useMemo(() => {
    const groups = {}
    userBadges.forEach(badge => {
      const key = badge.badgeName || 'Unnamed Badge'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(badge)
    })
    return groups
  }, [userBadges])

  const handleBadgeClick = (badgeName, badge) => {
    if (groupedBadges[badgeName].length > 1) {
      setSelectedBadgeGroup({
        name: badgeName,
        badges: groupedBadges[badgeName],
      })
    } else {
      handleSaveBadge(badge)
    }
  }

  const handleSaveBadge = async badge => {
    try {
      await onBadgeSelect(badge.tournamentNumber, badge.badgeName, badge.text)
      setSelectedBadge(badge)
      setSavingError(null)
    } catch (error) {
      setSavingError(badge.tournamentNumber)
      toast({
        title: 'Error',
        description: 'Failed to update displayed badge. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const BadgeItem = ({ badge, showCount = true }) => {
    const isSelected =
      selectedBadge?.badgeName === badge.badgeName &&
      selectedBadge?.tournamentNumber === badge.tournamentNumber
    const hasError = savingError === badge.badgeName
    const badgeGroup = groupedBadges[badge?.badgeName]

    const borderColor = isSelected
      ? 'green.500'
      : hasError
      ? 'red.500'
      : 'gray.700'
    const hoverBorderColor = isSelected
      ? 'green.400'
      : hasError
      ? 'red.400'
      : 'gray.600'
    const statusText = isSelected
      ? 'Selected'
      : hasError
      ? 'Error saving'
      : showCount && badgeGroup.length > 1
      ? 'Click to open'
      : 'Click to select'
    const statusColor = isSelected
      ? 'green.400'
      : hasError
      ? 'red.400'
      : 'gray.400'

    return (
      <MotionBox
        bg={cardBg}
        rounded="lg"
        p={6}
        cursor="pointer"
        onClick={() =>
          selectedBadgeGroup
            ? handleSaveBadge(badge)
            : handleBadgeClick(badge.badgeName, badge)
        }
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        position="relative"
        boxShadow="xl"
        border="1px solid"
        borderColor={borderColor}
        _hover={{ borderColor: hoverBorderColor }}
      >
        {showCount && badgeGroup.length > 1 && (
          <Text
            position="absolute"
            top={2}
            right={2}
            fontWeight="bold"
            fontSize="xl"
            color="gray.300"
          >
            {badgeGroup.length}
          </Text>
        )}
        <VStack spacing={4}>
          <TournamentBadge
            tournamentNumber={badge.tournamentNumber}
            name={userName}
            inGameName={userInGameName}
            participantCnt={badge.participantCnt}
            size="lg"
            badgeName={{
              name: badge?.badgeName,
              text: badge?.text,
            }}
          />

          <Text color={statusColor} fontStyle="italic">
            {statusText}
          </Text>
        </VStack>
      </MotionBox>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg={bg} color="white">
        <ModalHeader>Badge Gallery</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box minH="100vh" p={8}>
            <AnimatePresence mode="wait">
              {selectedBadgeGroup ? (
                <MotionBox
                  key="selected-badge-group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button
                    leftIcon={<ChevronLeft />}
                    variant="ghost"
                    mb={6}
                    onClick={() => {
                      setSelectedBadgeGroup(null)
                      setSelectedBadge(null)
                    }}
                    color={'white'}
                    _hover={{ bg: 'gray.700' }}
                  >
                    Back to All Badges
                  </Button>
                  <Heading size="2xl" mb={8} textAlign="center">
                    {selectedBadgeGroup.name}
                  </Heading>
                  <MotionSimpleGrid
                    columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                    spacing={8}
                  >
                    {selectedBadgeGroup.badges.map((badge, index) => (
                      <MotionBox
                        key={badge.tournamentNumber}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <BadgeItem badge={badge} showCount={false} />
                      </MotionBox>
                    ))}
                  </MotionSimpleGrid>
                </MotionBox>
              ) : (
                <MotionBox
                  key="all-badges"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Heading size="2xl" textAlign="center" mb={8}>
                    Badge Collection
                  </Heading>
                  <MotionSimpleGrid
                    columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                    spacing={8}
                  >
                    {Object.entries(groupedBadges).map(
                      ([badgeName, badges], index) => (
                        <MotionBox
                          key={badgeName}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <BadgeItem badgeName={badgeName} badge={badges[0]} />
                        </MotionBox>
                      ),
                    )}
                  </MotionSimpleGrid>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TournamentBadgeGallery
