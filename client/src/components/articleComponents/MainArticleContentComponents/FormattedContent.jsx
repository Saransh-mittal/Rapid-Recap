import React, { useState } from 'react'
import { Box, Flex, Button, useMediaQuery } from '@chakra-ui/react'
import DictTooltip from './DictTooltip'

import SummaryView from './SummaryView'
import NumberedContent from './NumberedContent'

const FormattedContent = ({
  mainText,
  themedContent,
  dictionary = [],
  importantSentences = [],
}) => {
  const [selectedWord, setSelectedWord] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState(null)
  const [showOnlySummary, setShowOnlySummary] = useState(false)
  const [isMobile] = useMediaQuery('(max-width: 480px)')

  const handleWordHover = (word, event) => {
    event.stopPropagation()
    // If clicking the same word that's already selected, close the tooltip
    if (word === selectedWord) {
      setSelectedWord(null)
      setTooltipPosition(null)
      return
    }

    // Otherwise, show tooltip for the new word
    const rect = event.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom,
      sourceTop: rect.top,
    })
    setSelectedWord(word)
  }

  const closeTooltip = () => {
    setSelectedWord(null)
    setTooltipPosition(null)
  }

  const content = themedContent || mainText
  let processedContent
  if (Array.isArray(content)) {
    const joinedContent = content.join(' ')
    const numberedPattern =
      /(\d+\.\s*(?:\*\*[^*]+\*\*[^.]*\.|\s*[^.]*\*\*[^*]+\*\*[^.]*\.))/g
    if (joinedContent.match(numberedPattern)) {
      processedContent = [joinedContent]
    } else {
      processedContent = content
    }
  } else {
    processedContent = [content]
  }

  return (
    <Box position="relative">
      <Flex justifyContent="flex-end" mb={6}>
        <Button
          onClick={() => setShowOnlySummary(!showOnlySummary)}
          size={isMobile ? 'sm' : 'md'}
          bg={showOnlySummary ? 'purple.500' : 'whiteAlpha.200'}
          color={showOnlySummary ? 'white' : 'purple.200'}
          _hover={{
            bg: showOnlySummary ? 'purple.600' : 'whiteAlpha.300',
            transform: 'translateY(-1px)',
          }}
          transition="all 0.3s ease"
          boxShadow="0 2px 4px rgba(0,0,0,0.1)"
        >
          {showOnlySummary ? 'Show Full Article' : 'Show Key Points'}
        </Button>
      </Flex>

      <Box
        position="relative"
        color="gray.100"
        lineHeight="tall"
        sx={{
          '& > *': {
            transition: 'all 0.3s ease',
          },
        }}
      >
        {showOnlySummary ? (
          <SummaryView
            importantSentences={importantSentences}
            dictionary={dictionary}
            isMobile={isMobile}
            onWordHover={handleWordHover}
            onCloseTooltip={closeTooltip}
          />
        ) : (
          processedContent.map((paragraph, index) => (
            <Box key={index} mb={6}>
              <NumberedContent
                text={paragraph}
                dictionary={dictionary}
                importantSentences={importantSentences}
                onWordHover={handleWordHover}
                onCloseTooltip={closeTooltip}
              />
            </Box>
          ))
        )}

        {selectedWord && (
          <DictTooltip
            word={selectedWord}
            definition={
              dictionary.find(entry => entry.word === selectedWord)?.definition
            }
            position={tooltipPosition}
            onClose={closeTooltip}
          />
        )}
      </Box>
    </Box>
  )
}

export default FormattedContent
