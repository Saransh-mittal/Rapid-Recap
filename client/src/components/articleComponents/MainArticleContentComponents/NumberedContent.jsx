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
    const numberedPattern =
      /(\d+\.\s*(?:\*\*[^*]+\*\*[^.]*\.|\s*[^.]*\*\*[^*]+\*\*[^.]*\.))/g
    const matches = text?.match(numberedPattern)

    if (!matches) return processTextInOrder(text)

    const parts = text.split(numberedPattern)

    return parts.map((part, index) => {
      if (matches?.includes(part)) {
        const [number] = part.match(/\d+/) || []
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
              {number}
            </Box>
            <Box flex="1">
              {processTextInOrder(part.replace(/^\d+\.\s*/, ''))}
            </Box>
          </Box>
        )
      }
      return processTextInOrder(part)
    })
  }

  return formatNumberedText(text)
}

export default NumberedContent
