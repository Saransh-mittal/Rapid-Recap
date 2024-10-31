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
          key={index}
          as="li"
          p={6}
          mb={6}
          bg="linear-gradient(135deg, rgba(236, 201, 75, 0.08), rgba(236, 201, 75, 0.15))"
          borderRadius="xl"
          position="relative"
          boxShadow="0 4px 6px rgba(0,0,0,0.1)"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            bg: 'linear-gradient(to bottom, #F6E05E, #D69E2E)',
            borderRadius: '4px 0 0 4px',
          }}
          _hover={{
            transform: 'translateX(4px)',
            transition: 'all 0.3s ease',
          }}
        >
          <Box
            fontSize={isMobile ? 'md' : 'lg'}
            color="yellow.100"
            textShadow="0 1px 2px rgba(0,0,0,0.2)"
            lineHeight="tall"
          >
            {processTextInOrder(sentence)}
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default SummaryView
