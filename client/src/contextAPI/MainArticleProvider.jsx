import React from 'react'

// Context for first occurrence tracking
// Create context with both Set and reset function
export const HighlightedWordsContext = React.createContext({
  words: new Set(),
  reset: () => {},
})

export const HighlightedWordsProvider = ({ children }) => {
  const [highlightedWords, setHighlightedWords] = React.useState(
    () => new Set(),
  )

  // Add reset function
  const reset = React.useCallback(() => {
    setHighlightedWords(new Set())
  }, [])

  // Memoize the context value
  const value = React.useMemo(
    () => ({
      words: highlightedWords,
      reset,
    }),
    [highlightedWords, reset],
  )

  return (
    <HighlightedWordsContext.Provider value={value}>
      {children}
    </HighlightedWordsContext.Provider>
  )
}
