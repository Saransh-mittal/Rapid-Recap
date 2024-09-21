import React, { Suspense, useCallback, useEffect, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useMediaQuery,
  VStack,
  Box,
  Heading as ChakraHeading,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Flex,
  Spinner,
} from '@chakra-ui/react'
import TrophySVG from '../../../assets/svg/TrophySVG'
import { useTranslation } from 'react-i18next'
import CategoryStatsCard from '../../tournamentComponents/CategoryStatsCard'
import Heading from '../../miscellaneous/HeadingComponent'

const TournamentModal = ({
  isOpen,
  onClose,
  title,
  userStats,
  categoryStats,
  setShowQuizSummary,
  setCategory,
}) => {
  const [isLargerThan992px] = useMediaQuery('(min-width: 992px)')
  const [initialTouchY, setInitialTouchY] = useState(null)
  const { t } = useTranslation('TournamentModal')

  const styleScrollbar = useCallback(() => {
    const style = document.createElement('style')
    style.innerHTML = `
      .tournamentModalBody::-webkit-scrollbar {
        width: 8px;
      }
      .tournamentModalBody::-webkit-scrollbar-thumb {
        background-color: #333;
        border-radius: 4px;
      }
      .tournamentModalBody::-webkit-scrollbar-thumb:hover {
        background-color: #555;
      }
      .tournamentModalBody::-webkit-scrollbar-track {
        background-color: #0f0d15;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  useEffect(() => {
    const handleWheel = event => {
      const modalBody = document.querySelector('.tournamentModalBody')
      if (modalBody) {
        modalBody.scrollTop += event.deltaY
      }
    }

    const handleTouchStart = event => {
      if (event.touches.length === 1) {
        setInitialTouchY(event.touches[0].clientY)
      }
    }

    const handleTouchMove = event => {
      if (event.touches.length === 1) {
        const modalBody = document.querySelector('.tournamentModalBody')
        if (modalBody && initialTouchY !== null) {
          const currentTouchY = event.touches[0].clientY
          modalBody.scrollTop += initialTouchY - currentTouchY
          setInitialTouchY(currentTouchY)
        }
      }
    }

    if (isOpen) {
      const cleanUpStyles = styleScrollbar()

      // MutationObserver setup is memoized
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            const modalContainer = document.querySelector(
              '.chakra-modal__content-container.css-1ocl83d',
            )

            if (modalContainer) {
              modalContainer.style.width = isLargerThan992px ? '65vw' : '100vw'
              modalContainer.style.marginLeft = isLargerThan992px
                ? '20rem'
                : '0'
              modalContainer.style.marginTop = isLargerThan992px
                ? '0'
                : '7.5rem'
            }
          }
        })
      })

      const config = { childList: true, subtree: true }
      const targetNode = document.body

      observer.observe(targetNode, config)

      document.addEventListener('wheel', handleWheel)
      document.addEventListener('touchstart', handleTouchStart)
      document.addEventListener('touchmove', handleTouchMove)

      return () => {
        observer.disconnect()
        cleanUpStyles()
        document.removeEventListener('wheel', handleWheel)
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [isOpen, isLargerThan992px, initialTouchY, styleScrollbar])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      allowPinchZoom
      motionPreset="slideInBottom"
      size={{ base: 'full', lg: '4xl' }}
      scrollBehavior="inside"
    >
      {/* <ModalOverlay /> */}
      <ModalContent
        bg="rgba(15, 13, 21, 0.8)"
        borderRadius="xl"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.18)"
        pb={{ base: '10rem', lg: '0' }}
        color={'white'}
        px={{ base: '1rem', lg: '3rem' }}
        css={{ '&::-webkit-scrollbar': { display: 'none' } }}
      >
        <ModalHeader>
          <Heading title={`${t('tournament')} ${title}`} color={'gold'} />{' '}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          mb={'2rem'}
          overflowX={'hidden'}
          css={{ '&::-webkit-scrollbar': { display: 'none' } }}
          overflowY="auto"
          w={'100%'}
          pl={'7px'}
          pr={'0'}
          className="tournamentModalBody"
        >
          <VStack spacing={8} align="stretch" py={6}>
            <Box>
              <ChakraHeading size="lg" mb={4} color="gold">
                {t('overallPerformance')}
              </ChakraHeading>
              <HStack
                justify="space-between"
                bg="whiteAlpha.200"
                p={4}
                borderRadius="md"
              >
                <HStack>
                  <TrophySVG color="gold" size={32} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">{t('totalScore')}</Text>
                    <Text
                      fontSize={{ base: 'xl', md: '2xl' }}
                      fontWeight="bold"
                      color="gold"
                    >
                      {userStats?.totalScore}
                    </Text>
                  </VStack>
                </HStack>
                <Badge fontSize={{ base: 'sm', md: 'lg' }}>
                  {t('quizCount')} {userStats?.completedCategories.length}
                </Badge>
              </HStack>
            </Box>

            <Box>
              <ChakraHeading size="lg" mb={4} color="gold">
                {t('categoryBreakdown')}
              </ChakraHeading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
                {categoryStats.map((stat, index) => (
                  <Box
                    key={index}
                    onClick={() => {
                      setCategory(stat?.category)
                    }}
                  >
                    <CategoryStatsCard
                      key={index}
                      stat={stat}
                      t={t}
                      userStats={userStats}
                      setShowQuizSummary={setShowQuizSummary}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            onClick={onClose}
            color={'white'}
            _hover={{
              color: 'white',
            }}
          >
            {t('close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TournamentModal
