import React from 'react'
import { Box } from '@chakra-ui/react'
import {
  processTextWithBold,
  processImportantSentences,
  highlightKeywords,
} from './TextProcessor'
import { checkContent, defaultCheckers } from './contentChecker'

const processTextInOrder = (
  text,
  dictionary,
  importantSentences,
  stableRef,
) => {
  const withImportantSentences = processImportantSentences(
    text,
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

const renderTextPart = (
  content,
  index,
  dictionary,
  importantSentences,
  stableRef,
) => (
  <Box key={`text-${index}`} mb={4}>
    {processTextInOrder(content, dictionary, importantSentences, stableRef)}
  </Box>
)

const renderNumberedPart = (
  number,
  content,
  index,
  dictionary,
  importantSentences,
  stableRef,
) => (
  <Box key={`numbered-${index}`} display="flex" alignItems="flex-start" mb={4}>
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
      {number}
    </Box>
    <Box flex="1" pt={1}>
      {processTextInOrder(content, dictionary, importantSentences, stableRef)}
    </Box>
  </Box>
)

const renderParts = (parts, dictionary, importantSentences, stableRef) => (
  <Box>
    {parts.map((part, index) =>
      part.type === 'numbered'
        ? renderNumberedPart(
            part.number,
            part.content,
            index,
            dictionary,
            importantSentences,
            stableRef,
          )
        : renderTextPart(
            part.content,
            index,
            dictionary,
            importantSentences,
            stableRef,
          ),
    )}
  </Box>
)

const NumberedContent = ({
  text,
  dictionary,
  importantSentences,
  stableRef = { stableRef: null },
  checkers = defaultCheckers,
}) => {
  if (!text) return null

  const parts = React.useMemo(
    () => checkContent(text, checkers),
    [text, checkers],
  )

  return renderParts(parts, dictionary, importantSentences, stableRef)
}

export default NumberedContent
