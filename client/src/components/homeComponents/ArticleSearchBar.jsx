import React, { useState, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  searchArticles,
  clearSearch,
  setSearchTerm,
} from '../../redux/articleSlice'
import SearchBarInput from './ArticleSearchComponent/SearchBarInput '
import SearchBarButton from './ArticleSearchComponent/SearchBarButton'

const ArticleSearchBar = () => {
  const [bgColor, setBgColor] = useState('rgba(26, 21, 39, 0.7)')
  const { searchTerm } = useSelector(state => state.articles)
  const dispatch = useDispatch()

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      dispatch(searchArticles({ query: searchTerm, page: 1, limit: 10 }))
    } else {
      dispatch(clearSearch())
    }
  }, [searchTerm, dispatch])

  const handleClearSearch = useCallback(() => {
    dispatch(setSearchTerm(''))
    dispatch(clearSearch())
  }, [dispatch])

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  const handleInputChange = useCallback(
    e => {
      const newSearchTerm = e.target.value

      dispatch(setSearchTerm(newSearchTerm))
      if (newSearchTerm === '') {
        dispatch(clearSearch())
      }
    },
    [dispatch],
  )

  const handleFocus = useCallback(() => {
    setBgColor('rgba(26, 21, 39, 1)')
  }, [])
  const handleBlur = useCallback(() => {
    setBgColor('rgba(26, 21, 39, 0.7)')
  }, [])

  const memoizedSearchBarInput = useMemo(
    () => (
      <SearchBarInput
        searchTerm={searchTerm}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleClearSearch={handleClearSearch}
      />
    ),
    [searchTerm, handleInputChange, handleKeyDown, handleClearSearch],
  )

  const memoizedSearchBarButton = useMemo(
    () => <SearchBarButton handleSearch={handleSearch} />,
    [handleSearch],
  )

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        backgroundColor: bgColor,
        borderRadius: '9999px',
        alignItems: 'center',
        transition: 'background-color 0.3s ease',
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {memoizedSearchBarInput}
      {memoizedSearchBarButton}
    </div>
  )
}

export default React.memo(ArticleSearchBar)
