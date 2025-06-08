// components/quickClashComponents/ui/MatchTrophyPotentialDisplay.jsx
import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Flex,
  Tooltip,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Trophy, Crown, Sword } from 'lucide-react'

const MotionBox = motion(Box)
const MotionIcon = motion(Icon)

/**
 * Component to display match trophy potential in rows showing win/loss scenarios
 */
const MatchTrophyPotentialDisplay = ({
  userTrophies,
  opponentTrophies,
  userWinGain,
  userLoss,
  opponentWinGain,
  opponentLoss,
  size = 'sm',
}) => {
  const { t } = useTranslation('QuickClash')

  const sizes = {
    xs: { fontSize: '2xs', iconSize: 3, spacing: 1, px: 1.5, py: 0.5 },
    sm: { fontSize: 'xs', iconSize: 3, spacing: 1.5, px: 2, py: 1 },
    md: { fontSize: 'sm', iconSize: 4, spacing: 2, px: 2.5, py: 1 },
  }

  const sizeProps = sizes[size]

  return (
    <VStack spacing={3} align="stretch" w="100%">
      {/* Current trophies display */}
      <Flex justify="space-between" align="center" mb={2}>
        <Tooltip label={t('Your current trophies')}>
          <Flex
            align="center"
            bg="rgba(255, 215, 0, 0.15)"
            borderRadius="full"
            px={sizeProps.px}
            py={sizeProps.py}
            border="1px solid"
            borderColor="rgba(255, 215, 0, 0.4)"
          >
            <Icon
              as={Trophy}
              color="yellow.400"
              boxSize={sizeProps.iconSize}
              mr={1}
            />
            <Text color="white" fontWeight="bold" fontSize={sizeProps.fontSize}>
              {userTrophies}
            </Text>
          </Flex>
        </Tooltip>

        <Text color="whiteAlpha.600" fontSize="xs" fontWeight="medium">
          {t('VS')}
        </Text>

        <Tooltip label={t('Opponent current trophies')}>
          <Flex
            align="center"
            bg="rgba(255, 215, 0, 0.1)"
            borderRadius="full"
            px={sizeProps.px}
            py={sizeProps.py}
            border="1px solid"
            borderColor="rgba(255, 215, 0, 0.3)"
          >
            <Icon
              as={Trophy}
              color="yellow.300"
              boxSize={sizeProps.iconSize}
              mr={1}
            />
            <Text
              color="whiteAlpha.900"
              fontWeight="bold"
              fontSize={sizeProps.fontSize}
            >
              {opponentTrophies}
            </Text>
          </Flex>
        </Tooltip>
      </Flex>

      {/* Trophy potential scenarios */}
      <VStack spacing={2} align="stretch">
        {/* Scenario 1: User wins */}
        <MotionBox
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tooltip label={t('If You win')}>
            <Flex
              justify="space-between"
              align="center"
              bg="rgba(72, 187, 120, 0.1)"
              borderRadius="lg"
              px={3}
              py={2}
              border="1px solid"
              borderColor="rgba(72, 187, 120, 0.3)"
              _hover={{
                bg: 'rgba(72, 187, 120, 0.15)',
                borderColor: 'green.400',
              }}
              transition="all 0.2s"
            >
              {/* User gains */}
              <Flex align="center" flex={1}>
                <Icon as={Crown} color="green.400" boxSize={3} mr={2} />
                <Text color="whiteAlpha.700" fontSize="xs" mr={2}>
                  {t('You')}:
                </Text>
                <Flex align="center">
                  <MotionIcon
                    as={TrendingUp}
                    color="green.400"
                    boxSize={sizeProps.iconSize}
                    mr={1}
                    animate={{
                      y: [0, -1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                  <Text
                    color="green.300"
                    fontWeight="bold"
                    fontSize={sizeProps.fontSize}
                  >
                    +{userWinGain}
                  </Text>
                </Flex>
              </Flex>

              {/* Opponent loses */}
              <Flex align="center" flex={1} justify="flex-end">
                <Text color="whiteAlpha.600" fontSize="xs" mr={2}>
                  {t('Opponent')}:
                </Text>
                <Flex align="center">
                  <MotionIcon
                    as={TrendingDown}
                    color="red.400"
                    boxSize={sizeProps.iconSize}
                    mr={1}
                    animate={{
                      y: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                  <Text
                    color="red.300"
                    fontWeight="bold"
                    fontSize={sizeProps.fontSize}
                  >
                    -{opponentLoss}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Tooltip>
        </MotionBox>

        {/* Scenario 2: Opponent wins */}
        <MotionBox
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tooltip label={t('If Opponent wins')}>
            <Flex
              justify="space-between"
              align="center"
              bg="rgba(245, 101, 101, 0.1)"
              borderRadius="lg"
              px={3}
              py={2}
              border="1px solid"
              borderColor="rgba(245, 101, 101, 0.3)"
              _hover={{
                bg: 'rgba(245, 101, 101, 0.15)',
                borderColor: 'red.400',
              }}
              transition="all 0.2s"
            >
              {/* User loses */}
              <Flex align="center" flex={1}>
                <Icon as={Sword} color="red.400" boxSize={3} mr={2} />
                <Text color="whiteAlpha.700" fontSize="xs" mr={2}>
                  {t('You')}:
                </Text>
                <Flex align="center">
                  <MotionIcon
                    as={TrendingDown}
                    color="red.400"
                    boxSize={sizeProps.iconSize}
                    mr={1}
                    animate={{
                      y: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                  <Text
                    color="red.300"
                    fontWeight="bold"
                    fontSize={sizeProps.fontSize}
                  >
                    -{userLoss}
                  </Text>
                </Flex>
              </Flex>

              {/* Opponent gains */}
              <Flex align="center" flex={1} justify="flex-end">
                <Text color="whiteAlpha.600" fontSize="xs" mr={2}>
                  {t('Opponent')}:
                </Text>
                <Flex align="center">
                  <MotionIcon
                    as={TrendingUp}
                    color="green.400"
                    boxSize={sizeProps.iconSize}
                    mr={1}
                    animate={{
                      y: [0, -1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                  <Text
                    color="green.300"
                    fontWeight="bold"
                    fontSize={sizeProps.fontSize}
                  >
                    +{opponentWinGain}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Tooltip>
        </MotionBox>
      </VStack>
    </VStack>
  )
}

export default MatchTrophyPotentialDisplay
