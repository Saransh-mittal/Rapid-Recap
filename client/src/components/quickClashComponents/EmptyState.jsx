import React from 'react'
import { Center, VStack, Box, Heading, Icon, Text } from '@chakra-ui/react'
import { Shield, Target, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionVStack = motion(VStack)
const MotionBox = motion(Box)

/**
 * Displays an empty state when no challenges are found
 */
const EmptyState = ({ filter }) => {
  const { t } = useTranslation('QuickClash')

  const getEmptyStateContent = () => {
    switch (filter) {
      case 'sent':
        return {
          icon: Shield,
          title: t('No Challenges Sent'),
          description: t('Challenge someone to a knowledge duel!'),
          color: 'blue.400',
        }
      case 'received':
        return {
          icon: Target,
          title: t('No Challenges Received'),
          description: t("You haven't received any challenges yet."),
          color: 'purple.400',
        }
      default:
        return {
          icon: Zap,
          title: t('No Active Challenges'),
          description: t('Create a new challenge to get started!'),
          color: 'yellow.400',
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <Center py={8}>
      <MotionVStack
        spacing={6}
        p={8}
        borderRadius="lg"
        bg="rgba(26, 32, 44, 0.8)"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 150,
            damping: 20,
          },
        }}
        maxW="90%"
        w="400px"
        textAlign="center"
        boxShadow="0 10px 30px rgba(0, 0, 0, 0.1)"
      >
        <MotionBox
          animate={{
            scale: [1, 1.1, 1],
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            },
          }}
        >
          <Icon as={content.icon} boxSize={12} color={content.color} />
        </MotionBox>

        <VStack spacing={2}>
          <Heading size="md" color="white" fontWeight="bold">
            {content.title}
          </Heading>
          <Text color="whiteAlpha.700" fontSize="sm">
            {content.description}
          </Text>
        </VStack>
      </MotionVStack>
    </Center>
  )
}

export default EmptyState
