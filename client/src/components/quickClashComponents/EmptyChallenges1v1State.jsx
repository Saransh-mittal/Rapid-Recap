import React, { memo } from 'react'
import {
  Box,
  VStack,
  Button,
  Text,
  Icon,
  Heading,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Target, PlusCircle, Trophy } from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)
const MotionIcon = motion(Icon)

const EmptyChallenges1v1State = memo(
  ({ type = 'active', onCreateChallenge, message, variant = 'default' }) => {
    const { t } = useTranslation('QuickClash')

    const isCompact = variant === 'compact'

    const iconSize = useBreakpointValue({
      base: isCompact ? 12 : 16,
      md: isCompact ? 16 : 24,
    })
    const padding = useBreakpointValue({
      base: isCompact ? 4 : 6,
      md: isCompact ? 6 : 10,
    })
    const maxWidth = useBreakpointValue({
      base: isCompact ? '280px' : '300px',
      md: isCompact ? '400px' : '450px',
    })
    const headingSizeChakra = useBreakpointValue({
      base: isCompact ? 'sm' : 'md',
      md: isCompact ? 'md' : 'lg',
    }) // Chakra heading sizes
    const minHeight = isCompact ? 'auto' : '380px' // Use 'auto' for compact, or a smaller fixed value like '200px' or '250px'
    const particleCount = isCompact ? 2 : 5 // Fewer particles for compact
    const particleBlur = isCompact ? '15px' : '25px'
    const particleSizeMultiplier = isCompact ? 0.6 : 1
    const glowWidth = isCompact ? '70px' : '110px' // Smaller glow
    const glowBlur = isCompact ? '15px' : '20px'
    const VStackSpacing = isCompact ? 4 : 7 // Tighter spacing for compact

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { delay: 0.1, staggerChildren: 0.05 },
      },
    }
    const itemVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    }
    const iconVariants = {
      hidden: { scale: 0.5, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 180, delay: 0.2 },
      },
      float: {
        y: [-6, 6, -6],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      },
    }
    const glowEffectVariants = {
      animate: {
        opacity: [0.2, 0.6, 0.2],
        scale: [0.8, 1, 0.8],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
      },
    }

    const mainIcon = type === 'active' ? Target : Trophy
    const defaultMessage =
      type === 'active'
        ? t(
            'emptyStates.noActive1v1Default',
            "It's a bit quiet here. Time to ignite some rivalries! Create a new 1v1 challenge or accept one from others.",
          )
        : t(
            'emptyStates.noCompleted1v1',
            'Your 1v1 duels and triumphs will be recorded here. Complete a match to see your history.',
          )

    return (
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`enhanced-empty-1v1-state ${isCompact ? 'compact' : ''}`}
        data-testid="empty-1v1-state"
        py={isCompact ? 3 : 8} // Less vertical padding for compact
        my={isCompact ? 2 : 0} // Add some margin for compact if needed
      >
        <MotionFlex
          variants={itemVariants}
          p={padding}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="purple.600"
          bgGradient="linear(to-b, rgba(76, 39, 143, 0.15), rgba(26, 32, 44, 0.3))" // Slightly less intense gradient for compact
          backdropFilter="blur(8px)" // Slightly less blur for compact
          flexDirection="column"
          align="center"
          justify="center"
          minH={minHeight}
          position="relative"
          overflow="hidden"
          mx="auto"
          maxW={{ base: '95%', md: isCompact ? '420px' : '500px' }} // Slightly adjusted max width
        >
          {[...Array(particleCount)].map((_, i) => (
            <MotionBox
              key={i}
              position="absolute"
              borderRadius="full"
              bgGradient="linear(to-r, purple.500, pink.500)"
              opacity={0.1} // Less opacity for particles in compact
              animate={{
                x: [
                  Math.random() * 200 * particleSizeMultiplier -
                    100 * particleSizeMultiplier,
                  Math.random() * -200 * particleSizeMultiplier +
                    100 * particleSizeMultiplier,
                ],
                y: [
                  Math.random() * 150 * particleSizeMultiplier -
                    75 * particleSizeMultiplier,
                  Math.random() * -150 * particleSizeMultiplier +
                    75 * particleSizeMultiplier,
                ],
                scale: [
                  Math.random() * 0.7 * particleSizeMultiplier +
                    0.4 * particleSizeMultiplier,
                  Math.random() * 1.1 * particleSizeMultiplier +
                    0.7 * particleSizeMultiplier,
                ],
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              h={`${(Math.random() * 60 + 30) * particleSizeMultiplier}px`} // Smaller particles
              w={`${(Math.random() * 60 + 30) * particleSizeMultiplier}px`}
              filter={`blur(${particleBlur})`}
              zIndex={0}
            />
          ))}

          <VStack spacing={VStackSpacing} maxW={maxWidth} zIndex={1}>
            <MotionBox position="relative">
              <MotionBox
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width={glowWidth}
                height={glowWidth}
                borderRadius="full"
                bgGradient="linear(to-r, purple.500, pink.500)"
                filter={`blur(${glowBlur})`}
                opacity={0.4}
                variants={glowEffectVariants}
                animate="animate"
              />
              <MotionIcon
                as={mainIcon}
                boxSize={iconSize}
                color="purple.300"
                variants={iconVariants}
                animate={['visible', 'float']}
                zIndex={2}
              />
            </MotionBox>

            <MotionBox variants={itemVariants} textAlign="center">
              <Heading
                size={headingSizeChakra}
                color="white"
                mb={isCompact ? 1 : 3}
                bgGradient="linear(to-r, purple.300, pink.200)"
                bgClip="text"
              >
                {/* You could customize the title too based on variant if needed */}
                {type === 'active'
                  ? t('No Active 1v1 Challenges')
                  : t('No Completed 1v1 Challenges')}
              </Heading>
              <Text
                color="whiteAlpha.800"
                fontSize={{ base: 'xs', md: isCompact ? 'sm' : 'md' }}
                lineHeight="1.6"
              >
                {message || defaultMessage}
              </Text>
            </MotionBox>

            {variant === 'default' &&
              type === 'active' &&
              onCreateChallenge && (
                <MotionButton
                  as={motion.button}
                  variants={itemVariants}
                  leftIcon={<Icon as={PlusCircle} />}
                  colorScheme="purple"
                  onClick={onCreateChallenge}
                  size={'lg'} // Keep lg for default, or make it responsive
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 20px rgba(128, 90, 213, 0.6)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  bg="linear-gradient(135deg, #6B46C1 0%, #B794F4 100%)"
                  _hover={{
                    bg: 'linear-gradient(135deg, #805AD5 0%, #D6BCFA 100%)',
                  }}
                  _active={{
                    bg: 'linear-gradient(135deg, #6B46C1 0%, #B794F4 100%)',
                  }}
                  boxShadow="0 5px 15px rgba(128, 90, 213, 0.4)"
                >
                  {t('Create 1v1 Challenge')}
                </MotionButton>
              )}
          </VStack>
        </MotionFlex>
      </MotionBox>
    )
  },
)

EmptyChallenges1v1State.displayName = 'EmptyChallenges1v1State'

export default EmptyChallenges1v1State
