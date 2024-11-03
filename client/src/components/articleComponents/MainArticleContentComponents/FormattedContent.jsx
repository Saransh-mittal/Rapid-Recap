import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from 'react'
import { Box, Flex, Button, useMediaQuery } from '@chakra-ui/react'
import DictTooltip from './DictTooltip'
import SummaryView from './SummaryView'
import NumberedContent from './NumberedContent'
import { HighlightedWordsContext } from '../../../contextAPI/MainArticleProvider'

const FormattedContent = React.memo(
  ({ mainText, themedContent, dictionary = [], importantSentences = [] }) => {
    const [selectedWord, setSelectedWord] = useState(null)
    const [tooltipPosition, setTooltipPosition] = useState(null)
    const [showOnlySummary, setShowOnlySummary] = useState(false)
    const [isMobile] = useMediaQuery('(max-width: 480px)')
    const { reset: resetHighlightedWords } = useContext(HighlightedWordsContext)
    // Create a stable ref for event handlers
    const stableRef = useRef({
      handleMouseEnter: (e, word) => {
        if (!('ontouchstart' in window)) {
          e.preventDefault()
          const rect = e.target.getBoundingClientRect()
          setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.bottom,
            sourceTop: rect.top,
          })
          setSelectedWord(word)
        }
      },
      handleMouseLeave: () => {
        if (!('ontouchstart' in window)) {
          setSelectedWord(null)
          setTooltipPosition(null)
        }
      },
      handleTouchStart: (e, word) => {
        e.preventDefault()
        const rect = e.target.getBoundingClientRect()
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom,
          sourceTop: rect.top,
        })
        setSelectedWord(word)
      },
    })

    // Fixed toggleSummary with proper dependency
    const toggleSummary = useCallback(() => {
      resetHighlightedWords()
      setShowOnlySummary(prev => !prev)
    }, [resetHighlightedWords])

    const processedContent = useMemo(() => {
      const content = themedContent || mainText
      if (content && Array.isArray(content)) {
        const joinedContent = content.join(' ')
        // Updated pattern to match numbered lists with or without bold markers
        const numberedPattern = /(?:\d+\.\s+[^.]+\.)/g
        const hasNumberedList =
          joinedContent.match(numberedPattern)?.length >= 3 // Check if there are at least 3 numbered points
        if (hasNumberedList) {
          return [joinedContent]
        }
        return content
      }
      return [content]
    }, [themedContent, mainText])

    return (
      <Box position="relative">
        <Flex justifyContent="flex-end" mb={6}>
          <Button
            onClick={toggleSummary}
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
            <MemoizedSummaryView
              importantSentences={importantSentences}
              dictionary={dictionary}
              isMobile={isMobile}
              stableRef={stableRef}
            />
          ) : (
            processedContent.map((paragraph, index) => (
              <Box key={index} mb={6}>
                <MemoizedNumberedContent
                  text={paragraph}
                  dictionary={dictionary}
                  importantSentences={importantSentences}
                  stableRef={stableRef}
                />
              </Box>
            ))
          )}

          {selectedWord && (
            <DictTooltip
              word={selectedWord}
              definition={
                dictionary.find(entry => entry.word === selectedWord)
                  ?.definition
              }
              position={tooltipPosition}
              onClose={() => {
                setSelectedWord(null)
                setTooltipPosition(null)
              }}
            />
          )}
        </Box>
      </Box>
    )
  },
)

// Memoize the child components
const MemoizedSummaryView = React.memo(SummaryView)
const MemoizedNumberedContent = React.memo(NumberedContent)

FormattedContent.displayName = 'FormattedContent'

export default FormattedContent
