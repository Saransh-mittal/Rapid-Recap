import React from 'react'
import { Text, HStack, VStack, Box, Flex } from '@chakra-ui/react'
import NoteMessage from '../NoteMessage'
import TrophySVG from '../../../assets/svg/TrophySVG'

const XPAwardNoteMessage = ({
  messageId,
  xpAwarded,
  title,
  onClose,
  duration,
  width = '320px',
}) => {
  const customContent = (
    <Flex direction="column" align="center" w="100%">
      <Box
        bg="yellow.400"
        borderRadius="full"
        p={2}
        mb={3}
        boxShadow="0 0 15px rgba(255, 255, 0, 0.3)"
      >
        <TrophySVG height="40px" width="40px" />
      </Box>
      <VStack spacing={1} align="center" w="100%">
        <Text fontSize="md" fontWeight="medium" color="gray.300">
          Quiz Completed
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="white"
          noOfLines={2}
          textAlign="center"
        >
          {title}
        </Text>
        <Box
          mt={2}
          bg="green.500"
          px={4}
          py={1}
          borderRadius="full"
          boxShadow="0 0 10px rgba(72, 187, 120, 0.5)"
        >
          <Text fontSize="xl" fontWeight="bold" color="white">
            +{xpAwarded} XP
          </Text>
        </Box>
      </VStack>
    </Flex>
  )

  return (
    <NoteMessage
      messageId={messageId}
      title="Achievement Unlocked"
      customContent={customContent}
      onClose={onClose}
      duration={duration}
      width={width}
      actions={[
        {
          text: 'View Experience',
          actionType: 'VIEW_EXPERIENCE',
        },
      ]}
    />
  )
}

export default XPAwardNoteMessage
