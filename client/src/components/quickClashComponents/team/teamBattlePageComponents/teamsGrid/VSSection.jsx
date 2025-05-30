// components/quickClashComponents/team/teamBattlePageComponents/teamsGrid/VSSection.jsx
import React, { memo } from 'react'
import {
  Flex,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Swords } from 'lucide-react'

const MotionFlex = motion(Flex)
const MotionBox = motion.div

/**
 * VS Section Component - Shows battle score and sword animation
 */
const VSSection = memo(
  ({ leftTeam, rightTeam, vsSectionEffectiveWidth, vsSpacing }) => {
    const { t } = useTranslation('QuickClash')

    return (
      <MotionFlex
        align="center"
        justifyContent="center"
        direction="column"
        px={vsSpacing}
        width={vsSectionEffectiveWidth}
        flex="0 0 auto"
        my={{ base: 'auto', md: 0 }}
        py={2}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.3,
          },
        }}
      >
        <VStack spacing={{ base: 1.5, md: 2.5 }}>
          <MotionBox
            animate={{
              textShadow: [
                '0 0 6px rgba(0, 210, 255, 0.5), 0 0 12px rgba(0, 210, 255, 0.3)',
                '0 0 8px rgba(124, 58, 237, 0.5), 0 0 16px rgba(124, 58, 237, 0.3)',
                '0 0 6px rgba(0, 210, 255, 0.5), 0 0 12px rgba(0, 210, 255, 0.3)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Text
              fontFamily="'Orbitron', sans-serif"
              fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, cyan.400, purple.500, cyan.400)"
              bgClip="text"
              letterSpacing="1.5px"
              lineHeight="1"
            >
              VS
            </Text>
          </MotionBox>

          <MotionBox
            animate={{
              rotate: [0, 5, 0, -5, 0],
              filter: [
                'drop-shadow(0 0 6px rgba(124, 58, 237, 0.6))',
                'drop-shadow(0 0 8px rgba(124, 58, 237, 0.8))',
                'drop-shadow(0 0 6px rgba(124, 58, 237, 0.6))',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon
              as={Swords}
              boxSize={{ base: 4, md: 6, lg: 8 }}
              color="purple.300"
            />
          </MotionBox>

          <HStack spacing={{ base: 1, md: 1.5 }} mt={{ base: 0.5, md: 1 }}>
            <Badge
              bgGradient="linear(to-br, blue.700, blue.500)"
              color="white"
              border="1px solid"
              borderColor="blue.300"
              boxShadow="0 0 8px rgba(0, 123, 255, 0.3), inset 0 0 4px rgba(0, 123, 255, 0.2)"
              px={{ base: 1.5, md: 2 }}
              py={{ base: 0.5, md: 1 }}
              borderRadius="md"
              fontSize={{ base: 'sm', md: 'md' }}
              fontFamily="'Aldrich', sans-serif"
              fontWeight="bold"
              minW="30px"
              textAlign="center"
            >
              {leftTeam.wins}
            </Badge>
            <Text
              color="whiteAlpha.700"
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="bold"
              fontFamily="'Orbitron', sans-serif"
            >
              :
            </Text>
            <Badge
              bgGradient="linear(to-br, red.700, red.500)"
              color="white"
              border="1px solid"
              borderColor="red.300"
              boxShadow="0 0 8px rgba(255, 0, 0, 0.3), inset 0 0 4px rgba(255, 0, 0, 0.2)"
              px={{ base: 1.5, md: 2 }}
              py={{ base: 0.5, md: 1 }}
              borderRadius="md"
              fontSize={{ base: 'sm', md: 'md' }}
              fontFamily="'Aldrich', sans-serif"
              fontWeight="bold"
              minW="30px"
              textAlign="center"
            >
              {rightTeam.wins}
            </Badge>
          </HStack>
        </VStack>
      </MotionFlex>
    )
  },
)

VSSection.displayName = 'VSSection'

export default VSSection
