import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  IconButton,
  Text,
  Box,
  Heading,
  VStack,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import Brains from '../../../assets/Brains'

const NameLightning = React.lazy(() =>
  import('../../miscellaneous/NameLightning'),
)

const BrainModal = ({
  isOpen,
  onClose,
  currentUserSociety,
  setShowBrainModal,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (!isOpen || !currentUserSociety || Brains.length === 0) return
    const societyIndex = Brains.findIndex(
      brain => brain.society.toLowerCase() === currentUserSociety.toLowerCase(),
    )

    const intervalId = setInterval(() => {
      setCurrentPage(prevPage => {
        if (prevPage === societyIndex + 1) {
          clearInterval(intervalId)
          return prevPage
        } else {
          return prevPage + 1
        }
      })
    }, 200)
    return () => clearInterval(intervalId)
  }, [isOpen, currentUserSociety])

  useEffect(() => {
    Brains.forEach(brain => {
      const img = new Image()
      img.src = brain.image
    })
  }, [])

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prevPage => (prevPage === 1 ? Brains.length : prevPage - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage(prevPage => (prevPage === Brains.length ? 1 : prevPage + 1))
  }, [])

  const currentBrain = useMemo(() => Brains[currentPage - 1], [currentPage])

  const currentSocietyIndex = useMemo(
    () =>
      currentUserSociety &&
      Brains.length > 0 &&
      Brains.findIndex(
        brain =>
          brain.society.toLowerCase() === currentUserSociety.toLowerCase(),
      ),
    [currentUserSociety],
  )

  if (!isOpen || !currentBrain) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowBrainModal(false)
        onClose()
      }}
      size={{ base: 'full', lg: '2xl' }}
      scrollBehavior="inside"
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        bg="rgba(15, 13, 21, 0.8)"
        borderRadius="xl"
        border="1px solid rgba(255, 255, 255, 0.18)"
        boxShadow={`0 0 20px ${currentBrain.textColor}`}
        {...useSwipeable({
          onSwipedLeft: handleNextPage,
          onSwipedRight: handlePreviousPage,
        })}
      >
        <ModalHeader
          textAlign="center"
          fontSize="3xl"
          fontWeight="bold"
          bgGradient={`linear(to-r, ${currentBrain.textColor}, #feb47b)`}
          bgClip="text"
          p={6}
        >
          {currentBrain.society} Society
        </ModalHeader>
        <ModalCloseButton color={'white'} />
        <Flex justifyContent="space-between" alignItems="center" w={'75%'}>
          <IconButton
            icon={<ChevronLeftIcon size={'lg'} />}
            aria-label="Previous Page"
            onClick={handlePreviousPage}
            isDisabled={currentPage === 1}
            variant="ghost"
            _hover={{
              bg: `${currentBrain.textColor}22`,
              color: currentBrain.textColor,
            }}
            color={'white'}
            size={'lg'}
            transition="all 0.2s"
          />
          <IconButton
            icon={<ChevronRightIcon size={'lg'} />}
            aria-label="Next Page"
            onClick={handleNextPage}
            isDisabled={currentPage === Brains.length}
            variant="ghost"
            _hover={{
              bg: `${currentBrain.textColor}22`,
              color: currentBrain.textColor,
            }}
            color={'white'}
            size={'lg'}
            transition="all 0.2s"
          />
        </Flex>
        <ModalBody w={'100%'} p={0} px={4}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VStack spacing={3} align="center">
                {currentPage === currentSocietyIndex + 1 && (
                  <Text
                    color="yellow.400"
                    fontWeight="bold"
                    fontSize="xl"
                    textShadow="0 0 10px rgba(255, 255, 0, 0.5)"
                  >
                    <span style={{ fontSize: '36px', marginRight: '5px' }}>
                      📍
                    </span>
                    You are here!
                  </Text>
                )}
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  position="relative"
                  w="full"
                >
                  <Heading
                    as="h4"
                    size="md"
                    color={currentBrain.textColor}
                    textShadow={`0 0 10px ${currentBrain.textColor}66`}
                  >
                    {currentBrain.society} Society
                  </Heading>
                  <Box position="absolute" right="0">
                    <Suspense
                      fallback={
                        <Box
                          w="60px"
                          h="30px"
                          bg="gray.700"
                          borderRadius="md"
                        />
                      }
                    >
                      <NameLightning
                        boxShadow={currentBrain.boxShadow}
                        MAX_IQ={currentBrain.IQ_Lower}
                      />
                    </Suspense>
                  </Box>
                </Flex>
                <Text fontSize="lg" color={currentBrain.textColor}>
                  IQ Range: {currentBrain.IQ_Lower} -{' '}
                  {currentBrain.IQ_Upper || 'Above'}
                </Text>
                <motion.img
                  src={currentBrain.image}
                  alt={currentBrain.society}
                  style={{
                    width: '150px',
                    height: '150px',
                    filter: `drop-shadow(0 0 10px ${currentBrain.textColor})`,
                    transition: 'opacity 0.3s ease',
                    opacity: imageLoaded ? 1 : 0,
                  }}
                  onLoad={() => setImageLoaded(true)}
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
                <Box
                  borderRadius="lg"
                  p={4}
                  bg={`${currentBrain.textColor}11`}
                  borderColor={`${currentBrain.textColor}33`}
                  borderWidth={1}
                  mb={4}
                >
                  <Box
                    color={currentBrain.textColor}
                    fontStyle="italic"
                    lineHeight="tall"
                  >
                    {currentBrain.BrainInfo.split('.').map((point, index) =>
                      index ===
                      currentBrain.BrainInfo.split('.').length - 1 ? null : (
                        <Text key={index} mb={2}>
                          ➤ {point.trim()}.
                        </Text>
                      ),
                    )}
                  </Box>
                </Box>
              </VStack>
            </motion.div>
          </AnimatePresence>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(BrainModal)
