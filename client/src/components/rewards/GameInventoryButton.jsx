import {
  Badge,
  Box,
  Button,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { Package, Zap } from 'lucide-react'
import React from 'react'
import { motion } from 'framer-motion'
import GameInventory from './GameInventory'
import { useSelector } from 'react-redux'

const GameInventoryButton = ({ page }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { availableAbilities, activeAbilities } = useSelector(
    state => state.inventory,
  )
  const isScreenGreaterThan992 = useMediaQuery('(min-width: 992px)')[0]

  const hasActiveAbilities = activeAbilities.length > 0
  const hasAvailableAbilities = availableAbilities.length > 0

  // Shine animation variants
  const shineVariants = {
    shine: {
      boxShadow: [
        '0 0 20px rgba(251, 191, 36, 0.4)',
        '0 0 40px rgba(251, 191, 36, 0.7)',
        '0 0 60px rgba(251, 191, 36, 0.9)',
        '0 0 40px rgba(251, 191, 36, 0.7)',
        '0 0 20px rgba(251, 191, 36, 0.4)',
      ],
      scale: [1, 1.05, 1.1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    normal: {
      boxShadow: '0 0 0px rgba(147, 51, 234, 0)',
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  }

  // Pulse effect for active abilities
  const pulseVariants = {
    pulse: {
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    static: {
      opacity: 1,
    },
  }

  return (
    <>
      {/* Game Inventory Button */}
      <Box
        position="fixed"
        bottom={page === 'HOME' ? '20' : '14'}
        right="4"
        zIndex="999"
      >
        {/* Badges positioned relative to container, not button */}
        {/* Available Abilities Badge */}
        {hasAvailableAbilities && (
          <Badge
            as={motion.div}
            position="absolute"
            top="0"
            right="0"
            bg="red.500"
            color="white"
            rounded="full"
            w="4"
            h="4"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            fontWeight="bold"
            border="2px solid"
            borderColor="white"
            boxShadow="0 0 15px rgba(239, 68, 68, 0.8)"
            zIndex={1000}
            animate={{
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 15px rgba(239, 68, 68, 0.8)',
                '0 0 25px rgba(239, 68, 68, 1)',
                '0 0 15px rgba(239, 68, 68, 0.8)',
              ],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        <Button
          as={motion.button}
          onClick={onOpen}
          bgGradient={
            hasActiveAbilities
              ? 'linear(to-r, orange.400, yellow.500, orange.400)'
              : 'linear(to-r, blue.500, purple.500)'
          }
          _hover={{
            bgGradient: hasActiveAbilities
              ? 'linear(to-r, orange.500, yellow.600, orange.500)'
              : 'linear(to-r, blue.600, purple.600)',
            transform: 'scale(1.05)',
          }}
          color="white"
          position="relative"
          transition="all 0.3s"
          rounded="full"
          px="4"
          py="6"
          variants={hasActiveAbilities ? shineVariants : {}}
          animate={hasActiveAbilities ? 'shine' : 'normal'}
          overflow="hidden"
          border={hasActiveAbilities ? '2px solid' : '1px solid'}
          borderColor={hasActiveAbilities ? 'yellow.400' : 'transparent'}
          _before={
            hasActiveAbilities
              ? {
                  content: '""',
                  position: 'absolute',
                  inset: '-3px',
                  borderRadius: 'full',
                  background:
                    'linear-gradient(45deg, #f59e0b, #eab308, #f59e0b)',
                  filter: 'blur(12px)',
                  opacity: 0.8,
                  zIndex: -1,
                }
              : {}
          }
        >
          {/* Shimmer effect when active */}
          {hasActiveAbilities && (
            <Box
              as={motion.div}
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient="linear(to-r, transparent, rgba(255,215,0,0.6), transparent)"
              transform="translateX(-100%)"
              animate={{
                translateX: ['100%', '-100%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }}
              borderRadius="full"
            />
          )}

          {/* Main Icon */}
          <Box
            as={motion.div}
            variants={hasActiveAbilities ? pulseVariants : {}}
            animate={hasActiveAbilities ? 'pulse' : 'static'}
            display="flex"
            alignItems="center"
            gap={isScreenGreaterThan992 ? 2 : 0}
          >
            <Package
              size={24}
              style={{
                marginRight: isScreenGreaterThan992 ? '8px' : '0',
                color: 'white',
              }}
            />

            {isScreenGreaterThan992 && (
              <Box
                as={motion.span}
                color={hasActiveAbilities ? 'white' : 'white'}
                fontWeight={hasActiveAbilities ? 'bold' : 'normal'}
                textShadow={
                  hasActiveAbilities
                    ? '0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)'
                    : 'none'
                }
                fontSize={hasActiveAbilities ? 'md' : 'sm'}
                letterSpacing={hasActiveAbilities ? 'wide' : 'normal'}
              >
                Treasure Vault
              </Box>
            )}
          </Box>
        </Button>
      </Box>

      <GameInventory isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default GameInventoryButton
