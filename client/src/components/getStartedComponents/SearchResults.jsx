import React, { useState, useRef } from 'react'
import { Box, VStack, Text, List, Skeleton, Button } from '@chakra-ui/react'
import ResultCard from './ResultCard'

const SearchResults = React.memo(
  ({ isSearching, searchResults, hasMore, loadMore, COLORS }) => {
    const listRef = useRef(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const handleLoadMore = async e => {
      e.preventDefault()
      e.stopPropagation()
      setIsLoadingMore(true)
      const scrollPosition = listRef.current?.scrollTop || 0
      await loadMore()
      setIsLoadingMore(false)
      // Restore scroll position after a short delay to ensure content is rendered
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = scrollPosition
        }
      }, 100)
    }

    if (isSearching && !searchResults.length) {
      return (
        <VStack p={4} spacing={4}>
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              height="100px"
              width="100%"
              startColor={COLORS.darkBg}
              endColor={COLORS.accent}
              opacity={0.3}
            />
          ))}
        </VStack>
      )
    }

    if (searchResults.length > 0) {
      return (
        <List w="100%" ref={listRef}>
          <Box layout="position">
            {searchResults.map((article, index) => (
              <ResultCard
                key={article._id}
                article={article}
                index={index}
                COLORS={COLORS}
              />
            ))}
          </Box>
          {hasMore && (
            <Box
              p={4}
              textAlign="center"
              onMouseDown={e => e.preventDefault()}
              position="sticky"
              bottom={0}
              bg={COLORS.darkBg}
              borderTop={`1px solid ${COLORS.cardBorder}`}
            >
              <Button
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
                variant="outline"
                colorScheme="pink"
                size="sm"
              >
                Load More Results
              </Button>
            </Box>
          )}
        </List>
      )
    }

    return (
      <Box p={4} textAlign="center">
        <Text color="whiteAlpha.700">No results found</Text>
      </Box>
    )
  },
)
SearchResults.displayName = 'SearchResults'
export default SearchResults
