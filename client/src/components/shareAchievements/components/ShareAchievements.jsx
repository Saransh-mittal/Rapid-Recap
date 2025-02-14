// src/components/shareAchievements/components/ShareAchievements.jsx

import React, { useState, useRef, useEffect } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Box,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Icon,
  Text,
  Spinner,
  VStack,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react'
import { Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import axios from 'axios'
import AchievementCard from './AchievementCard'
import { ACHIEVEMENT_TYPES } from '../constants/achievementTypes'

const ShareAchievements = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState(
    ACHIEVEMENT_TYPES.PROGRESS_STATS.id,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [achievements, setAchievements] = useState(null)
  const toast = useToast()
  const achievementCardRef = useRef(null)
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get('/api/user/achievements')
        setAchievements(response.data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load achievements',
          status: 'error',
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchAchievements()
    }
  }, [isOpen, toast])

  const getStatsForType = type => {
    if (!achievements) return []

    switch (type) {
      case ACHIEVEMENT_TYPES.PROGRESS_STATS.id:
        return [
          {
            label: 'Level',
            value: achievements.progressStats.level,
            color: 'orange.300',
          },
          {
            label: 'Total XP',
            value: achievements.progressStats.totalXP,
            color: 'yellow.300',
          },
          {
            label: 'Quizzes Solved',
            value: achievements.progressStats.quizzesSolved,
            color: 'green.300',
          },
          {
            label: 'Global Rank',
            value: `#${achievements.progressStats.globalRank}`,
            color: 'blue.300',
          },
          {
            label: 'IQ Score',
            value: achievements.progressStats.IQScore,
            color: 'cyan.300',
          },
          {
            label: 'Average RQM',
            value: achievements.progressStats.averageRQM.toFixed(2),
            color: 'pink.300',
          },
        ]

      case ACHIEVEMENT_TYPES.TOURNAMENT_MASTERY.id:
        return [
          {
            label: 'ACE Badges',
            value: achievements.tournamentStats.aceBadges,
            color: '#FFD700',
          },
          {
            label: 'PRO Badges',
            value: achievements.tournamentStats.proBadges,
            color: '#C0C0C0',
          },
          {
            label: 'CHAMP Badges',
            value: achievements.tournamentStats.champBadges,
            color: '#CD7F32',
          },
          {
            label: 'Tournament Wins',
            value: achievements.tournamentStats.tournamentWins,
            color: 'purple.300',
          },
          {
            label: 'Top 3 Finishes',
            value: achievements.tournamentStats.top3Finishes,
            color: 'cyan.300',
          },
        ]

      case ACHIEVEMENT_TYPES.STREAK_WARRIOR.id:
        return [
          {
            label: 'Current Streak',
            value: achievements.streakStats.currentStreak,
            color: 'orange.300',
          },
          {
            label: 'Longest Streak',
            value: achievements.streakStats.longestStreak,
            color: 'yellow.300',
          },
          {
            label: 'Days Active',
            value: achievements.streakStats.totalDaysActive,
            color: 'green.300',
          },
          {
            label: 'Perfect Quiz Days',
            value: achievements.streakStats.perfectQuizDays,
            color: 'purple.300',
          },
        ]

      case ACHIEVEMENT_TYPES.CATEGORY_EXPERTISE.id:
        return [
          {
            label: 'Easy Mastery',
            value: achievements.categoryStats.easyMastery,
            color: 'green.300',
          },
          {
            label: 'Medium Mastery',
            value: achievements.categoryStats.mediumMastery,
            color: 'yellow.300',
          },
          {
            label: 'Hard Mastery',
            value: achievements.categoryStats.hardMastery,
            color: 'red.300',
          },
          ...achievements.categoryStats.preferredCategories.map((cat, idx) => ({
            label: `Top Category ${idx + 1}`,
            value: cat.category,
            color: 'purple.300',
          })),
        ]

      default:
        return []
    }
  }

  const handleShare = async () => {
    try {
      setIsGenerating(true)
      await new Promise(resolve => requestAnimationFrame(resolve))
      await document.fonts.ready

      if (!achievementCardRef.current) {
        throw new Error('Achievement card element not found')
      }

      const canvas = await html2canvas(achievementCardRef.current, {
        backgroundColor: '#1a1527',
        scale: 2,
        useCORS: true,
        logging: true,
        width: achievementCardRef.current.offsetWidth,
        height: achievementCardRef.current.offsetHeight,
      })

      const imageBlob = await (
        await fetch(canvas.toDataURL('image/png', 1.0))
      ).blob()
      const imageFile = new File([imageBlob], 'rapid-recap-achievements.png', {
        type: 'image/png',
      })

      if (navigator.share && navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          files: [imageFile],
        })
      } else {
        const link = document.createElement('a')
        link.download = 'rapid-recap-achievements.png'
        link.href = URL.createObjectURL(imageBlob)
        link.click()
      }

      toast({
        title: 'Success!',
        description: 'Your achievements are ready to share!',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Share error:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate achievements image',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const TypeSelector = ({ type, isSelected, onClick }) => (
    <Button
      leftIcon={<type.icon size={20} />}
      variant={isSelected ? 'solid' : 'ghost'}
      colorScheme="purple"
      size="lg"
      width="full"
      onClick={onClick}
      display="flex"
      justifyContent="flex-start"
      py={6}
      borderRadius="xl"
      bg={isSelected ? 'rgba(128, 90, 213, 0.2)' : 'transparent'}
      _hover={{
        bg: isSelected ? 'rgba(128, 90, 213, 0.2)' : 'rgba(128, 90, 213, 0.1)',
      }}
    >
      {type.title}
    </Button>
  )

  return (
    <>
      {/* <Button
        leftIcon={<Share2 />}
        onClick={onOpen}
        colorScheme="purple"
        variant="ghost"
        size="sm"
        _hover={{ bg: 'rgba(128, 90, 213, 0.12)' }}
      >
        Share Achievements
      </Button> */}
      <Box onClick={onOpen} cursor="pointer">
        <Share2 boxSize={6} color={'white'} />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalContent
          bg="#1a1527"
          color="white"
          position="relative"
          minH="100vh"
        >
          <ModalHeader
            borderBottom="1px solid rgba(255,255,255,0.1)"
            textAlign="center"
            fontSize="2xl"
          >
            Share Your Achievements
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={0} w={'100%'}>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              h="full"
              gap={4}
              p={4}
            >
              {/* Type Selector Sidebar */}
              <VStack
                spacing={2}
                align="stretch"
                w={{ base: 'full', md: '300px' }}
                borderRight={{
                  base: 'none',
                  md: '1px solid rgba(255,255,255,0.1)',
                }}
                pr={{ base: 0, md: 4 }}
              >
                {Object.values(ACHIEVEMENT_TYPES).map(type => (
                  <TypeSelector
                    key={type.id}
                    type={type}
                    isSelected={selectedType === type.id}
                    onClick={() => setSelectedType(type.id)}
                  />
                ))}
              </VStack>

              {/* Achievement Card Display */}
              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={4}
              >
                <Box ref={achievementCardRef} w={'100%'} p={0} align="center">
                  <Box maxW="md" w="100%" p={2}>
                    <AchievementCard
                      stats={getStatsForType(selectedType)}
                      type={ACHIEVEMENT_TYPES[selectedType]?.title}
                    />
                  </Box>
                </Box>

                <Button
                  colorScheme="purple"
                  onClick={handleShare}
                  isLoading={isGenerating}
                  loadingText="Generating..."
                  size="lg"
                  mt={6}
                  w={{ base: 'full', md: 'auto' }}
                  maxW="sm"
                >
                  Share Achievement
                </Button>
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ShareAchievements
