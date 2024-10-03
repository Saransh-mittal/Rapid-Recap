import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Text,
  Image,
  Flex,
  VStack,
  useBreakpointValue,
  keyframes,
} from '@chakra-ui/react'
import { badgeConfig } from '../../models/badgeConfig'

const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`

const TournamentBadge = ({
  tournamentNumber,
  rank,
  name,
  inGameName,
  participantCnt,
  size = 'md',
  badgeName = null,
  onPopoverToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [popoverStyle, setPopoverStyle] = useState({})
  const popoverRef = useRef(null)
  const badgeRef = useRef(null)

  const {
    image,
    style,
    icon: RankIcon,
    sizeValues,
  } = badgeConfig[badgeName?.name] || {}

  const sizeValue = sizeValues ? sizeValues[size] || sizeValues.md : null
  const { width, height, fontSize, textPosition, mr } = sizeValue || {}

  const iconSize = useBreakpointValue({ base: '32px', sm: '24px' })

  const handleClick = e => {
    e.stopPropagation()
    setIsOpen(!isOpen)
    if (onPopoverToggle) {
      onPopoverToggle(!isOpen)
    }
  }

  const updatePopoverPosition = () => {
    if (badgeRef.current && popoverRef.current) {
      const badgeRect = badgeRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      let left = badgeRect.left + badgeRect.width / 2 - popoverRect.width / 2
      let top = badgeRect.bottom + 10 // 10px gap

      // Adjust horizontal position if out of bounds
      if (left < 10) left = 10
      if (left + popoverRect.width > windowWidth - 10)
        left = windowWidth - popoverRect.width - 10

      // Adjust vertical position if out of bounds
      if (top + popoverRect.height > windowHeight - 10) {
        top = badgeRect.top - popoverRect.height - 10
      }

      setPopoverStyle({
        left: `${left}px`,
        top: `${top}px`,
        maxWidth: `${windowWidth - 20}px`, // 10px padding on each side
      })
    }
  }

  useEffect(() => {
    const handleOutsideClick = event => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target) &&
        !badgeRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        if (onPopoverToggle) {
          onPopoverToggle(false)
        }
      }
    }

    const handleScroll = () => {
      setIsOpen(false)
      if (onPopoverToggle) {
        onPopoverToggle(false)
      }
    }

    const handleResize = () => {
      if (isOpen) {
        updatePopoverPosition()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, onPopoverToggle])

  useEffect(() => {
    if (isOpen) {
      updatePopoverPosition()
    }
  }, [isOpen])

  if (!tournamentNumber || !badgeName?.name) return null

  return (
    <Box position="relative">
      <Box
        ref={badgeRef}
        position="relative"
        width={width}
        height={height}
        borderRadius="50%"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        transition="all 0.3s ease"
        _hover={{
          boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
          transform: 'scale(1.05)',
        }}
        mr={mr ? mr : 0}
        onClick={handleClick}
      >
        <Image
          src={image}
          alt={`Rank ${rank} Badge`}
          width="100%"
          height="100%"
          objectFit="contain"
        />
        <Flex
          flexDirection="column"
          position="absolute"
          bottom={textPosition.bottom}
          left="50%"
          transform={`translateX(${textPosition.x}%) translateY(${textPosition.y}%)`}
          color="white"
          fontSize={fontSize}
          fontWeight="bold"
          textShadow="1px 1px 2px rgba(0,0,0,0.6)"
          textTransform="capitalize"
        >
          <Flex>{badgeName?.text}</Flex>
          <Flex justifyContent="center" mt={-1}>
            {'#' + tournamentNumber?.toString().padStart(3, '0')}
          </Flex>
        </Flex>
      </Box>

      {isOpen && (
        <Box
          ref={popoverRef}
          position="fixed"
          zIndex={1000}
          bg="white"
          borderRadius="md"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          animation={`${fadeInScale} 0.3s ease-out forwards`}
          {...style}
          {...popoverStyle}
        >
          <VStack spacing={2} align="center" p={4}>
            <Flex
              alignItems="center"
              justifyContent="center"
              mb={0}
              flexWrap="wrap"
            >
              <Box
                bg="rgba(255, 255, 255, 0.2)"
                borderRadius="50%"
                p={1}
                mr={2}
                mb={{ base: 2, md: 0 }}
              >
                {RankIcon && (
                  <RankIcon
                    size={iconSize}
                    style={{
                      filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))',
                    }}
                    color={style?.color}
                  />
                )}
              </Box>
              <Flex
                flexDirection="column"
                alignItems={{ base: 'center', md: 'flex-start' }}
              >
                <Text
                  fontWeight="bold"
                  fontSize={{ base: 'lg', md: 'xl' }}
                  mb={0}
                >
                  {name}
                </Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} opacity={0.8}>
                  @{inGameName}
                </Text>
              </Flex>
            </Flex>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="semibold"
              textAlign="center"
            >
              Rank {rank} in Tournament #
              {String(tournamentNumber)?.padStart(3, '0')}
            </Text>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              opacity={0.9}
              textAlign="center"
            >
              Out of {participantCnt} participants
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  )
}

export default TournamentBadge
