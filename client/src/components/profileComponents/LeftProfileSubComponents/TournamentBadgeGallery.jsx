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
  Flex,
  Spinner,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import TournamentBadge from '../../tournamentComponents/TournamentBadges'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('TournamentBadgeGallery')
  const { t: TournamentBadgeTranslate } = useTranslation('TournamentBadges')
  const [selectedBadgeGroup, setSelectedBadgeGroup] = useState(null)
  const [selectedBadge, setSelectedBadge] = useState(displayedBadge)
  const [savingError, setSavingError] = useState(null)
  const [clickedBadgeId, setClickedBadgeId] = useState(null)
  const toast = useToast()

  const bg = useColorModeValue('gray.900', 'gray.900')
  const cardBg = useColorModeValue('gray.800', 'gray.800')

  const groupedBadges = useMemo(() => {
    const groups = {}
    userBadges?.forEach(badge => {
      const key = badge.badgeName || t('unnamedBadge')
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(badge)
    })
    return groups
  }, [userBadges, t])

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
    const uniqueBadgeId = `${badge.tournamentNumber}-${badge.badgeName}-${badge.text}`
    setClickedBadgeId(uniqueBadgeId)

    try {
      await onBadgeSelect(badge.tournamentNumber, badge.badgeName, badge.text)
      setSelectedBadge(badge)
      setSavingError(null)
    } catch (error) {
      setSavingError(badge.tournamentNumber)
      toast({
        title: t('errorTitle'),
        description: t('errorMessage'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
    setClickedBadgeId(null)
  }

  const BadgeItem = ({ badge, showCount = true }) => {
    const isSelected =
      selectedBadge?.badgeName === badge.badgeName &&
      selectedBadge?.tournamentNumber === badge.tournamentNumber &&
      badge.text === selectedBadge.text
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
      ? t('selected')
      : hasError
      ? t('errorSaving')
      : showCount && badgeGroup.length > 1
      ? t('clickToOpen')
      : t('clickToSelect')
    const statusColor = isSelected
      ? 'green.400'
      : hasError
      ? 'red.400'
      : 'gray.400'

    const uniqueBadgeId = `${badge.tournamentNumber}-${badge.badgeName}-${badge.text}`
    const isLoading =
      clickedBadgeId === uniqueBadgeId && statusText === t('clickToSelect')

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
        {isLoading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="rgba(0, 0, 0, 0.6)"
            zIndex="1"
            borderRadius="lg"
          >
            <Spinner size="xl" color="white" />
          </Box>
        )}

        <Flex justifyContent={'center'} alignItems={'center'}>
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
          <VStack spacing={4} h={'7rem'}>
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
              isBadgeGallery={true}
              t={TournamentBadgeTranslate}
            />
          </VStack>
        </Flex>
        <Flex w={'100%'} justifyContent={'center'} mb={0}>
          <Text color={statusColor} fontStyle="italic" textAlign={'center'}>
            {statusText}
          </Text>
        </Flex>
      </MotionBox>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg={bg} color="white">
        <ModalHeader>
          <Heading size="2xl" textAlign="center" mb={8}>
            {t('badgeGallery')}
          </Heading>
        </ModalHeader>
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
                    {t('backToAllBadges')}
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
                        key={
                          badge.tournamentNumber + badge.badgeName + badge.text
                        }
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
                          <BadgeItem badge={badges[0]} />
                        </MotionBox>
                      ),
                    )}
                  </MotionSimpleGrid>
                </MotionBox>
              )}
            </AnimatePresence>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default TournamentBadgeGallery
