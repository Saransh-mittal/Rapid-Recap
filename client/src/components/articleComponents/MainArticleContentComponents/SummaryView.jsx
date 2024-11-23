import React from 'react'
import { Box } from '@chakra-ui/react'
import { processImportantSentences, highlightKeywords } from './TextProcessor'

const SummaryView = ({
  importantSentences,
  dictionary,
  isMobile,
  stableRef = { stableRef },
}) => {
  const processTextInOrder = text => {
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

  return (
    <Box as="ul" pl={0} spacing={4}>
      {importantSentences.map((sentence, index) => (
        <Box
          key={`sentence-${index}`}
          fontSize={isMobile ? 'md' : 'xl'}
          color="yellow.100"
          textShadow="0 1px 2px rgba(0,0,0,0.2)"
          lineHeight="tall"
        >
          {processTextInOrder(sentence)}
        </Box>
      ))}
    </Box>
  )
}

export default SummaryView
