// components/quickClashComponents/team/EmptyBattlesState.jsx
import React from 'react'
import {
  Box,
  VStack,
  Button,
  Text,
  Icon,
  Center,
  Heading,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, Swords, Target, ArrowRight, Trophy } from 'lucide-react'

const MotionBox = motion(Box)
const MotionButton = motion(Button)

/**
 * Component shown when there are no team battles
 */
const EmptyBattlesState = ({ type = 'active', onCreateMatch }) => {
  const { t } = useTranslation('QuickClash')

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  }

  return (
    <MotionBox variants={containerVariants} initial="hidden" animate="visible">
      <Center
        p={10}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        bg="rgba(26, 32, 44, 0.6)"
        flexDirection="column"
        h="400px"
      >
        <VStack spacing={6} maxW="400px">
          <Icon
            as={type === 'active' ? Swords : Trophy}
            boxSize={16}
            color="purple.400"
            opacity={0.8}
          />

          <Heading size="md" color="white" textAlign="center">
            {type === 'active'
              ? t('No Active Team Battles')
              : t('No Completed Team Battles')}
          </Heading>

          <Text color="whiteAlpha.700" textAlign="center">
            {type === 'active'
              ? t(
                  'Create a team or join an existing one, then start a team battle to challenge other teams!',
                )
              : t(
                  'Your completed team battles will be shown here. Start a battle to see results here.',
                )}
          </Text>

          {type === 'active' && (
            <MotionButton
              leftIcon={<Icon as={Users} />}
              rightIcon={<Icon as={ArrowRight} />}
              colorScheme="purple"
              onClick={onCreateMatch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('Go to Teams')}
            </MotionButton>
          )}
        </VStack>
      </Center>
    </MotionBox>
  )
}

export default EmptyBattlesState
