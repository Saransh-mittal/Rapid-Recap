// src/components/ruleBookComponents/SearchComponents.jsx
import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react'
import {
  Box,
  Input,
  Button,
  HStack,
  Text,
  Icon,
  useBreakpointValue,
  Portal,
} from '@chakra-ui/react'
import { Search, X, ArrowRight, Zap, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)

// Result category grouping and scoring
const processSearchResults = (query, pages) => {
  const results = new Map()
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)

  if (searchTerms.length === 0) return []

  pages.forEach(page => {
    Object.entries(page.content).forEach(([subtitle, items]) => {
      items.forEach(item => {
        const text = item.text || item
        const explanation = item.explanation || ''

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
          results.get(key).items.push({ text, explanation, score })
        }
      })
    })
  })

  return Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

const SearchResultItem = memo(({ result, onSelect, index, isMobile }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 } }}
      exit={{ opacity: 0, y: -10 }}
      cursor="pointer"
      onClick={() => onSelect(result.pageId)}
      p={isMobile ? 4 : 5}
      mb={3}
      bg="whiteAlpha.50"
      backdropFilter="blur(10px)"
      borderRadius="2xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      role="group"
      position="relative"
      _hover={{ transform: 'translateY(-2px)', bg: 'whiteAlpha.100', borderColor: 'cyan.400' }}
    >
      <HStack spacing={4} align="flex-start">
        <Box 
          mt={1} 
          p={2} 
          borderRadius="xl" 
          bg={result.score > 2 ? 'cyan.400' : 'whiteAlpha.100'}
          color={result.score > 2 ? 'gray.900' : 'cyan.300'}
          transition="all 0.2s"
          _groupHover={{ bg: 'cyan.400', color: 'gray.900', transform: 'scale(1.1)' }}
        >
          <Icon as={result.score > 2 ? Zap : Info} w={4} h={4} />
        </Box>

        <Box flex={1}>
          <Text
            color="white"
            fontSize={isMobile ? 'sm' : 'md'}
            fontWeight="700"
            fontFamily="'Outfit', sans-serif"
            mb={1}
          >
            {result.section} <Box as="span" color="whiteAlpha.500" fontWeight="normal">/ {result.subtitle}</Box>
          </Text>

          {result.items.slice(0, 2).map((item, i) => (
            <Text
              key={i}
              color="whiteAlpha.600"
              fontSize={isMobile ? 'xs' : 'sm'}
              noOfLines={1}
              mb={1}
            >
              {item.text}
            </Text>
          ))}
        </Box>

        <Box alignSelf="center">
          <Icon
            as={ArrowRight}
            w={5}
            h={5}
            color="cyan.400"
            opacity={0}
            transform="translateX(-10px)"
            transition="all 0.2s"
            _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          />
        </Box>
      </HStack>
    </MotionBox>
  )
})

export const SearchBar = memo(({ pages, onSelectResult }) => {
  const [query, setQuery] = useState('')
  const [isActive, setIsActive] = useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return []
    return processSearchResults(query, pages)
  }, [query, pages])

  const handleResultSelect = useCallback(pageId => {
    navigate(`/manual/${pageId}`)
    setQuery('')
    setIsActive(false)
    inputRef.current?.blur()
  }, [navigate])

  // Lock body scroll when active on mobile
  useEffect(() => {
    if (isMobile && isActive) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isActive, isMobile])

  return (
    <>
      {/* Cinematic Blur Overlay when focused */}
      <AnimatePresence>
        {isActive && (
          <Portal>
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              position="fixed"
              inset={0}
              bg="rgba(15, 23, 42, 0.7)"
              backdropFilter="blur(20px)"
              zIndex={100}
              onClick={() => setIsActive(false)}
            />
          </Portal>
        )}
      </AnimatePresence>

      <Box 
        position={isActive ? { base: 'fixed', md: 'relative' } : 'relative'}
        top={isActive && isMobile ? '20px' : 'auto'}
        left={isActive && isMobile ? '4' : 'auto'}
        right={isActive && isMobile ? '4' : 'auto'}
        zIndex={101}
        w="full"
      >
        <Box position="relative">
          {/* Search Icon */}
          <Box position="absolute" left={isMobile ? 5 : 6} top="50%" transform="translateY(-50%)" color={isActive ? "cyan.400" : "whiteAlpha.400"} zIndex={2} transition="color 0.2s">
            <Search size={20} strokeWidth={2.5} />
          </Box>

          {/* Pill Input */}
          <Input
            ref={inputRef}
            placeholder="Search the manual..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsActive(true)}
            pl={isMobile ? 14 : 16}
            pr={query ? 14 : 6}
            py={isMobile ? 6 : 8}
            bg={isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'}
            backdropFilter="blur(12px)"
            border="1px solid"
            borderColor={isActive ? 'cyan.400' : 'whiteAlpha.100'}
            borderRadius="full"
            color="white"
            fontSize={{ base: 'md', md: 'xl' }}
            fontFamily="'Outfit', sans-serif"
            fontWeight="500"
            _placeholder={{ color: 'whiteAlpha.300', fontWeight: '400' }}
            _focus={{
              boxShadow: '0 0 0 1px var(--chakra-colors-cyan-400), 0 10px 40px -10px rgba(34, 211, 238, 0.3)',
              bg: 'rgba(255,255,255,0.05)'
            }}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          />

          {/* Clear Button */}
          {query && (
            <Button
              position="absolute"
              right={4}
              top="50%"
              transform="translateY(-50%)"
              color="whiteAlpha.500"
              variant="unstyled"
              minW="auto"
              h="auto"
              p={2}
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              _hover={{ color: 'white' }}
              zIndex={2}
            >
              <X size={20} />
            </Button>
          )}

          {/* Cancel button on mobile when active */}
          {isMobile && isActive && !query && (
            <Button
              position="absolute"
              right={4}
              top="50%"
              transform="translateY(-50%)"
              color="whiteAlpha.700"
              variant="unstyled"
              minW="auto"
              h="auto"
              fontWeight="500"
              onClick={() => setIsActive(false)}
              zIndex={2}
            >
              Cancel
            </Button>
          )}
        </Box>

        {/* Floating Results Popover */}
        <AnimatePresence>
          {isActive && query.length >= 2 && (
            <MotionBox
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              position="absolute"
              top={isMobile ? 'calc(100% + 16px)' : 'calc(100% + 24px)'}
              left={0}
              right={0}
              maxH={isMobile ? 'calc(100vh - 120px)' : '500px'}
              overflowY="auto"
              zIndex={102}
              css={{
                '&::-webkit-scrollbar': { width: '0' },
                scrollbarWidth: 'none',
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <SearchResultItem
                    key={`${result.section}-${result.subtitle}`}
                    result={result}
                    onSelect={handleResultSelect}
                    index={index}
                    isMobile={isMobile}
                  />
                ))
              ) : (
                <Box p={8} textAlign="center" bg="whiteAlpha.50" backdropFilter="blur(10px)" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
                  <Text color="whiteAlpha.500" fontSize="lg">No matches found for "{query}"</Text>
                  <Text color="whiteAlpha.300" fontSize="sm" mt={2}>Try searching for "Forge", "Quiz", or "Powerups"</Text>
                </Box>
              )}
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </>
  )
})

export default memo(SearchBar)
