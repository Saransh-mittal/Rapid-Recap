import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../redux/authSlice'

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

  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  useEffect(() => {
    if (user?.hasChanged) {
      dispatch(setUser({ ...user, hasChanged: false }))
      setHighlightedWords(new Set())
    }
  }, [user])
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
