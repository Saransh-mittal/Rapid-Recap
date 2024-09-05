import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Box,
} from '@chakra-ui/react'
import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'

// Define the pulsating animation
const pulsate = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`

// Apply the animation to the headings
const PulsatingText = styled(Text)`
  animation: ${pulsate} 2s infinite;
`

const QuinBoostModal = ({
  isOpen,
  onClose,
  quizLeftToGetQuizBoost,
  isStateBoosted,
}) => {
  const { t } = useTranslation('QuinBoostModal')
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
        `}
      </style>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent
          style={{
            backgroundColor: '#0f0d15',
            color: 'white',
            borderRadius: '10px',
          }}
        >
          <ModalHeader
            textAlign="center"
            p={0}
            bg="transparent"
            borderBottom="none"
          >
            <PulsatingText
              fontSize="4xl"
              fontFamily="fantasy"
              color="gold"
              letterSpacing="wide"
            >
              {t('Quin')} <span style={{ color: 'crimson' }}>{t('Boost')}</span>
            </PulsatingText>
            <Text fontSize="sm" color="gray.500" mt={'-3'} fontStyle="italic">
              {t('levelUpSkill')}
            </Text>
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            {!isStateBoosted ? (
              <Box mt={'1rem'}>
                <Text
                  fontSize={{ base: 'xl', md: 'lg' }}
                  color="purple.600"
                  textAlign="left"
                  mb="4"
                  fontFamily="Montserrat, sans-serif"
                  fontWeight="bold"
                  fontStyle="italic"
                  //textDecoration="underline"
                >
                  {t('QuinBoostInactive')}
                </Text>
                <Text
                  fontSize={{ base: 'md', md: 'md' }}
                  color="cyan.400"
                  textAlign="left"
                  fontFamily="serif"
                  fontStyle="italic"
                  fontWeight="bold"
                >
                  {'➤'} {t('SuperchargeRQM')}{' '}
                  <span role="img" aria-label="rocket">
                    🚀
                  </span>
                </Text>
                <Text
                  fontSize={{ base: 'md', md: 'md' }}
                  color="#C3FF93"
                  textAlign="left"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {'➤'} {t('TrackProgress')}
                </Text>
              </Box>
            ) : (
              <Box>
                <Box mt={'1rem'}>
                  <Text
                    fontSize={{ base: 'xl', md: 'lg' }}
                    color="#874CCC"
                    textAlign="left"
                    mb="4"
                    fontFamily="Montserrat, sans-serif"
                  >
                    <span
                      style={{
                        fontWeight: 'bold',
                        fontStyle: 'italic',
                      }}
                    >
                      {t('QuinBoostActive')}
                    </span>{' '}
                    {t('EnjoyBoost')}!
                  </Text>
                  <Text
                    fontSize={{ base: 'md', md: 'md' }}
                    color="#CDEAD5"
                    textAlign="left"
                    style={{
                      fontStyle: 'italic',
                      fontWeight: 'bold',
                    }}
                  >
                    {'➤'} {t('MaintainBoost')}{' '}
                    <span role="img" aria-label="thumbs-up">
                      👍
                    </span>
                  </Text>
                </Box>
                <Text
                  fontSize={{ base: 'md', md: 'md' }}
                  color="#F5DAD2"
                  textAlign="left"
                  mt={'1rem'}
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                  }}
                >
                  {'➤'} {t('ActivationBadge')}
                </Text>

                <Text
                  fontSize={{ base: 'sm', md: 'sm' }}
                  color="gray.600"
                  textAlign="center"
                  mt={'2rem'}
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                  }}
                >
                  {t('Note')}
                </Text>
              </Box>
            )}

            {/* Rest of your content */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default QuinBoostModal
