import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { useSwipeable } from 'react-swipeable'
import { motion } from 'framer-motion'
import Circles from '../../../assets/Circles'

const CircleModal = ({
  isOpen,
  onClose,
  currentUserCircle,
  setShowCircleModal,
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [glowAnimation, setGlowAnimation] = useState(false)

  const currentCircle = useMemo(() => Circles[currentPage - 1], [currentPage])

  useEffect(() => {
    if (!isOpen || !currentUserCircle || Circles.length === 0) return

    const circleIndex = Circles.findIndex(
      circle => circle.circle.toLowerCase() === currentUserCircle.toLowerCase(),
    )

    const intervalId = setInterval(() => {
      setCurrentPage(prevPage => {
        if (prevPage === circleIndex + 1) {
          clearInterval(intervalId)
          return prevPage
        } else {
          return prevPage + 1
        }
      })
    }, 200)

    return () => clearInterval(intervalId)
  }, [isOpen, currentUserCircle])

  useEffect(() => {
    if (isOpen) {
      setGlowAnimation(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (glowAnimation) {
      const timeout = setTimeout(() => {
        setGlowAnimation(false)
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [glowAnimation])

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prevPage => (prevPage === 1 ? Circles.length : prevPage - 1))
    setGlowAnimation(true)
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage(prevPage => (prevPage === Circles.length ? 1 : prevPage + 1))
    setGlowAnimation(true)
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowCircleModal(false)
        onClose()
      }}
      size={{ base: 'full', lg: '3xl' }}
    >
      <ModalOverlay />
      <ModalContent
        bg="rgba(15, 13, 21, 0.8)"
        borderRadius="xl"
        border="1px solid rgba(255, 255, 255, 0.18)"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        {...useSwipeable({
          onSwipedLeft: handleNextPage,
          onSwipedRight: handlePreviousPage,
        })}
      >
        <ModalHeader
          textAlign="center"
          fontSize="36px"
          fontWeight="bold"
          color="transparent"
          fontFamily="'Poppins', sans-serif"
          backgroundImage="linear-gradient(45deg, #ff7e5f, #feb47b)"
          backgroundClip="text"
          textShadow="2px 2px 4px rgba(0, 0, 0, 0.3)"
          backgroundColor="#0f0d15"
          padding="10px"
          borderRadius="10px"
          boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)"
        >
          Circle Details
        </ModalHeader>
        <ModalCloseButton color="white" />
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
              _hover={{
                bgGradient: 'linear(to-r, #7928CA, #FF0080)',
                color: 'white',
                boxShadow: 'xl',
              }}
              transition="all 0.2s"
            />
          </Flex>
          {currentPage ===
            Circles.findIndex(
              circle =>
                circle.circle.toLowerCase() === currentUserCircle.toLowerCase(),
            ) +
              1 && (
            <Text
              textAlign="center"
              color="yellow"
              fontWeight="bold"
              fontSize="24px"
              marginBottom={4}
            >
              <span style={{ fontSize: '36px', marginRight: '5px' }}>📍</span>
              You are here!
            </Text>
          )}
          {currentCircle && (
            <Flex
              position="relative"
              textAlign="center"
              animation={glowAnimation ? 'glow 1.5s 2 alternate' : 'none'}
              alignItems={'center'}
              justifyContent={'center'}
              w={'100%'}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <svg width="200" height="200" viewBox="0 0 120 120">
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
                        stopColor={currentCircle.textColor}
                        stopOpacity="0.2"
                      />
                      <stop
                        offset="100%"
                        stopColor={currentCircle.textColor}
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
                  <circle cx="60" cy="60" r="50" fill="rgba(25, 25, 35, 0.7)" />
                  <text
                    x="60"
                    y="40"
                    textAnchor="middle"
                    fill={currentCircle.textColor}
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {currentCircle.circle}
                  </text>
                  <text
                    x="60"
                    y="60"
                    textAnchor="middle"
                    fill={currentCircle.textColor}
                    fontSize="12"
                  >
                    Circle
                  </text>
                  <text
                    x="60"
                    y="80"
                    textAnchor="middle"
                    fill="#9CAFAA"
                    fontSize="9"
                  >
                    IQ Range: {currentCircle.IQ_Lower} -{' '}
                    {currentCircle.IQ_Upper || 'Above'}
                  </text>
                </svg>
              </motion.div>
            </Flex>
          )}
          {currentCircle && (
            <Box mt={4} textAlign="left" color={currentCircle.textColor}>
              {currentCircle.CircleInfo.split('.').map((point, index) => {
                const lines = point.trim().split('\n')
                return lines.map(
                  (line, lineIndex) =>
                    line.trim() && (
                      <Flex
                        key={lineIndex * index + index}
                        alignItems="center"
                        mb={2}
                      >
                        <Text as="span" mr={2}>
                          ➤
                        </Text>
                        <Text fontStyle="italic">
                          {line}
                          {lineIndex === lines.length - 1 ? '.' : ''}
                        </Text>
                      </Flex>
                    ),
                )
              })}
            </Box>
          )}
        </ModalBody>
        <style>
          {`
            @keyframes glow {
              0% {
                filter: brightness(100%);
                transform: scale(1);
              }
              50% {
                filter: brightness(150%);
                transform: scale(1.1);
              }
              100% {
                filter: brightness(100%);
                transform: scale(1);
              }
            }
          `}
        </style>
      </ModalContent>
    </Modal>
  )
}

export default CircleModal
