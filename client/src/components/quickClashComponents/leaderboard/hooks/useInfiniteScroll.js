// components/quickClashComponents/leaderboard/hooks/useInfiniteScroll.js
import { useEffect, useCallback } from 'react'

/**
 * Custom hook to handle infinite scrolling
 * @param {Object} ref - Reference to the scrollable element
 * @param {Object} params - Parameters for scroll handling
 * @param {boolean} params.hasMore - Whether there's more data to load
 * @param {boolean} params.loading - Whether data is currently loading
 * @param {boolean} params.backgroundFetching - Whether background fetching is in progress
 * @param {Function} params.onLoadMore - Function to call when more data should be loaded
 * @param {number} [params.threshold=200] - Distance from bottom to trigger loading
 */
const useInfiniteScroll = (
  ref,
  { hasMore, loading, backgroundFetching, onLoadMore, threshold = 200 },
) => {
  const handleScroll = useCallback(() => {
    const scrollElement = ref.current
    if (!scrollElement) return

    const { scrollTop, scrollHeight, clientHeight } = scrollElement
    const scrolledToBottom =
      scrollTop + clientHeight >= scrollHeight - threshold

    if (scrolledToBottom && hasMore && !loading && !backgroundFetching) {
      onLoadMore()
    }
  }, [ref, hasMore, loading, backgroundFetching, onLoadMore, threshold])

  useEffect(() => {
    const scrollElement = ref.current
    if (!scrollElement) return

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [ref, handleScroll])

  // Return nothing - this hook only sets up the effect
}

export default useInfiniteScroll
