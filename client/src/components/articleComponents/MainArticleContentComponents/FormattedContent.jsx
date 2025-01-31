import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useContext,
} from 'react'
import { Box, Flex, Button, useMediaQuery, Text } from '@chakra-ui/react'
import DictTooltip from './DictTooltip'
import SummaryView from './SummaryView'
import NumberedContent from './NumberedContent'
import { HighlightedWordsContext } from '../../../contextAPI/MainArticleProvider'
import { useTranslation } from 'react-i18next'

const FormattedContent = React.memo(
  ({ mainText, themedContent, dictionary = [], importantSentences = [] }) => {
    const [selectedWord, setSelectedWord] = useState(null)
    const [tooltipPosition, setTooltipPosition] = useState(null)
    const [showOnlySummary, setShowOnlySummary] = useState(true)
    const [isMobile] = useMediaQuery('(max-width: 480px)')
    const { reset: resetHighlightedWords } = useContext(HighlightedWordsContext)
    const { t } = useTranslation('Sidebar')

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

    const toggleSummary = useCallback(() => {
      resetHighlightedWords()
      setShowOnlySummary(prev => !prev)
    }, [resetHighlightedWords])

    const { mainContent, bookingLine } = useMemo(() => {
      const content = themedContent || mainText
      if (!content || !Array.isArray(content)) {
        return { mainContent: [content], bookingLine: null }
      }

      const mainContentArr = []
      let bookingText = null

      content.forEach(item => {
        if (item.includes('Visit to book your tickets now:')) {
          // Extract just the "Visit to book your tickets now:" part
          bookingText = 'Visit to book your tickets now:'
        } else {
          mainContentArr.push(item)
        }
      })

      return { mainContent: mainContentArr, bookingLine: bookingText }
    }, [themedContent, mainText])

    const processedContent = useMemo(() => {
      if (!mainContent) return []

      const joinedContent = Array.isArray(mainContent)
        ? mainContent.join(' ')
        : mainContent
      const numberedPattern = /(?:\d+\.\s+[^.]+\.)/g
      const hasNumberedList = joinedContent.match(numberedPattern)?.length >= 3

      if (hasNumberedList) {
        return [joinedContent]
      }

      return Array.isArray(mainContent)
        ? [mainContent.join(' ')]
        : [mainContent]
    }, [mainContent])

    return (
      <Box position="relative">
        <Flex
          flexDirection={{ base: 'column', lg: 'row-reverse' }}
          alignItems={'flex-end'}
          gap={3}
          mb={6}
        >
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
            w={'fit-content'}
          >
            {showOnlySummary ? 'Show Full Article' : 'Show Key Points'}
          </Button>
          {showOnlySummary && (
            <Box
              mt={2}
              px={2}
              py={2}
              borderRadius="md"
              bg="rgba(128, 90, 213, 0.1)"
              backdropFilter="blur(8px)"
              boxShadow="0 2px 4px rgba(0,0,0,0.1)"
              animation="fadeIn 0.5s ease-in-out"
              sx={{
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateY(-10px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Text
                fontSize="sm"
                color="purple.200"
                fontStyle="italic"
                letterSpacing="wide"
              >
                ✨ {t('warningForSummary')}
              </Text>
            </Box>
          )}
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
            <>
              {processedContent.map((paragraph, index) => (
                <Box key={index} mb={6}>
                  <MemoizedNumberedContent
                    text={paragraph}
                    dictionary={dictionary}
                    importantSentences={importantSentences}
                    stableRef={stableRef}
                  />
                </Box>
              ))}

              {bookingLine && (
                <Box mt={6} pt={4}>
                  <MemoizedNumberedContent
                    text={bookingLine}
                    dictionary={dictionary}
                    importantSentences={importantSentences}
                    stableRef={stableRef}
                  />
                </Box>
              )}
            </>
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
