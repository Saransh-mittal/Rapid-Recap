// client/src/components/articleComponents/MainArticleContentComponents/TextProcessor.jsx
// FIXED VERSION: Better text processing with pagination-friendly formatting

import React from 'react'
import { Box } from '@chakra-ui/react'
import { HighlightedWordsContext } from '../../../contextAPI/MainArticleProvider'

const DictionaryWord = React.memo(({ word, part, stableRef }) => {
  const { handleMouseEnter, handleMouseLeave, handleTouchStart } =
    stableRef.current

  return (
    <Box
      as="span"
      display="inline-block"
      px={2}
      py={1}
      mx={1}
      bg="linear-gradient(135deg, rgba(159, 122, 234, 0.15), rgba(159, 122, 234, 0.25))"
      color="purple.200"
      borderRadius="md"
      boxShadow="0 2px 4px rgba(0,0,0,0.2)"
      cursor="pointer"
      position="relative"
      transition="all 0.3s ease"
      data-dictionary-word={word}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'purple.400',
        opacity: 0.3,
      }}
      _hover={{
        transform: 'translateY(-1px)',
        bg: 'linear-gradient(135deg, rgba(159, 122, 234, 0.25), rgba(159, 122, 234, 0.35))',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        color: 'purple.100',
      }}
      onMouseEnter={e => handleMouseEnter(e, word)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={e => handleTouchStart(e, word)}
    >
      {part}
    </Box>
  )
})

const applyDictionaryHighlights = (
  text,
  dictionary,
  onWordHover,
  closeTooltip,
  highlightedWords,
  stableRef,
) => {
  if (!text || typeof text !== 'string') return text

  let result = [text]
  const sortedDictionary = [...dictionary].sort(
    (a, b) => b?.word?.length - a?.word?.length,
  )

  sortedDictionary.forEach(({ word }) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const wordPattern = `(?<=^|\\s)(${escapedWord})(?=\\s|$|\\.)`
    const regex = new RegExp(wordPattern, 'gui')

    result = result.flatMap(segment => {
      if (typeof segment !== 'string') return [segment]

      const matches = segment.match(regex)
      const wordLower = word.toLowerCase()

      if (matches && !highlightedWords.has(wordLower)) {
        highlightedWords.add(wordLower)

        const parts = segment.split(regex)

        return parts.reduce((acc, part, index) => {
          if (matches.includes(part)) {
            return [
              ...acc,
              <DictionaryWord
                key={`dict-${word}-${index}-${part}`}
                word={word}
                part={part}
                stableRef={stableRef}
              />,
            ]
          }
          return [...acc, part]
        }, [])
      }
      return [segment]
    })
  })

  return result.flat()
}

const HighlightedContent = React.memo(({ content, dictionary, stableRef }) => {
  const { words: highlightedWords } = React.useContext(HighlightedWordsContext)

  const processNode = React.useCallback(
    node => {
      if (React.isValidElement(node)) {
        return React.cloneElement(node, {
          children: processNode(node.props.children),
        })
      }
      if (Array.isArray(node)) {
        return node.map((item, index) => processNode(item))
      }
      if (typeof node === 'string') {
        return applyDictionaryHighlights(
          node,
          dictionary,
          null,
          null,
          highlightedWords,
          stableRef,
        )
      }
      return node
    },
    [dictionary, stableRef, highlightedWords],
  )

  return processNode(content)
})

const highlightKeywords = (
  content,
  dictionary,
  onWordHover,
  closeTooltip,
  stableRef,
) => {
  return (
    <HighlightedContent
      content={content}
      dictionary={dictionary}
      stableRef={stableRef}
    />
  )
}

// FIXED: Better important sentence processing with spacing considerations
const processImportantSentences = (content, importantSentences) => {
  if (!content || !importantSentences.length) return content

  let result = content
  let components = []
  let lastIndex = 0

  // Normalize by removing extra spaces and trimming
  const normalizeText = text => text.replace(/\s+/g, ' ').trim()

  // Get clean versions for comparison
  const contentNormalized = normalizeText(result)
  const sentencesNormalized = importantSentences.map(s => normalizeText(s))

  const matches = []
  sentencesNormalized.forEach((sentence, idx) => {
    let index = contentNormalized.indexOf(sentence)
    if (index !== -1) {
      matches.push({
        start: index,
        end: index + sentence.length,
        text: result.substring(index, index + sentence.length),
      })
    }
  })

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start)

  // Build components with highlighted sections and better spacing
  matches.forEach((match, index) => {
    if (match.start > lastIndex) {
      // Process non-highlighted text for bold
      components.push(
        processTextWithBold(result.substring(lastIndex, match.start)),
      )
    }

    // FIXED: Better spacing for important sentences
    components.push(
      <Box
        key={`important-${index}`}
        as="span"
        display="inline-block"
        px={3}
        py={2} // Increased padding
        my={2} // Increased margin
        mx={1}
        bg="linear-gradient(135deg, rgba(236, 201, 75, 0.08), rgba(236, 201, 75, 0.15))"
        borderRadius="lg"
        position="relative"
        minH="auto" // Allow natural height
        _before={{
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '70%',
          bg: 'linear-gradient(to bottom, #F6E05E, #D69E2E)',
          borderRadius: '2px',
        }}
      >
        {processTextWithBold(match.text)}
      </Box>,
    )

    lastIndex = match.end
  })

  if (lastIndex < result.length) {
    // Process remaining text for bold
    components.push(processTextWithBold(result.substring(lastIndex)))
  }

  return components
}

// FIXED: Better bold text processing
const processTextWithBold = text => {
  if (!text) return text
  if (typeof text !== 'string') return text

  const parts = []
  let lastIndex = 0
  const boldRegex = /(\*\*[^*]+\*\*|#\w+)/g
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold/hash
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Process bold/hash text with better spacing
    const [fullMatch] = match
    if (fullMatch.startsWith('**')) {
      parts.push(
        <Box
          as="span"
          key={`bold-${match.index}`}
          fontWeight="bold"
          color="white"
          px={1} // Add slight padding for better readability
        >
          {fullMatch.slice(2, -2)}
        </Box>,
      )
    } else if (fullMatch.startsWith('#')) {
      parts.push(
        <Box
          as="span"
          key={`hash-${match.index}`}
          fontWeight="bold"
          color="white"
          px={1} // Add slight padding for better readability
        >
          {fullMatch.slice(1)}
        </Box>,
      )
    }

    lastIndex = match.index + fullMatch.length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts
}

export {
  processTextWithBold,
  applyDictionaryHighlights,
  highlightKeywords,
  processImportantSentences,
}
