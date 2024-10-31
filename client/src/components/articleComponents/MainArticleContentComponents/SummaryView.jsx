import React from 'react'
import { Box } from '@chakra-ui/react'
import {
  processTextWithBold,
  processImportantSentences,
  highlightKeywords,
} from './TextProcessor'

const SummaryView = ({
  importantSentences,
  dictionary,
  isMobile,
  onWordHover,
  onCloseTooltip,
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
      onWordHover,
      onCloseTooltip,
    )
  }

  return (
    <Box as="ul" styleType="none" pl={0} spacing={4}>
      {importantSentences.map((sentence, index) => (
        <Box
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
