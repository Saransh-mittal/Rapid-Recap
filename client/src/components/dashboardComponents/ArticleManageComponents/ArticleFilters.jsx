/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useCallback, useMemo } from 'react'
import { Input, Select, IconButton, Flex, VStack } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { getCategories, getCategoryKey } from '../../../assets/Categories'

const ArticleFilters = React.memo(
  ({ searchTerm, setSearchTerm, filters, setFilters, fetchArticles }) => {
    const handleKeyDown = useCallback(
      e => {
        if (e.key === 'Enter') {
          fetchArticles()
        }
      },
      [fetchArticles],
    )

    const handleSearchTermChange = useCallback(
      e => {
        setSearchTerm(e.target.value)
      },
      [setSearchTerm],
    )

    const handleFilterChange = useCallback(
      field => e => {
        const value =
          field === 'category' ? getCategoryKey(e.target.value) : e.target.value
        setFilters(prevFilters => ({ ...prevFilters, [field]: value }))
      },
      [setFilters],
    )

    const memoizedCategoryOptions = useMemo(
      () =>
        getCategories().map(
          category =>
            category.key !== 'all' && (
              <option
                key={category.key}
                value={category.key}
                style={{ background: '#1a1527' }}
              >
                {category.label}
              </option>
            ),
        ),
      [],
    )

    return (
      <VStack>
        <Flex w={'100%'}>
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            onKeyDown={handleKeyDown}
          />
          <IconButton
            aria-label="Search articles"
            icon={<SearchIcon />}
            onClick={fetchArticles}
          />
        </Flex>
        <Flex w={'100%'}>
          <Select
            placeholder="Category"
            value={filters.category}
            onChange={handleFilterChange('category')}
          >
            {memoizedCategoryOptions}
          </Select>
          <Input
            placeholder="Author"
            value={filters.author}
            onChange={handleFilterChange('author')}
          />
        </Flex>
        <Flex w={'100%'}>
          <Input
            placeholder="Start Date"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange('startDate')}
          />
          <Input
            placeholder="End Date"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange('endDate')}
          />
        </Flex>
        <Flex w={'100%'}>
          <Select
            placeholder="Has Quiz"
            value={filters.hasQuiz}
            onChange={handleFilterChange('hasQuiz')}
          >
            <option value="true" style={{ background: '#1a1527' }}>
              Yes
            </option>
            <option value="false" style={{ background: '#1a1527' }}>
              No
            </option>
          </Select>
          <Input
            placeholder="Article ID"
            value={filters._id}
            onChange={handleFilterChange('_id')}
          />
        </Flex>
      </VStack>
    )
  },
)

export default ArticleFilters
