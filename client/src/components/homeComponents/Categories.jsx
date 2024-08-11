import { Box, Flex } from '@chakra-ui/react'
import React, { useEffect, useMemo, useCallback } from 'react'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import Button from '../miscellaneous/ButtonComponent'

const Categories = ({
  activeCategory,
  handleActiveCategory,
  categories,
  categoryRefs,
  trackCategoryClick,
  notLoggedIn,
}) => {
  // Scroll into view when the active category changes
  useEffect(() => {
    if (activeCategory) {
      const activeCategoryRef = categoryRefs.current.find(
        ref =>
          ref &&
          ref.textContent.trim().toLowerCase() === activeCategory.toLowerCase(),
      )
      if (activeCategoryRef) {
        activeCategoryRef.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
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

        return (
          <Button
            ref={el => (categoryRefs.current[idx] = el)}
            key={idx}
            white={
              category.toLocaleLowerCase() ===
              activeCategory?.toLocaleLowerCase()
            }
            onClick={() => {
              trackCategoryClick(category)
              handleActiveCategory({ category })
            }}
            display={notLoggedIn && category === 'all' ? 'none' : 'inline-flex'}
          >
            {category}
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
