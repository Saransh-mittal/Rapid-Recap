import React, { memo } from 'react'
import { Box, HStack, Text, Icon } from '@chakra-ui/react'
import { Quote, MessageCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)
const MotionIcon = motion(Icon)

const CommentSection = ({ comment, commentIcon, themeColors }) => {
  if (!comment) return null

  return (
    <MotionBox
      px={2.5}
      py={1.5}
      borderRadius="md"
      bg={themeColors.commentBg}
      borderLeftWidth="2px"
      borderLeftColor={themeColors.commentBorder}
      boxShadow="inset 0 1px 3px rgba(0, 0, 0, 0.2)"
      overflow="hidden"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <HStack spacing={1.5} align="flex-start">
        <MotionIcon
          as={commentIcon}
          color={themeColors.primaryColor}
          boxSize={3}
          mt="2px"
          animate={{ rotate: [-5, 0, 5, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <Text
          color="whiteAlpha.950"
          fontStyle="italic"
          fontWeight="medium"
          fontSize="xs"
          letterSpacing="0.02em"
          lineHeight="1.4"
          fontFamily="Georgia, serif"
          textShadow="0 1px 2px rgba(0, 0, 0, 0.3)"
        >
          {comment}
        </Text>
      </HStack>
    </MotionBox>
  )
}

// Helper to select appropriate comment icon
export const getCommentIcon = (text, engagement) => {
  if (!text) return Quote
  if (text === engagement?.wittyAnalysis) return Quote
  if (text === engagement?.competitiveTaunt) return MessageCircle
  if (text === engagement?.victoryMeme) return Star
  return Quote
}

// Helper to find the shortest comment
export const findShortestComment = (engagement, userIsWinner) => {
  if (!engagement) return null

  const comments = [
    engagement.wittyAnalysis,
    engagement.competitiveTaunt,
    userIsWinner && engagement.victoryMeme,
  ].filter(Boolean)

  if (comments.length === 0) return null

  let shortest = comments[0]
  let shortestLength = shortest ? shortest.length : Infinity

  comments.forEach(comment => {
    if (comment && comment.length < shortestLength) {
      shortest = comment
      shortestLength = comment.length
    }
  })

  return shortest
}

export default memo(CommentSection)
