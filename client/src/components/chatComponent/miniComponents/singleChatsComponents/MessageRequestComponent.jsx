import React from 'react'
import { Box, Text, Button, VStack, HStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useFeatureDetection } from '../../../../utils/featureDetection'
import useSafeSound from '../../../../customHooks/useSafeSound'

const MessageRequestComponent = ({ senderName, onAccept, onReject }) => {
  const { t } = useTranslation('MessageRequestComponent')
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  return (
    <Box
      bg="rgba(255, 255, 255, 0.1)"
      borderRadius="lg"
      p={6}
      textAlign="center"
      color="white"
      maxW="300px"
      mx="auto"
      my={4}
    >
      <VStack spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          {t('acceptRequest', { senderName })}
        </Text>
        <Text fontSize="sm">{t('requestDescription')}</Text>
        <HStack spacing={4} width="100%">
          <Button
            colorScheme="red"
            onClick={() => {
              playClick()
              onReject()
            }}
            flexGrow={1}
          >
            {t('reject')}
          </Button>
          <Button
            colorScheme="green"
            onClick={() => {
              playClick()
              onAccept()
            }}
            flexGrow={1}
          >
            {t('accept')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}

export default MessageRequestComponent
