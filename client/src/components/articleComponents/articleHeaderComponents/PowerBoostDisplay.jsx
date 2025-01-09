import React, { useMemo } from 'react'
import { Box, Flex, Text, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Star, Zap, Crown } from 'lucide-react'
import { useSelector } from 'react-redux'

const BoostCard = ({ icon: Icon, title, isActive, onClick }) => {
  return (
    <Box
      onClick={onClick}
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 25px rgba(147, 51, 234, 0.4)',
      }}
      position="relative"
      w={{ base: '65px', sm: '90px' }}
      h={{ base: '65px', sm: '90px' }}
      borderRadius="xl"
      overflow="hidden"
      bg={
        isActive
          ? 'linear-gradient(135deg, #6366F1 0%, #9333EA 50%, #7C3AED 100%)'
          : 'linear-gradient(135deg, #2D3748 0%, #4A5568 100%)'
      }
      transition="all 0.3s ease"
    >
      {isActive && (
        <Box
          as={motion.div}
          position="absolute"
          inset="2px"
          borderRadius="lg"
          border="2px solid"
          borderColor="rgba(255, 215, 0, 0.6)"
          zIndex={2}
          animate={{
            borderColor: [
              'rgba(255, 215, 0, 0.6)',
              'rgba(255, 215, 0, 0.9)',
              'rgba(255, 215, 0, 0.6)',
            ],
            boxShadow: [
              'inset 0 0 10px rgba(255, 215, 0, 0.3)',
              'inset 0 0 20px rgba(255, 215, 0, 0.5)',
              'inset 0 0 10px rgba(255, 215, 0, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {isActive && (
        <>
          <Box
            as={motion.div}
            position="absolute"
            inset="-2px"
            borderRadius="xl"
            animate={{
              boxShadow: [
                '0 0 15px rgba(255, 215, 0, 0.4)',
                '0 0 30px rgba(255, 215, 0, 0.6)',
                '0 0 15px rgba(255, 215, 0, 0.4)',
              ],
              border: [
                '2px solid rgba(255, 215, 0, 0.4)',
                '2px solid rgba(255, 215, 0, 0.8)',
                '2px solid rgba(255, 215, 0, 0.4)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <Box
            as={motion.div}
            position="absolute"
            inset={0}
            animate={{
              background: [
                'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 70%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        p={{ base: 2, sm: 3 }}
        bg={
          isActive
            ? 'linear-gradient(165deg, rgba(99, 102, 241, 0.95) 0%, rgba(147, 51, 234, 0.95) 100%)'
            : 'linear-gradient(165deg, rgba(45, 55, 72, 0.9) 0%, rgba(74, 85, 104, 0.9) 100%)'
        }
        borderTop="1px solid rgba(255, 255, 255, 0.3)"
        position="relative"
      >
        <Box
          as={motion.div}
          mb={1}
          color="white"
          animate={
            isActive
              ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                  filter: [
                    'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))',
                    'drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))',
                    'drop-shadow(0 0 10px rgba(255, 215, 0, 0.4))',
                  ],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={20} strokeWidth={2} />
        </Box>

        <Text
          fontSize={{ base: 'xs', sm: 'sm' }}
          fontWeight="bold"
          color="white"
          textAlign="center"
          letterSpacing="wide"
          textShadow={
            isActive
              ? '0 0 15px rgba(255, 215, 0, 0.6)'
              : '0 1px 2px rgba(0, 0, 0, 0.2)'
          }
          as={motion.p}
          animate={
            isActive
              ? {
                  opacity: [0.8, 1, 0.8],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {title}
        </Text>
      </Flex>
    </Box>
  )
}

const DecorativeFrame = () => {
  return (
    <Box
      position="absolute"
      inset="-2px"
      borderRadius="2xl"
      overflow="hidden"
      zIndex={0}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          background: [
            'linear-gradient(45deg, rgba(167, 139, 250, 0.4), rgba(99, 102, 241, 0.4))',
            'linear-gradient(45deg, rgba(99, 102, 241, 0.4), rgba(167, 139, 250, 0.4))',
            'linear-gradient(45deg, rgba(167, 139, 250, 0.4), rgba(99, 102, 241, 0.4))',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          inset: 0,
          filter: 'blur(8px)',
        }}
      />
      <Box
        position="absolute"
        inset={0}
        border="2px solid"
        borderColor="rgba(167, 139, 250, 0.3)"
        borderRadius="2xl"
      />
    </Box>
  )
}

const PowerBoostDisplay = ({
  categoryBoost,
  openModal,
  openStreakSurgeModal,
}) => {
  const { isBoosted } = useSelector(state => state.app)
  const { isQuinBoostAvailable } = useSelector(state => state.quiz)
  console.log(isQuinBoostAvailable)

  const multiplier = useMemo(() => {
    const activeBoosts = [
      isBoosted,
      isQuinBoostAvailable,
      categoryBoost,
    ].filter(Boolean).length
    if (activeBoosts === 1) return '1.5X'
    if (activeBoosts === 2) return '1.75X'
    if (activeBoosts === 3) return '2X'
    return null
  }, [isBoosted, isQuinBoostAvailable, categoryBoost])

  return (
    <Box
      position="relative"
      py={6}
      px={4}
      borderRadius="2xl"
      maxW={{ base: '300px', sm: '400px' }}
      mx="auto"
      bg="rgba(30, 30, 40, 0.6)"
      backdropFilter="blur(10px)"
      as={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <DecorativeFrame />

      <Flex align="center" gap={3} mb={4} justify="center">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            filter: [
              'drop-shadow(0 0 8px rgba(167, 139, 250, 0.4))',
              'drop-shadow(0 0 12px rgba(167, 139, 250, 0.6))',
              'drop-shadow(0 0 8px rgba(167, 139, 250, 0.4))',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Crown size={24} color="#A78BFA" />
        </motion.div>
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="whiteAlpha.900"
          letterSpacing="wide"
          as={motion.p}
          animate={{
            textShadow: [
              '0 0 10px rgba(167, 139, 250, 0.2)',
              '0 0 15px rgba(167, 139, 250, 0.4)',
              '0 0 10px rgba(167, 139, 250, 0.2)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          POWER BOOSTS
        </Text>
        {multiplier && (
          <Box
            as={motion.div}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Text
              as={motion.span}
              display="inline-block"
              fontSize="lg"
              fontWeight="extrabold"
              bgGradient="linear(to-r, yellow.300, orange.300, purple.300)"
              bgClip="text"
              pl={2}
              animate={{
                filter: [
                  'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))',
                  'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))',
                  'drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))',
                ],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {multiplier}
            </Text>
          </Box>
        )}
      </Flex>

      <HStack spacing={4} justify="center">
        <BoostCard
          icon={Star}
          title="Streak Surge"
          isActive={isBoosted}
          onClick={openStreakSurgeModal}
        />
        <BoostCard
          icon={Zap}
          title="Quin Boost"
          isActive={isQuinBoostAvailable}
          onClick={openModal}
        />
        {categoryBoost !== undefined && (
          <BoostCard
            icon={Crown}
            title="Category Boost"
            isActive={categoryBoost}
          />
        )}
      </HStack>
    </Box>
  )
}

export default PowerBoostDisplay
