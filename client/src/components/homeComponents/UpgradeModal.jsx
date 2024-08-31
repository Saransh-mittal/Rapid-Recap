import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Flex,
  Image,
  Text,
  Box,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import CircleAndSocietyData from '../../assets/CircleAndSocietyData'
import { motion } from 'framer-motion'
import Lightning from '../profileComponents/RankAndSocietySubCompnents/Lightning'
import CircleLightning from './CircleLighting/CircleLighting'
import axios from 'axios'
import './BlinkingButton.css'
import Arrow from '/images/arrow.webp'
import Circle from '/images/circle.webp'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../../redux/authSlice'
import useSound from '../../customHooks/useSound'

const UpgradeModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation('UpgradeModal')
  const { playClick } = useSound()
  const { user } = useSelector(state => state.auth)
  const dispatchRedux = useDispatch()

  const USER_IQ = user.IQ_score

  const findSocietyAndCircle = USER_IQ => {
    let SocietyOrCircle = null
    CircleAndSocietyData.forEach(entry => {
      if (
        USER_IQ >= entry.IQ_Lower &&
        (entry.IQ_Upper === null || USER_IQ < entry.IQ_Upper)
      ) {
        SocietyOrCircle = entry
      }
    })
    return SocietyOrCircle
  }

  const upgradedSocietyOrCircle = findSocietyAndCircle(USER_IQ)
  const prevSocietyOrCircle = findSocietyAndCircle(user.prevIQScore)

  const isCircleUpdgraded =
    upgradedSocietyOrCircle.society === prevSocietyOrCircle.society

  const handleUpgradeMessageClose = async () => {
    playClick()
    try {
      await axios.put('/api/user/upgradeMessageClose')
      dispatchRedux(setUser({ ...user, societyUpgradeMessage: '' }))
      onClose()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'xl' }}>
      <ModalOverlay />
      <ModalContent
        backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
        color="white"
      >
        <Box textAlign="center">
          <ModalHeader fontSize="3xl" fontWeight="bold">
            <span
              style={{
                background: '-webkit-linear-gradient(45deg, #ff9a9e, #fecfef)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 0px 8px rgba(255, 255, 255, 0.8)',
              }}
            >
              {t('congratulations', { userName: user.name })}
            </span>
          </ModalHeader>
        </Box>
        <ModalBody overflow="hidden">
          {!isCircleUpdgraded ? (
            <>
              <Flex align="center" justify="center" mt={4}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="purple.600"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  fontStyle="italic"
                  fontFamily="sans-serif"
                >
                  {t('societyUpgrade')}
                </Text>
              </Flex>
              <Flex align="center" justify="center" mt={4}>
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  w="100%"
                  position="relative"
                  flexDirection="row"
                >
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    w="100%"
                    position="relative"
                    flexDirection="column"
                    mt={1.5}
                  >
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      w="100%"
                      position="relative"
                      flexDirection="column"
                      mb={3}
                    >
                      <Image
                        src={prevSocietyOrCircle.image}
                        alt="Brain"
                        style={{
                          width: '80px',
                          height: '80px',
                          background: 'transparent',
                        }}
                      />
                    </Flex>
                    <Text
                      textAlign="center"
                      fontSize="md"
                      fontWeight="bold"
                      color={prevSocietyOrCircle.textColor}
                      textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                      paddingLeft={{ base: '5.5%', md: '9.5%', xl: '0.5%' }}
                    >
                      {t('society', {
                        society: prevSocietyOrCircle?.society?.split(' ')[0],
                      })}
                    </Text>
                  </Flex>
                  <Flex
                    w={'100%'}
                    mt={'-5rem'}
                    justifyContent={'center'}
                    alignItems={'center'}
                  >
                    <Image
                      src={Arrow}
                      alt="Arrow"
                      boxSize="50px"
                      background={'transparent'}
                    />
                  </Flex>
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    w="100%"
                    position="relative"
                    flexDirection="column"
                  >
                    <Flex
                      justifyContent="center"
                      alignItems="center"
                      w="100%"
                      position="relative"
                      flexDirection="column"
                      mb={3}
                    >
                      <motion.img
                        src={upgradedSocietyOrCircle.image}
                        alt="Brain"
                        style={{
                          width: '80px',
                          height: '80px',
                          background: 'transparent',
                        }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                      <Lightning />
                    </Flex>
                    <Text
                      textAlign="center"
                      fontSize="md"
                      fontWeight="bold"
                      color={upgradedSocietyOrCircle.textColor}
                      textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                      paddingLeft={{ base: '5.5%', md: '9.5%', xl: '0.5%' }}
                    >
                      {t('society', {
                        society: upgradedSocietyOrCircle.society.split(' ')[0],
                      })}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </>
          ) : (
            <>
              <Flex align="center" justify="center" mt={4}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="purple.600"
                  letterSpacing="wide"
                  textTransform="uppercase"
                  fontStyle="italic"
                  fontFamily="sans-serif"
                >
                  {t('circleUpgrade')}
                </Text>
              </Flex>
              <Flex align="center" justify="center" mt={4}>
                <Flex align="center" justify="center" mt={4}>
                  <Flex
                    flexDirection={'column'}
                    align="center"
                    justify="center"
                    position={'relative'}
                    mt={-7}
                  >
                    <motion.img
                      src={Circle}
                      alt="Circle"
                      style={{
                        width: '150px',
                        height: '150px',
                        background: 'transparent',
                      }}
                    />
                    <CircleLightning />
                    <Flex
                      flexDirection={'column'}
                      align="center"
                      justify="center"
                      position={'absolute'}
                      top={'50%'}
                      transform={'translateY(-50%)'}
                    >
                      <Text
                        textAlign="center"
                        fontSize="2xl"
                        fontWeight="bold"
                        color={upgradedSocietyOrCircle.textColor}
                        textShadow="2px 2px 4px rgba(0,0,0,0.4)"
                        mt={8}
                      >
                        {t('circle', {
                          circle: upgradedSocietyOrCircle.circle,
                        })}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </>
          )}
          <Flex
            align="center"
            justify="center"
            mt={5}
            flexDirection="column"
            p={2}
          >
            <Text
              textAlign="center"
              fontSize="lg"
              color="white"
              textShadow="1px 1px 2px rgba(0,0,0,0.2)"
            >
              {t('upgradeMessage', {
                upgradeMessage: user.societyUpgradeMessage,
              })}
            </Text>
            <Text
              textAlign="center"
              fontSize="md"
              color="gray.400"
              textShadow="1px 1px 2px rgba(0,0,0,0.2)"
              mt={2}
            >
              {t('journeyContinues')}
            </Text>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Flex align="center" justify="center" width="100%">
            <Button
              colorScheme="purple"
              onClick={handleUpgradeMessageClose}
              className="blinking-button"
              mt={3}
              _hover={{ bg: 'purple.600' }}
            >
              {t('continueJourney')}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default UpgradeModal
