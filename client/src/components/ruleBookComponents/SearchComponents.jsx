// src/components/ruleBookComponents/SearchComponents.jsx
import React, { memo, useMemo, useCallback } from 'react'
import {
  Box,
  Input,
  Button,
  HStack,
  Text,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Search, X, ArrowRight, Zap, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)

// Result category grouping and scoring
const processSearchResults = (query, pages) => {
  const results = new Map() // Map to store grouped results
  const searchTerms = query
    .toLowerCase()
    .split(' ')
    .filter(term => term.length > 0)

  if (searchTerms.length === 0) return []

  pages.forEach(page => {
    Object.entries(page.content).forEach(([subtitle, items]) => {
      items.forEach(item => {
        const text = item.text || item // Handle both new and old data structure
        const explanation = item.explanation || ''

        // Calculate relevance score
        let score = 0
        searchTerms.forEach(term => {
          if (page.title.toLowerCase().includes(term)) score += 3
          if (subtitle.toLowerCase().includes(term)) score += 2
          if (text.toLowerCase().includes(term)) score += 1
          if (explanation.toLowerCase().includes(term)) score += 0.5
        })

        if (score > 0) {
          const key = `${page.title}-${subtitle}`
          if (!results.has(key)) {
            results.set(key, {
              section: page.title,
              subtitle,
              items: [],
              score,
              pageId: page.id,
            })
          }
          results.get(key).items.push({
            text,
            explanation,
            score,
          })
        }
      })
    })
  })

  // Convert Map to array and sort by score
  return Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5) // Limit to top 5 most relevant sections
}

const SearchResultItem = memo(({ result, onSelect, index, isMobile }) => {
  const handleClick = useCallback(() => {
    onSelect(result.pageId)
  }, [result.pageId, onSelect])

  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { delay: index * 0.03 },
      }}
      exit={{ opacity: 0, x: -20 }}
      cursor="pointer"
      onClick={handleClick}
      p={isMobile ? 2 : 3}
      _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      transition="all 0.2s"
      role="group"
      position="relative"
    >
      <HStack spacing={3} align="flex-start">
        {/* Score indicator */}
        <Box
          w="3px"
          h="full"
          bg="pink.400"
          position="absolute"
          left={0}
          opacity={result.score > 2 ? 0.8 : 0.4}
          transition="opacity 0.2s"
          _groupHover={{ opacity: 1 }}
        />

        <Box flex={1} pl={2}>
          <HStack mb={1} spacing={2}>
            <Icon
              as={result.score > 2 ? Zap : Info}
              color="pink.300"
              w={isMobile ? 3 : 4}
              h={isMobile ? 3 : 4}
            />
            <Text
              color="pink.300"
              fontSize={isMobile ? 'xs' : 'sm'}
              fontWeight="bold"
            >
              {result.section}
            </Text>
          </HStack>

          <Text
            color="purple.200"
            fontSize={isMobile ? 'sm' : 'md'}
            mb={1}
            pl={6}
          >
            {result.subtitle}
          </Text>

          {result.items.slice(0, 2).map((item, i) => (
            <Text
              key={i}
              color="whiteAlpha.700"
              fontSize={isMobile ? 'xs' : 'sm'}
              pl={6}
              noOfLines={1}
            >
              • {item.text}
            </Text>
          ))}

          {result.items.length > 2 && (
            <Text color="whiteAlpha.500" fontSize="xs" pl={6} mt={1}>
              +{result.items.length - 2} more matches
            </Text>
          )}
        </Box>

        <Icon
          as={ArrowRight}
          w={isMobile ? 4 : 5}
          h={isMobile ? 4 : 5}
          color="pink.300"
          opacity={0}
          transform="translateX(-10px)"
          transition="all 0.2s"
          _groupHover={{
            opacity: 1,
            transform: 'translateX(0)',
          }}
        />
      </HStack>
    </MotionBox>
  )
})

export const SearchResults = memo(({ results, onSelect }) => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <MotionBox
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      position="absolute"
      top="calc(100% + 8px)"
      left={0}
      right={0}
      bg="rgba(20, 17, 35, 0.95)"
      backdropFilter="blur(12px)"
      borderRadius="xl"
      overflow="hidden"
      zIndex={20}
      maxH={isMobile ? '300px' : '400px'}
      overflowY="auto"
      border="1px solid"
      borderColor="whiteAlpha.200"
      boxShadow="0 4px 20px rgba(0,0,0,0.3)"
      css={{
        '&::-webkit-scrollbar': {
          width: '2px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,0,0,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '1px',
        },
      }}
    >
      <Box p={isMobile ? 2 : 3}>
        <Text color="whiteAlpha.600" fontSize={isMobile ? 'xs' : 'sm'} mb={2}>
          Found matches in {results.length} sections
        </Text>

        {results.map((result, index) => (
          <SearchResultItem
            key={`${result.section}-${result.subtitle}`}
            result={result}
            onSelect={onSelect}
            index={index}
            isMobile={isMobile}
          />
        ))}
      </Box>
    </MotionBox>
  )
})

export const SearchBar = memo(({ pages, onSelectResult }) => {
  const [query, setQuery] = React.useState('')
  const [isActive, setIsActive] = React.useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate()

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return []
    return processSearchResults(query, pages)
  }, [query, pages])

  const handleQueryChange = useCallback(e => {
    setQuery(e.target.value)
  }, [])

  const clearQuery = useCallback(() => {
    setQuery('')
  }, [])
  const handleResultSelect = useCallback(
    pageId => {
      navigate(`/manual/${pageId}`) // Navigate to the correct route
      setQuery('')
      setIsActive(false)
    },
    [navigate],
  )

  return (
    <Box position="relative" mb={4}>
      <Box position="relative" role="group">
        <Box
          position="absolute"
          inset={0}
          borderRadius="xl"
          bg="whiteAlpha.100"
          opacity={0}
          transition="opacity 0.2s"
          _groupHover={{ opacity: 1 }}
        />

        <Box
          position="absolute"
          left={4}
          top="50%"
          transform="translateY(-50%)"
          color="pink.300"
        >
          <Search size={isMobile ? 16 : 18} />
        </Box>

        <Input
          placeholder="Search manual..."
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setIsActive(true)}
          onBlur={() => setTimeout(() => setIsActive(false), 200)}
          pl={12}
          pr={query ? 12 : 4}
          py={isMobile ? 2 : 3}
          bg="rgba(20, 17, 35, 0.6)"
          color="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          _hover={{ borderColor: 'pink.300' }}
          _focus={{
            borderColor: 'pink.300',
            boxShadow: '0 0 0 1px var(--chakra-colors-pink-300)',
          }}
          fontSize={isMobile ? 'sm' : 'md'}
          transition="all 0.2s"
        />

        {query && (
          <Button
            position="absolute"
            right={3}
            top="50%"
            transform="translateY(-50%)"
            color="whiteAlpha.600"
            variant="ghost"
            size="sm"
            onClick={clearQuery}
            _hover={{ color: 'pink.300' }}
            zIndex={1}
          >
            <X size={isMobile ? 16 : 18} />
          </Button>
        )}
      </Box>

      <AnimatePresence>
        {isActive && searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            onSelect={handleResultSelect}
          />
        )}
      </AnimatePresence>
    </Box>
  )
})

export default memo(SearchBar)
