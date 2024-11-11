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
    // First try the original bold-formatted pattern
    const boldPattern =
      /(?:\*\*(?!(?:19|20)\d{2})\d{1,2}\*\*|(?!(?:19|20)\d{2})\d{1,2})\.\s+\*\*[^*]+\*\*\s*-[^.]+\./g
    const boldMatches = text?.match(boldPattern)

    // If bold pattern matches, use original logic
    if (boldMatches?.length) {
      const parts = []
      let lastIndex = 0

      boldMatches.forEach(match => {
        const cleanMatch = match.trimLeft()
        const index = text.indexOf(cleanMatch, lastIndex)

        if (index > lastIndex) {
          parts.push({
            type: 'text',
            content: text.slice(lastIndex, index),
          })
        }

        const numberMatch = cleanMatch.match(/\d+/)
        const number = numberMatch ? numberMatch[0] : ''
        let content

        if (cleanMatch.startsWith('**')) {
          content = cleanMatch.replace(/^\*\*\d+\.\s+/, '').replace(/\*\*$/, '')
        } else {
          content = cleanMatch.replace(/^\d+\.\s+/, '').replace(/\.$/, '')
        }

        parts.push({
          type: 'numbered',
          number,
          content,
        })

        lastIndex = index + match.length
      })

      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex),
        })
      }

      return renderParts(parts)
    }

    // If no bold matches, try to find consecutive numbered steps
    const instructionalPattern =
      /(?!(?:19|20)\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b(\d{1,2})\.\s+([^.\n]+(?:\.[^.\n\d]+)*)/g
    const parts = []
    let lastIndex = 0
    let previousNumber = 0
    let hasConsecutiveNumbers = false
    let matches = [...text.matchAll(instructionalPattern)]

    matches.forEach((match, index) => {
      const [fullMatch, number, content] = match
      const currentNumber = parseInt(number)

      // Check if this is part of a consecutive sequence
      if (index === 0 || currentNumber === previousNumber + 1) {
        if (index === 1) hasConsecutiveNumbers = true

        const matchIndex = match.index

        // Add text before the numbered item
        if (matchIndex > lastIndex) {
          parts.push({
            type: 'text',
            content: text.slice(lastIndex, matchIndex),
          })
        }

        // Add the numbered item
        if (hasConsecutiveNumbers || index === 0) {
          parts.push({
            type: 'numbered',
            number: currentNumber.toString(),
            content: content.trim(),
          })
        }

        lastIndex = matchIndex + fullMatch.length
      }

      previousNumber = currentNumber
    })

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      })
    }

    // If we didn't find consecutive numbers, return the text as-is
    if (!hasConsecutiveNumbers && parts.length <= 2) {
      return processTextInOrder(text)
    }

    return renderParts(parts)
  }
  if (!text) return null
  const renderParts = parts => {
    return (
      <Box>
        {parts.map((part, index) => {
          if (part.type === 'numbered') {
            return (
              <Box
                key={`numbered-${index}`}
                display="flex"
                alignItems="flex-start"
                mb={4}
              >
                <Box
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
                <Box flex="1" pt={1}>
                  {processTextInOrder(part.content)}
                </Box>
              </Box>
            )
          }
          return (
            <Box key={`text-${index}`} mb={4}>
              {processTextInOrder(part.content)}
            </Box>
          )
        })}
      </Box>
    )
  }

  return formatNumberedText(text)
}

export default NumberedContent
