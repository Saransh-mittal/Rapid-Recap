import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../redux/authSlice'
import useSound from '../../customHooks/useSound'
import axios from 'axios'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Button,
  Flex,
  Image,
  Text,
  Box,
} from '@chakra-ui/react'
import { Star } from 'lucide-react'
import { findSocietyAndCircle } from '../../utils/helper.utils'

const UpgradeModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('UpgradeModal')
  const { t: tBrains } = useTranslation('Brains')
  const { t: tCircles } = useTranslation('Circles')
  const { playClick } = useSound()
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const upgradedSocietyOrCircle = findSocietyAndCircle(user?.IQ_score)
  const prevSocietyOrCircle = findSocietyAndCircle(user?.prevIQScore)
  const isCircleUpgraded =
    upgradedSocietyOrCircle?.society === prevSocietyOrCircle?.society

  const handleUpgradeMessageClose = async () => {
    playClick()
    try {
      await axios.put('/api/user/upgradeMessageClose')
      dispatch(setUser({ ...user, societyUpgradeMessage: '' }))
      onClose()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '2xl' }}>
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent
        bg="transparent"
        boxShadow="none"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <ModalBody p={0}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              bg="rgba(30, 30, 40, 0.9)"
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0 0 40px rgba(138, 43, 226, 0.3)"
              position="relative"
            >
              <Box
                bg="linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(75, 0, 130, 0.2) 100%)"
                p={8}
                textAlign="center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Star
                    size={64}
                    color="#9f7aea"
                    style={{ marginBottom: '1rem' }}
                  />
                </motion.div>
                <Text
                  fontSize="4xl"
                  fontWeight="bold"
                  mb={4}
                  bgGradient="linear(to-r, purple.300, pink.200)"
                  bgClip="text"
                >
                  {t('congratulations', { userName: user?.name })}
                </Text>
                <Text fontSize="xl" mb={6} color="gray.300">
                  {isCircleUpgraded ? t('circleUpgrade') : t('societyUpgrade')}
                </Text>
                <Flex justify="center" align="center" mb={6}>
                  <Box textAlign="center" mr={8}>
                    <Image
                      src={prevSocietyOrCircle?.image}
                      alt="Previous Level"
                      boxSize="100px"
                      mb={2}
                    />
                    <Text
                      fontWeight="bold"
                      color={prevSocietyOrCircle?.textColor}
                    >
                      {isCircleUpgraded
                        ? tCircles(`${prevSocietyOrCircle?.circle}.title`)
                        : tBrains(`${prevSocietyOrCircle?.society}.society`)}
                    </Text>
                  </Box>
                  <Box
                    fontSize="3xl"
                    fontWeight="bold"
                    mx={4}
                    color="purple.300"
                  >
                    →
                  </Box>
                  <Box textAlign="center" ml={8}>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Image
                        src={upgradedSocietyOrCircle?.image}
                        alt="New Level"
                        boxSize="100px"
                        mb={2}
                      />
                    </motion.div>
                    <Text
                      fontWeight="bold"
                      color={upgradedSocietyOrCircle?.textColor}
                    >
                      {isCircleUpgraded
                        ? tCircles(`${upgradedSocietyOrCircle?.circle}.title`)
                        : tBrains(
                            `${upgradedSocietyOrCircle?.society}.society`,
                          )}
                    </Text>
                  </Box>
                </Flex>
                <Text fontSize="lg" mb={6} color="gray.300">
                  {t('upgradeMessage', {
                    upgradeMessage: user?.societyUpgradeMessage,
                  })}
                </Text>
                <Button
                  onClick={handleUpgradeMessageClose}
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  color="white"
                  _hover={{
                    bgGradient: 'linear(to-r, purple.600, pink.600)',
                  }}
                  size="lg"
                  fontWeight="bold"
                  px={8}
                  py={4}
                >
                  {t('continueJourney')}
                </Button>
              </Box>
            </Box>
          </motion.div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default UpgradeModal
