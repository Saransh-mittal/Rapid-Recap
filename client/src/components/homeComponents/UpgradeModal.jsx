import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { setUser } from '../../redux/authSlice'
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
  useBreakpointValue,
} from '@chakra-ui/react'
import { Star } from 'lucide-react'
import { findSocietyAndCircle } from '../../utils/helper.utils'
import useSafeSound from '../../customHooks/useSafeSound'
import { useFeatureDetection } from '../../utils/featureDetection'

const UpgradeModal = ({ isOpen, onClose }) => {
  // const [glowAnimation, setGlowAnimation] = useState(false)
  const { t } = useTranslation('UpgradeModal')
  const { t: tBrains } = useTranslation('Brains')
  const { t: tCircles } = useTranslation('Circles')
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const size = useBreakpointValue({
    base: '100',
    md: '200',
  })

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

  const createStar = (orbitRadius, duration, delay) => (
    <motion.div
      style={{
        position: 'absolute',
        top: '0%',
        left: '50%',
        width: orbitRadius * 2,
        height: orbitRadius * 2,
        borderRadius: '50%',
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
        delay,
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 0,
          height: 0,
        }}
      >
        <Star size={64} color="#9f7aea" opacity={0.6} />
      </motion.div>
    </motion.div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: '2xl' }}>
      <ModalOverlay backdropFilter={'blur(5px)'} />
      <ModalContent
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={'transparent'}
      >
        <ModalBody
          py={0}
          bg="linear-gradient(135deg, rgba(96, 18, 169, 0.9) 0%, rgba(35, 2, 59, 0.9) 100%)"
          borderRadius={'2xl'}
          boxShadow="0 0 40px rgba(138, 43, 226, 0.3)"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              borderRadius="2xl"
              overflow="hidden"
              position="relative"
              width="100%"
              height="100%"
              maxWidth="600px"
            >
              {/* Revolving stars */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="100%"
                height="100%"
                zIndex={0}
              >
                {createStar(200, 20, 0)}
              </Box>

              <Box p={8} textAlign="center" position="relative" zIndex={1}>
                <Text
                  fontSize={{ base: '2xl', md: '4xl' }}
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
                    {isCircleUpgraded ? (
                      <>
                        <Flex
                          position="relative"
                          textAlign="center"
                          alignItems={'center'}
                          justifyContent={'center'}
                          w={'100%'}
                        >
                          <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <svg
                              width={size}
                              height={size}
                              viewBox="0 0 120 120"
                            >
                              <defs>
                                <linearGradient
                                  id="circleGradient"
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor={prevSocietyOrCircle?.textColor}
                                    stopOpacity="0.2"
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor={prevSocietyOrCircle?.textColor}
                                    stopOpacity="0.8"
                                  />
                                </linearGradient>
                              </defs>
                              <motion.circle
                                cx="60"
                                cy="60"
                                r="55"
                                fill="transparent"
                                stroke="url(#circleGradient)"
                                strokeWidth="3"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: 'reverse',
                                }}
                              />
                              <text
                                x="60"
                                y="40"
                                textAnchor="middle"
                                fill={prevSocietyOrCircle?.textColor}
                                fontSize="14"
                                fontWeight="bold"
                              >
                                {prevSocietyOrCircle?.circle}
                              </text>
                              <text
                                x="60"
                                y="60"
                                textAnchor="middle"
                                fill={prevSocietyOrCircle?.textColor}
                                fontSize="12"
                              >
                                {t('Circle')}
                              </text>
                              <text
                                x="60"
                                y="80"
                                textAnchor="middle"
                                fill="#9CAFAA"
                                fontSize="9"
                              >
                                {t('iqRange')} {prevSocietyOrCircle?.IQ_Lower} -{' '}
                                {prevSocietyOrCircle?.IQ_Upper || 'Above'}
                              </text>
                            </svg>
                          </motion.div>
                        </Flex>
                      </>
                    ) : (
                      <Image
                        src={prevSocietyOrCircle?.image}
                        alt="Previous Level"
                        boxSize="100px"
                        mb={2}
                      />
                    )}

                    <Text
                      fontWeight="bold"
                      color={prevSocietyOrCircle?.textColor}
                    >
                      {!isCircleUpgraded &&
                        tBrains(`${prevSocietyOrCircle?.society}.society`)}
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
                      {isCircleUpgraded ? (
                        <>
                          <Flex
                            position="relative"
                            textAlign="center"
                            alignItems={'center'}
                            justifyContent={'center'}
                            w={'100%'}
                          >
                            <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5 }}
                            >
                              <svg
                                width={size}
                                height={size}
                                viewBox="0 0 120 120"
                              >
                                <defs>
                                  <linearGradient
                                    id="circleGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor={
                                        upgradedSocietyOrCircle?.textColor
                                      }
                                      stopOpacity="0.2"
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor={
                                        upgradedSocietyOrCircle?.textColor
                                      }
                                      stopOpacity="0.8"
                                    />
                                  </linearGradient>
                                </defs>
                                <motion.circle
                                  cx="60"
                                  cy="60"
                                  r="55"
                                  fill="transparent"
                                  stroke="url(#circleGradient)"
                                  strokeWidth="3"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                  }}
                                />
                                <text
                                  x="60"
                                  y="40"
                                  textAnchor="middle"
                                  fill={upgradedSocietyOrCircle?.textColor}
                                  fontSize="14"
                                  fontWeight="bold"
                                >
                                  {upgradedSocietyOrCircle?.circle}
                                </text>
                                <text
                                  x="60"
                                  y="60"
                                  textAnchor="middle"
                                  fill={upgradedSocietyOrCircle?.textColor}
                                  fontSize="12"
                                >
                                  {t('Circle')}
                                </text>
                                <text
                                  x="60"
                                  y="80"
                                  textAnchor="middle"
                                  fill="#9CAFAA"
                                  fontSize="9"
                                >
                                  {t('iqRange')}{' '}
                                  {upgradedSocietyOrCircle?.IQ_Lower} -{' '}
                                  {upgradedSocietyOrCircle?.IQ_Upper || 'Above'}
                                </text>
                              </svg>
                            </motion.div>
                          </Flex>
                        </>
                      ) : (
                        <Image
                          src={upgradedSocietyOrCircle?.image}
                          alt="Previous Level"
                          boxSize="100px"
                          mb={2}
                        />
                      )}
                    </motion.div>
                    <Text
                      fontWeight="bold"
                      color={upgradedSocietyOrCircle?.textColor}
                    >
                      {!isCircleUpgraded &&
                        tBrains(`${upgradedSocietyOrCircle?.society}.society`)}
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
