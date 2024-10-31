import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Box, Text, useMediaQuery } from '@chakra-ui/react'

const DictTooltip = ({ word, definition, position, onClose }) => {
  const tooltipRef = useRef(null)
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 })
  const [placement, setPlacement] = useState('bottom')
  const [isMobile] = useMediaQuery('(max-width: 480px)')
  const [isTablet] = useMediaQuery('(max-width: 768px)')
  const clickTimeoutRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = event => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        // Clear any existing timeout to prevent race conditions
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current)
        }

        // Add a small delay before closing to allow new tooltip to open
        clickTimeoutRef.current = setTimeout(() => {
          // Check if the clicked element is a dictionary word
          const isDictionaryWord = event.target.closest(
            '[data-dictionary-word]',
          )
          if (!isDictionaryWord) {
            onClose()
          }
        }, 50)
      }
    }

    const handleScroll = () => {
      onClose()
    }

    const updateTooltipSize = () => {
      if (tooltipRef.current) {
        const { offsetWidth, offsetHeight } = tooltipRef.current
        setTooltipSize({
          width: offsetWidth,
          height: offsetHeight,
        })
        determineTooltipPlacement()
      }
    }

    const determineTooltipPlacement = () => {
      if (!position || !tooltipRef.current) return

      const viewportHeight = window.innerHeight
      const tooltipHeight = tooltipRef.current.offsetHeight
      const spaceBelow = viewportHeight - position.y
      const spaceAbove = position.y - position.sourceTop
      const buffer = 10

      if (
        spaceBelow < tooltipHeight + buffer &&
        spaceAbove > tooltipHeight + buffer
      ) {
        setPlacement('top')
      } else {
        setPlacement('bottom')
      }
    }

    updateTooltipSize()
    determineTooltipPlacement()

    window.addEventListener('resize', updateTooltipSize)
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll)

    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
      window.removeEventListener('resize', updateTooltipSize)
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [position, onClose])

  if (!position) return null

  const tooltipMaxWidth = isMobile ? 280 : isTablet ? 320 : 400
  const tooltipPadding = isMobile ? 8 : 10
  let finalX = position.x
  const halfTooltipWidth = tooltipMaxWidth / 2

  if (position.x + halfTooltipWidth > window.innerWidth) {
    finalX = window.innerWidth - tooltipPadding - halfTooltipWidth
  } else if (position.x - halfTooltipWidth < 0) {
    finalX = tooltipPadding + halfTooltipWidth
  }

  const verticalOffset = 10
  const finalY =
    placement === 'top'
      ? position.sourceTop - tooltipSize.height - verticalOffset
      : position.y + verticalOffset

  return createPortal(
    <Box
      ref={tooltipRef}
      position="fixed"
      left={`${finalX}px`}
      top={`${finalY}px`}
      transform="translate(-50%, 0)"
      bg="rgba(38, 32, 54, 0.95)"
      p={tooltipPadding}
      borderRadius="xl"
      boxShadow="dark-lg"
      border="1px solid"
      borderColor="whiteAlpha.200"
      maxW={`${tooltipMaxWidth}px`}
      w={isMobile ? '90vw' : 'auto'}
      zIndex={1000}
      transition="all 0.2s ease-out"
    >
      <Text
        fontWeight="bold"
        mb={2}
        color="purple.100"
        fontSize={isMobile ? 'lg' : 'xl'}
      >
        {word}
      </Text>
      <Text
        color="gray.200"
        fontSize={isMobile ? 'sm' : 'md'}
        lineHeight="tall"
      >
        {definition}
      </Text>
    </Box>,
    document.body,
  )
}

export default DictTooltip
