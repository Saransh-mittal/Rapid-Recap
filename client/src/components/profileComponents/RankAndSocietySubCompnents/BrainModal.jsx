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
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { motion } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import Brains from '../../../assets/Brains'
// Lazy load components and data
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

  // Preload images and start auto-navigation
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
    return () => {
      clearInterval(intervalId)
    }
  }, [isOpen, currentUserSociety, Brains])

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

  if (!isOpen || !Brains[currentPage - 1]) return null

  const currentBrain = useMemo(() => Brains[currentPage - 1], [currentPage])

  const currentSocietyIndex = useMemo(
    () =>
      currentUserSociety &&
      Brains.length > 0 &&
      Brains.findIndex(
        brain =>
          brain.society.toLowerCase() === currentUserSociety.toLowerCase(),
      ),
    [currentUserSociety, Brains],
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowBrainModal(false)
        onClose()
      }}
      size={{ base: 'full', lg: '3xl' }}
    >
      <ModalOverlay />
      <ModalContent
        style={{
          backgroundColor: '#0f0d15',
          color: 'white',
          borderRadius: '10px',
        }}
        {...useSwipeable({
          onSwipedLeft: handleNextPage,
          onSwipedRight: handlePreviousPage,
        })}
      >
        <ModalHeader
          style={{
            textAlign: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'transparent',
            fontFamily: "'Poppins', sans-serif",
            backgroundImage: 'linear-gradient(45deg, #ff7e5f, #feb47b)',
            backgroundClip: 'text',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            backgroundColor: '#0f0d15',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          Society Details
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            marginBottom="10px"
          >
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="Previous Page"
              onClick={handlePreviousPage}
              isDisabled={currentPage === 1}
              _hover={{
                bgGradient: 'linear(to-r, #7928CA, #FF0080)',
                color: 'white',
                boxShadow: 'xl',
              }}
              transition="all 0.2s"
            />
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label="Next Page"
              onClick={handleNextPage}
              isDisabled={currentPage === 5}
              _hover={{
                bgGradient: 'linear(to-r, #7928CA, #FF0080)',
                color: 'white',
                boxShadow: 'xl',
              }}
              transition="all 0.2s"
            />
          </Flex>
          {currentPage === currentSocietyIndex + 1 && (
            <Text
              textAlign="center"
              color="yellow"
              fontWeight="bold"
              marginTop={'-10%'}
              fontSize="24px"
            >
              <span style={{ fontSize: '36px', marginRight: '5px' }}>📍</span>
              You are here!
            </Text>
          )}
          <Box textAlign="center">
            <Flex
              justifyContent={'center'}
              alignItems={'center'}
              w={'30%'}
              position="relative"
              mx={'auto'}
            >
              <Heading
                as="h4"
                size={'sm'}
                color={currentBrain.textColor}
                marginTop={'5px'}
              >
                {currentBrain.society} Society
              </Heading>
              <Suspense fallback={<div>Loading...</div>}>
                <NameLightning
                  boxShadow={currentBrain.boxShadow}
                  MAX_IQ={currentBrain.IQ_Lower}
                />
              </Suspense>
            </Flex>

            <Text mb={2} color={currentBrain.textColor} mt={4}>
              IQ Range: {currentBrain.IQ_Lower} -{' '}
              {currentBrain.IQ_Upper || 'Above'}
            </Text>
            <motion.img
              src={currentBrain.image}
              alt={currentBrain.society}
              style={{
                width: '140px',
                height: '140px',
                background: 'transparent',
                display: 'block',
                margin: '0 auto',
                filter: 'drop-shadow(0 0 0.75rem #fff)',
                transition: 'opacity 0.3s ease',
                opacity: imageLoaded ? 1 : 0,
              }}
              onLoad={() => setImageLoaded(true)}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            <div style={{ textAlign: 'left', color: currentBrain.textColor }}>
              {currentBrain.BrainInfo.split('.').map((point, index) => {
                const lines = point.trim().split('\n')
                return lines.map(
                  (line, lineIndex) =>
                    line.trim() && (
                      <div
                        style={{ flexDirection: 'row !important' }}
                        key={lineIndex}
                      >
                        <p style={{ padding: '0', margin: '0.2rem' }}></p>

                        <span
                          key={index + '-' + lineIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '5px',
                            borderRadius: '5px',
                            fontStyle: 'italic',
                          }}
                        >
                          ➤ {line}
                          {lineIndex === lines.length - 1 ? '.' : <br />}
                        </span>
                      </div>
                    ),
                )
              })}
              <br />
            </div>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default React.memo(BrainModal)
