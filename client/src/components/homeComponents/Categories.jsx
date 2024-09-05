import { Box, Flex } from '@chakra-ui/react'
import React, { useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import Button from '../miscellaneous/ButtonComponent'
import { findCategoryIndex, getCategoryKey } from '../../assets/Categories'

const Categories = ({
  activeCategory,
  handleActiveCategory,
  categories,
  categoryRefs,
  trackCategoryClick,
  notLoggedIn,
}) => {
  const { t } = useTranslation('categories')

  // Scroll into view when the active category changes
  useEffect(() => {
    if (activeCategory) {
      const activeCategoryIndex = findCategoryIndex(activeCategory)
      if (activeCategoryIndex !== -1) {
        const activeCategoryRef = categoryRefs.current[activeCategoryIndex]
        if (activeCategoryRef) {
          activeCategoryRef.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      }
    }
  }, [activeCategory, categoryRefs])

  // Memoized categories buttons to avoid unnecessary re-renders
  const categoryButtons = useMemo(
    () =>
      categories.map((category, idx) => {
        // Ensure category is not undefined
        if (!category) {
          console.warn(`Category at index ${idx} is undefined`)
          return null
        }

        const isActive = getCategoryKey(activeCategory) === category.key

        return (
          <Button
            ref={el => (categoryRefs.current[idx] = el)}
            key={category.key}
            white={isActive}
            onClick={() => {
              trackCategoryClick(category.key)
              handleActiveCategory({ category: category.key })
            }}
            display={
              notLoggedIn && category.key === 'all' ? 'none' : 'inline-flex'
            }
          >
            {t(`categories.${category.key}`)}
          </Button>
        )
      }),
    [
      categories,
      activeCategory,
      categoryRefs,
      trackCategoryClick,
      handleActiveCategory,
      notLoggedIn,
      t,
    ],
  )

  return (
    <Box
      paddingInline={{ base: 0, lg: '10%' }}
      paddingTop={{ base: '5%', lg: '15%' }}
      className="categories-container"
    >
      <Flex
        flexDirection={{ base: 'row', lg: 'column' }}
        w={'100%'}
        alignItems={'center'}
        paddingBottom={{ base: '1.5rem', lg: '8rem' }}
      >
        <ButtonGradient />
        <Flex flexDirection={{ base: 'row', lg: 'column' }} gap={4}>
          {categoryButtons}
        </Flex>
      </Flex>
    </Box>
  )
}

export default React.memo(Categories)
