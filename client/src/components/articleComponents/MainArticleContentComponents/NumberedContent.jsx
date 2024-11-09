import React from 'react'
import { Box } from '@chakra-ui/react'
import {
  processTextWithBold,
  processImportantSentences,
  highlightKeywords,
} from './TextProcessor'

const NumberedContent = ({
  text,
  dictionary,
  importantSentences,
  stableRef = { stableRef },
}) => {
  const processTextInOrder = text => {
    const withBoldText = processTextWithBold(text)
    const withImportantSentences = processImportantSentences(
      withBoldText,
      importantSentences,
    )
    return highlightKeywords(
      withImportantSentences,
      dictionary,
      null,
      null,
      stableRef,
    )
  }

  const formatNumberedText = text => {
    // Updated regex to match only numbered points that start lines or follow line breaks
    // It will match both bolded and unbolded numbered points while excluding years and other numbers
    const numberedPattern = /(?:\*\*\d+\*\*|\d+)\.\s+\*\*[^*]+\*\*\s*-[^.]+\./g
    const matches = text?.match(numberedPattern)

    if (!matches) return processTextInOrder(text)

    const parts = []
    let lastIndex = 0

    matches.forEach(match => {
      // Remove any leading whitespace or newline characters when finding the index
      const cleanMatch = match.trimLeft()
      const index = text.indexOf(cleanMatch, lastIndex)

      // Add text before the numbered point
      if (index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, index),
        })
      }

      // Extract number and content
      const numberMatch = cleanMatch.match(/\d+/)
      const number = numberMatch ? numberMatch[0] : ''
      let content

      if (cleanMatch.startsWith('**')) {
        // Handle bolded format
        content = cleanMatch.replace(/^\*\*\d+\.\s+/, '').replace(/\*\*$/, '')
      } else {
        // Handle unbolded format
        content = cleanMatch.replace(/^\d+\.\s+/, '').replace(/\.$/, '')
      }

      parts.push({
        type: 'numbered',
        number,
        content,
      })

      lastIndex = index + match.length
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      })
    }

    return parts.map((part, index) => {
      if (part.type === 'numbered') {
        return (
          <Box
            key={`numbered-${index}`}
            as="div"
            display="flex"
            alignItems="flex-start"
            mb={4}
          >
            <Box
              as="span"
              minWidth="2rem"
              height="2rem"
              lineHeight="2rem"
              textAlign="center"
              borderRadius="full"
              bg="purple.500"
              color="white"
              fontSize="sm"
              fontWeight="bold"
              mr={3}
              mt={1}
            >
              {part.number}
            </Box>
            <Box flex="1">{processTextInOrder(part.content)}</Box>
          </Box>
        )
      }
      return processTextInOrder(part.content)
    })
  }

  return formatNumberedText(text)
}

export default NumberedContent
