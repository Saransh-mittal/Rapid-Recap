import React, { useEffect, useCallback, useMemo, Suspense, lazy } from 'react'
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Text,
  Button,
  Box,
  Flex,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useFeatureDetection } from '../../../../utils/featureDetection'
import useSafeSound from '../../../../customHooks/useSafeSound'
import { getStreakColor } from '../StreakIcon'

const StreakSVG = lazy(() => import('../StreakSVG'))

const DailyStreakModal = ({ setShowDailyStreakModal }) => {
  const { t } = useTranslation('DailyStreakModal')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const { streak, longestStreak, isBoosted } = useSelector(state => state.app)

  useEffect(() => {
    onOpen()
  }, [onOpen])

  const streakMessage = useMemo(() => {
    if (streak === 0 && longestStreak === 0) {
      return {
        title: t('embark_on_journey'),
        message: t('first_step_greatness'),
      }
    } else if (streak === 0 && longestStreak > 0) {
      return {
        title: t('rekindle_flame'),
        message: t('rise_again'),
      }
    } else if (
      streak > 0 &&
      streak >= 4 &&
      streak % 7 < 5 &&
      streak % 7 !== 0 &&
      longestStreak === streak
    ) {
      return {
        title: t('forging_legacy'),
        message: t('each_day_triumph'),
      }
    } else if (
      streak > 0 &&
      streak % 7 < 5 &&
      streak % 7 !== 0 &&
      longestStreak > streak
    ) {
      return {
        title: t('ascending_heights'),
        message: t('destiny_awaits'),
      }
    } else if (streak > 0 && streak % 7 >= 5) {
      return {
        title: t('pinnacle_achievement'),
        message: t('legacy_unfolds'),
      }
    } else if (isBoosted) {
      return {
        title: t('celestial_favor'),
        message: t('transcend_limits'),
      }
    } else {
      return {
        title: t('unwavering_dedication'),
        message: t('forge_ahead'),
      }
    }
  }, [streak, longestStreak, isBoosted, t])

  const handleClose = useCallback(() => {
    playClick()
    onClose()
    setShowDailyStreakModal(false)
  }, [playClick, onClose, setShowDailyStreakModal])

  return (
    <Suspense fallback={<Box>Loading...</Box>}>
      <AnimatePresence>
        {isOpen && (
          <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalContent
              as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              bg="rgba(18, 18, 18, 0.95)"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="rgba(138, 43, 226, 0.3)"
              boxShadow="0 0 20px rgba(138, 43, 226, 0.2)"
              overflow="hidden"
              maxWidth={{ base: '95vw', md: '90vw', lg: '80vw', xl: '70vw' }}
              p={4}
            >
              <ModalCloseButton color="gray.400" size="sm" />
              <ModalBody py={6}>
                <VStack spacing={4} align="center">
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color="rgba(191, 163, 255, 0.9)"
                    textAlign="center"
                    letterSpacing="wide"
                  >
                    {t('streak_odyssey')}
                  </Text>

                  <Box
                    as={motion.div}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      damping: 10,
                      stiffness: 100,
                      delay: 0.2,
                    }}
                  >
                    <Suspense fallback={<Box>Loading SVG...</Box>}>
                      <StreakSVG
                        streak={streak}
                        isBoosted={isBoosted}
                        getBackgroundColor={getStreakColor}
                        size="80px"
                      />
                    </Suspense>
                  </Box>

                  <VStack spacing={1}>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="white"
                      textAlign="center"
                    >
                      {streakMessage.title}
                    </Text>
                    <Text
                      fontSize="md"
                      color="gray.300"
                      textAlign="center"
                      fontStyle="italic"
                    >
                      "{streakMessage.message}"
                    </Text>
                  </VStack>

                  <Flex justify="space-between" width="100%" mt={4}>
                    <VStack spacing={0}>
                      <Text color="gray.400" fontSize="xs">
                        {t('current_streak')}
                      </Text>
                      <Text
                        color="rgba(191, 163, 255, 0.9)"
                        fontSize="4xl"
                        fontWeight="bold"
                        lineHeight="1"
                      >
                        {streak}
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        {t('days')}
                      </Text>
                    </VStack>
                    <VStack spacing={0}>
                      <Text color="gray.400" fontSize="xs">
                        {t('longest_streak')}
                      </Text>
                      <Text
                        color="rgba(255, 215, 0, 0.9)"
                        fontSize="4xl"
                        fontWeight="bold"
                        lineHeight="1"
                      >
                        {longestStreak}
                      </Text>
                      <Text color="gray.400" fontSize="xs">
                        {t('days')}
                      </Text>
                    </VStack>
                  </Flex>
                </VStack>

                <Flex justify="center" mt={6}>
                  <Button
                    onClick={handleClose}
                    bg="rgba(138, 43, 226, 0.8)"
                    color="white"
                    _hover={{ bg: 'rgba(138, 43, 226, 0.9)' }}
                    _active={{ bg: 'rgba(138, 43, 226, 1)' }}
                    size="md"
                    fontWeight="bold"
                    px={6}
                    py={2}
                    borderRadius="full"
                    boxShadow="0 0 10px rgba(138, 43, 226, 0.3)"
                    transition="all 0.3s ease"
                  >
                    {t('continue_journey')}
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Suspense>
  )
}

export default DailyStreakModal
