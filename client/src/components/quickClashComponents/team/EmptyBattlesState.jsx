import React, { memo } from 'react'
import {
  Box,
  VStack,
  Button,
  Text,
  Icon,
  Center,
  Heading,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Swords,
  Trophy,
  ArrowRight,
  PlusCircle,
  Target,
} from 'lucide-react'

const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)
const MotionIcon = motion(Icon)

/**
 * Enhanced empty state with animated elements
 */
const EmptyBattlesState = memo(({ type = 'active', onCreateMatch }) => {
  const { t } = useTranslation('QuickClash')

  // Responsive styling
  const iconSize = useBreakpointValue({ base: 16, md: 24 })
  const padding = useBreakpointValue({ base: 6, md: 10 })
  const maxWidth = useBreakpointValue({ base: '300px', md: '450px' })
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const iconVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        delay: 0.3,
      },
    },
    float: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  const glowEffectVariants = {
    animate: {
      opacity: [0.3, 0.8, 0.3],
      scale: [0.9, 1.1, 0.9],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="enhanced-empty-battles-state"
      data-testid="empty-battles-state"
    >
      <MotionFlex
        variants={itemVariants}
        p={padding}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="purple.600"
        bgGradient="linear(to-b, rgba(76, 39, 143, 0.2), rgba(26, 32, 44, 0.4))"
        backdropFilter="blur(10px)"
        flexDirection="column"
        align="center"
        justify="center"
        minH="400px"
        position="relative"
        overflow="hidden"
      >
        {/* Background animated particles */}
        {[...Array(6)].map((_, i) => (
          <MotionBox
            key={i}
            position="absolute"
            borderRadius="full"
            bgGradient="linear(to-r, purple.500, pink.500)"
            opacity={0.2}
            animate={{
              x: [Math.random() * 300, Math.random() * -300],
              y: [Math.random() * 300, Math.random() * -300],
              scale: [Math.random() + 0.5, Math.random() + 1.5],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            h={`${Math.random() * 100 + 50}px`}
            w={`${Math.random() * 100 + 50}px`}
            filter="blur(30px)"
            zIndex={0}
          />
        ))}

        <VStack spacing={8} maxW={maxWidth} zIndex={1}>
          {/* Icon with glow effect */}
          <MotionBox position="relative">
            <MotionBox
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="120px"
              height="120px"
              borderRadius="full"
              bgGradient="linear(to-r, purple.500, pink.500)"
              filter="blur(25px)"
              opacity={0.5}
              variants={glowEffectVariants}
              animate="animate"
            />

            <MotionIcon
              as={type === 'active' ? Swords : Trophy}
              boxSize={iconSize}
              color="purple.300"
              variants={iconVariants}
              animate={['visible', 'float']}
              zIndex={2}
            />
          </MotionBox>

          <MotionBox variants={itemVariants} textAlign="center">
            <Heading
              size={headingSize}
              color="white"
              mb={3}
              bgGradient="linear(to-r, purple.300, pink.200)"
              bgClip="text"
            >
              {type === 'active'
                ? t('No Active Team Battles')
                : t('No Completed Team Battles')}
            </Heading>

            <Text
              color="whiteAlpha.800"
              fontSize={{ base: 'sm', md: 'md' }}
              lineHeight="1.7"
            >
              {type === 'active'
                ? t(
                    'Form your squad of 4 and challenge other teams to intense knowledge battles!',
                  )
                : t(
                    'Your battle history will appear here once you complete your first team match.',
                  )}
            </Text>
          </MotionBox>

          {type === 'active' && (
            <MotionButton
              as={motion.button}
              variants={itemVariants}
              leftIcon={<Icon as={Users} />}
              rightIcon={<Icon as={ArrowRight} />}
              colorScheme="purple"
              onClick={onCreateMatch}
              size="lg"
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
              {t('Create Your Team')}
            </MotionButton>
          )}
        </VStack>
      </MotionFlex>
    </MotionBox>
  )
})

EmptyBattlesState.displayName = 'EmptyBattlesState'

export default EmptyBattlesState
