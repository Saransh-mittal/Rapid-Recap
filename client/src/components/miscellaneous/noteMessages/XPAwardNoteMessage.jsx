import React from 'react'
import { Text, VStack, HStack } from '@chakra-ui/react'

import NoteMessage from '../NoteMessage'
import TrophySVG from '../../../assets/svg/TrophySVG'

const XPAwardNoteMessage = ({
  messageId,
  xpAwarded,
  quizName,
  onClose,
  duration,
  width = '320px',
}) => {
  const customContent = (
    <VStack spacing={3} align="center">
      <TrophySVG height={'50px'} width={'50px'} />
      <Text fontSize="2xl" fontWeight="bold">
        Congratulations!
      </Text>
      <Text>You've completed the quiz:</Text>
      <Text fontWeight="bold">{quizName}</Text>
      <HStack>
        <Text>You've earned:</Text>
        <Text fontSize="xl" fontWeight="bold" color="green.400">
          {xpAwarded} XP
        </Text>
      </HStack>
    </VStack>
  )

  return (
    <NoteMessage
      messageId={messageId}
      title="Quiz Completed"
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
