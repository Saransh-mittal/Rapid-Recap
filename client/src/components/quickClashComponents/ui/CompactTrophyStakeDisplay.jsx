// components/quickClashComponents/ui/CompactTrophyStakeDisplay.jsx
import React from 'react'
import {
  HStack,
  VStack,
  Text,
  Icon,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Divider,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react'

const MotionBox = motion(Box)
const MotionIcon = motion(Icon)

/**
 * Compact component to display trophy stakes (gain/loss) for challenge cards.
 * Uses a Popover to show detailed stakes on hover.
 */
const CompactTrophyStakeDisplay = ({
  potentialGain = 0,
  potentialLoss = 0,
  size = 'sm',
}) => {
  const { t } = useTranslation('QuickClash')

  // If no potential gain, don't render anything
  if (potentialGain === 0) return null

  const sizes = {
    xs: {
      fontSize: '2xs',
      iconSize: 2.5,
      spacing: 0.5,
      px: 2,
      py: 1,
      height: '24px',
    },
    sm: {
      fontSize: 'xs',
      iconSize: 3,
      spacing: 1,
      px: 2.5,
      py: 1,
      height: '28px',
    },
    md: {
      fontSize: 'sm',
      iconSize: 3.5,
      spacing: 1.5,
      px: 3,
      py: 1.5,
      height: '32px',
    },
  }

  const sizeProps = sizes[size]

  return (
    <Popover trigger="hover" placement="top" openDelay={100} closeDelay={200}>
      <PopoverTrigger>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            },
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
          // The cursor needs to be a pointer to indicate it's interactive
          cursor="pointer"
        >
          <HStack
            spacing={0}
            bg="rgba(0, 0, 0, 0.6)"
            borderRadius="full"
            px={sizeProps.px}
            py={sizeProps.py}
            height={sizeProps.height}
            borderWidth="1px"
            borderColor="rgba(255, 215, 0, 0.3)"
            boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
            position="relative"
            overflow="hidden"
            _hover={{
              borderColor: 'rgba(255, 215, 0, 0.5)',
              boxShadow: '0 2px 12px rgba(255, 215, 0, 0.2)',
            }}
            transition="all 0.2s"
          >
            {/* Background gradient */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(to-r, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))"
              borderRadius="full"
            />

            {/* Trophy icon */}
            <MotionIcon
              as={Trophy}
              color="yellow.400"
              boxSize={sizeProps.iconSize}
              mr={1}
              position="relative"
              zIndex={1}
              animate={{
                rotate: [0, 3, 0, -3, 0],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                },
              }}
              style={{
                filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.8))',
              }}
            />

            {/* Potential gain */}
            <HStack spacing={0} position="relative" zIndex={1}>
              <MotionIcon
                as={ChevronUp}
                color="green.400"
                boxSize={sizeProps.iconSize}
                animate={{
                  y: [0, -0.5, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
              />
              <Text
                color="green.300"
                fontWeight="bold"
                fontSize={sizeProps.fontSize}
                lineHeight="1"
                minW="20px"
                textAlign="center"
              >
                {potentialGain}
              </Text>
            </HStack>

            {/* Potential loss */}
            <HStack spacing={0} position="relative" zIndex={1}>
              <MotionIcon
                as={ChevronDown}
                color="red.400"
                boxSize={sizeProps.iconSize}
                animate={{
                  y: [0, 0.5, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  },
                }}
              />
              <Text
                color="red.300"
                fontWeight="bold"
                fontSize={sizeProps.fontSize}
                lineHeight="1"
                minW="20px"
                textAlign="center"
              >
                {potentialLoss}
              </Text>
            </HStack>
          </HStack>
        </MotionBox>
      </PopoverTrigger>
      <PopoverContent
        bg="rgba(20, 20, 30, 0.8)" // Dark, glassy background
        backdropFilter="blur(10px)" // Frosted glass effect
        borderColor="yellow.400"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        maxWidth="220px"
        _focus={{ boxShadow: 'none' }} // Remove default focus outline
      >
        <PopoverArrow bg="rgba(20, 20, 30, 0.8)" />
        <PopoverBody p={3}>
          <VStack spacing={2.5} align="stretch">
            <HStack spacing={2}>
              <Icon as={Trophy} color="yellow.400" boxSize={4} />
              <Text fontWeight="bold" color="white" fontSize="sm">
                {t('Trophy Stakes')}
              </Text>
            </HStack>
            <Divider borderColor="whiteAlpha.300" />
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={1.5}>
                  <Icon as={ChevronUp} color="green.300" boxSize={4} />
                  <Text fontSize="sm" color="whiteAlpha.900">
                    {t('On Win')}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="green.300" fontWeight="bold">
                  +{potentialGain}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <HStack spacing={1.5}>
                  <Icon as={ChevronDown} color="red.300" boxSize={4} />
                  <Text fontSize="sm" color="whiteAlpha.900">
                    {t('On Loss')}
                  </Text>
                </HStack>
                <Text fontSize="sm" color="red.300" fontWeight="bold">
                  -{potentialLoss}
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default CompactTrophyStakeDisplay
