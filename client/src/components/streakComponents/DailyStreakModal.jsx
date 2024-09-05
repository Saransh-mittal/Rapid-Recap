import React, { useEffect, useCallback, useMemo, Suspense, lazy } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import useSound from '../../customHooks/useSound'
import { useTranslation } from 'react-i18next'

// Lazy load heavy SVG and utility components
const StreakSVG = lazy(() => import('./StreakSVG'))

const DailyStreakModal = ({ setShowDailyStreakModal, getBackgroundColor }) => {
  const { t } = useTranslation('DailyStreakModal')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { playClick } = useSound()
  const { streak, longestStreak, isBoosted } = useSelector(state => state.app)

  useEffect(() => {
    onOpen()
  }, [onOpen])

  // Memoize the conditions to avoid recalculating on every render
  const streakMessage = useMemo(() => {
    if (streak === 0 && longestStreak === 0) {
      return (
        <>
          <Text
            color="#d1c9e6"
            fontSize="20px"
            textAlign="center"
            fontWeight="medium"
            mb={4}
          >
            {t('welcome_message')}
          </Text>
          <Text
            color="white"
            fontSize="16px"
            textAlign="center"
            lineHeight="1.5"
          >
            {t('starting_streak')}
          </Text>
        </>
      )
    } else if (streak === 0 && longestStreak > 0) {
      return (
        <Text
          color="white"
          fontSize="20px"
          textAlign="center"
          fontWeight="medium"
          mb={4}
        >
          {t('get_back_on_track')}
        </Text>
      )
    } else if (
      streak > 0 &&
      streak >= 4 &&
      streak % 7 < 5 &&
      streak % 7 !== 0 &&
      longestStreak === streak
    ) {
      return (
        <Text
          color="white"
          fontSize="20px"
          textAlign="center"
          fontWeight="medium"
          mb={4}
        >
          {t('maintaining_streak')}
        </Text>
      )
    } else if (
      streak > 0 &&
      streak % 7 < 5 &&
      streak % 7 !== 0 &&
      longestStreak > streak
    ) {
      return (
        <Text
          color="white"
          fontSize="20px"
          textAlign="center"
          fontWeight="medium"
          mb={4}
        >
          {t('closer_to_longest_streak')}
        </Text>
      )
    } else if (streak > 0 && streak % 7 >= 5) {
      return (
        <Text
          color="white"
          fontSize="20px"
          textAlign="center"
          fontWeight="medium"
          mb={4}
        >
          {t('milestone')}
        </Text>
      )
    } else if (isBoosted) {
      return (
        <Text
          color="white"
          fontSize="20px"
          textAlign="center"
          fontWeight="medium"
          mb={4}
        >
          {t('special_reward')}
        </Text>
      )
    } else {
      return null
    }
  }, [streak, longestStreak, isBoosted, t])

  const handleClose = useCallback(() => {
    playClick()
    onClose()
    setShowDailyStreakModal(false)
  }, [playClick, onClose, setShowDailyStreakModal])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Modal isOpen={isOpen} onClose={handleClose} size={'4xl'}>
              <ModalOverlay />
              <ModalContent
                initial={{ y: '-100vh' }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 150 }}
                background="linear-gradient(135deg, #1a1527 0%, #0e0c16 100%)"
                borderRadius="10px"
                boxShadow="0 4px 20px rgba(0, 0, 0, 0.3)"
              >
                <ModalHeader
                  as="h3"
                  size="lg"
                  color="#a595c9"
                  textAlign="center"
                  fontWeight="bold"
                  borderBottom="1px solid rgba(255,255,255,0.1)"
                  pb={2}
                  mb={4}
                >
                  {t('streak_insights')}
                </ModalHeader>
                <ModalCloseButton color="#a595c9" />
                <ModalBody
                  pb={4}
                  display={'flex'}
                  gap={4}
                  flexDirection={'column'}
                  p={1}
                >
                  {streakMessage}

                  {longestStreak > 0 && (
                    <>
                      <Text
                        color="white"
                        fontSize="20px"
                        textAlign="center"
                        fontWeight="medium"
                        mb={4}
                      >
                        {t('maintained_streak')}{' '}
                        <Text
                          as="span"
                          color="#8b7daf"
                          backgroundColor="rgba(255,255,255,0.1)"
                          borderRadius="md"
                          px={2}
                          fontWeight="semibold"
                          textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                        >
                          {streak} {t('days')}{' '}
                          <Suspense fallback={<div>Loading SVG...</div>}>
                            <StreakSVG
                              streak={streak}
                              isBoosted={isBoosted}
                              getBackgroundColor={getBackgroundColor}
                            />
                          </Suspense>
                        </Text>{' '}
                        {t('keep_it_up')}
                      </Text>
                      <Text
                        color="white"
                        fontSize="24px"
                        textAlign="center"
                        fontWeight="medium"
                        mb={6}
                      >
                        {t('longest_streak_is')}{' '}
                        <Text
                          as="span"
                          color="green.300"
                          backgroundColor="rgba(255,255,255,0.1)"
                          borderRadius="md"
                          px={2}
                          fontWeight="semibold"
                          textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                        >
                          {longestStreak} {t('days')}{' '}
                          <Suspense fallback={<div>Loading SVG...</div>}>
                            <StreakSVG
                              streak={longestStreak}
                              isBoosted={isBoosted}
                              getBackgroundColor={getBackgroundColor}
                            />
                          </Suspense>
                        </Text>
                      </Text>
                    </>
                  )}
                </ModalBody>
                <ModalFooter justifyContent="center">
                  <Button
                    bg="#4a3b78"
                    color="#d1c9e6"
                    _hover={{ bg: '#5d4b96' }}
                    onClick={handleClose}
                  >
                    {t('close')}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </motion.div>
        )}
      </AnimatePresence>
    </Suspense>
  )
}

export default DailyStreakModal
