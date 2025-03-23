// components/quickClashComponents/modals/newChallengeComponents/ModalHeader.jsx
import React from 'react'
import { Box, Progress, HStack, Text, Badge, Icon } from '@chakra-ui/react'
import { Users, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ModalHeader = ({ step, progressPercentage }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Box position="relative">
      <Progress
        value={progressPercentage}
        colorScheme="purple"
        size="xs"
        position="absolute"
        top="0"
        width="100%"
        borderRadius="0"
      />

      <Box pt={6} px={6}>
        <HStack>
          <Icon
            as={step === 1 ? Users : Target}
            color="purple.300"
            boxSize={5}
          />
          <Text fontWeight="bold" color="white">
            {step === 1
              ? t('Select Your Opponent')
              : t('Choose Battle Categories')}
          </Text>
        </HStack>

        {step === 2 && (
          <HStack mt={1}>
            <Badge
              colorScheme="purple"
              px={2}
              py={1}
              borderRadius="md"
              variant="solid"
            >
              {t('Step')} {step}/2
            </Badge>
            <Text fontSize="sm" color="whiteAlpha.700">
              {t('Select a category')}
            </Text>
          </HStack>
        )}
      </Box>
    </Box>
  )
}

export default ModalHeader
