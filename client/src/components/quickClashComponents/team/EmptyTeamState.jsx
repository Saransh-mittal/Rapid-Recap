// components/quickClashComponents/team/EmptyTeamState.jsx
import React from 'react'
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  Flex,
  Center,
  Heading,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, PlusCircle } from 'lucide-react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Component to display when the user has no teams
 */
const EmptyTeamState = ({ onCreateTeam, onJoinTeam }) => {
  const { t } = useTranslation('QuickClash')

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="initial"
      animate="animate"
      py={12}
      px={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      borderStyle="dashed"
      bg="rgba(26, 32, 44, 0.4)"
      boxShadow="inner"
    >
      <Center>
        <VStack spacing={6} maxW="md" textAlign="center">
          <MotionBox
            variants={itemVariants}
            bg="rgba(128, 90, 213, 0.2)"
            p={5}
            borderRadius="full"
            boxShadow="0 0 20px rgba(128, 90, 213, 0.3)"
          >
            <Icon as={Users} boxSize={10} color="purple.400" />
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <Heading size="lg" mb={2} color="white">
              {t('No Teams Yet')}
            </Heading>
            <Text color="whiteAlpha.800">
              {t(
                'Create a team to challenge other players or join an existing team with your friends',
              )}
            </Text>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <Flex
              gap={4}
              direction={{ base: 'column', sm: 'row' }}
              justify="center"
              align="center"
              w="100%"
            >
              <MotionButton
                leftIcon={<PlusCircle size={18} />}
                colorScheme="purple"
                size="lg"
                onClick={onCreateTeam}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                px={8}
                variant="solid"
              >
                {t('Create Team')}
              </MotionButton>

              <MotionButton
                leftIcon={<UserPlus size={18} />}
                colorScheme="blue"
                size="lg"
                onClick={onJoinTeam}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                px={8}
                variant="outline"
              >
                {t('Join Team')}
              </MotionButton>
            </Flex>
          </MotionBox>

          <MotionBox variants={itemVariants}>
            <Text fontSize="sm" color="whiteAlpha.600">
              {t(
                'Teams let you participate in 4v4 battles with your friends against other teams',
              )}
            </Text>
          </MotionBox>
        </VStack>
      </Center>
    </MotionBox>
  )
}

export default EmptyTeamState
