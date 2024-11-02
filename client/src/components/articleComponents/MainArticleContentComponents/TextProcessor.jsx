import React from 'react'
import { Box } from '@chakra-ui/react'
import { HighlightedWordsContext } from '../../../contextAPI/MainArticleProvider'

const processTextWithBold = text => {
  if (!text) return text
  if (typeof text !== 'string') return text

  const parts = text.split(/(\*\*[^*]+\*\*|#\w+)/)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Box as="span" key={`bold-${index}`} fontWeight="bold" color="white">
          {part.slice(2, -2)}
        </Box>
      )
    }
    if (part.startsWith('#')) {
      return (
        <Box as="span" key={`hash-${index}`} fontWeight="bold" color="white">
          {part.slice(1)}
        </Box>
      )
    }
    return part
  })
}

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
            // Use stable event handlers from ref
            const { handleMouseEnter, handleMouseLeave, handleTouchStart } =
              stableRef.current

            return [
              ...acc,
              <Box
                key={`dict-${word}-${index}-${part}`}
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
              </Box>,
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

const highlightKeywords = (
  content,
  dictionary,
  onWordHover,
  closeTooltip,
  stableRef,
) => {
  const { words: highlightedWords } = React.useContext(HighlightedWordsContext)
  const processNode = node => {
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
        onWordHover,
        closeTooltip,
        highlightedWords,
        stableRef,
      )
    }
    return node
  }

  return processNode(content)
}

const processImportantSentences = (content, importantSentences) => {
  if (!content || !importantSentences.length) return content

  const processNode = node => {
    if (!node) return node

    if (React.isValidElement(node)) {
      return React.cloneElement(node, {
        children: processNode(node.props.children),
      })
    }

    if (Array.isArray(node)) {
      return node.map(processNode)
    }

    if (typeof node !== 'string') return node

    let result = node
    let components = []
    let lastIndex = 0

    const sortedImportantSentences = [...importantSentences].sort(
      (a, b) => b?.length - a?.length,
    )

    const matches = []
    sortedImportantSentences.forEach(important => {
      let index = result.indexOf(important)
      if (index !== -1) {
        matches.push({
          start: index,
          end: index + important?.length,
          text: important,
        })
      }
    })

    matches.sort((a, b) => a.start - b.start)

    matches.forEach((match, index) => {
      if (match.start > lastIndex) {
        components.push(result.substring(lastIndex, match.start))
      }

      components.push(
        <Box
          key={`important-${index}`}
          as="span"
          display="inline-block"
          px={3}
          py={1}
          my={1}
          mx={1}
          bg="linear-gradient(135deg, rgba(236, 201, 75, 0.08), rgba(236, 201, 75, 0.15))"
          borderRadius="lg"
          position="relative"
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
          {match.text}
        </Box>,
      )

      lastIndex = match.end
    })

    if (lastIndex < result.length) {
      components.push(result.substring(lastIndex))
    }

    return components
  }

  return processNode(content)
}

export {
  processTextWithBold,
  applyDictionaryHighlights,
  highlightKeywords,
  processImportantSentences,
}
