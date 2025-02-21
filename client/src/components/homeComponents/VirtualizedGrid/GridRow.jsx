import React from 'react'
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'
import { GAP } from './constants'
import Card from '../Card'
import SkeletonCard from './SkeletonCard'
import { useSelector } from 'react-redux'
import {
  calculateTotalEffect,
  getCategoryFromBoost,
  isCategoryBoost,
} from '../../../utils/helper.utils'
import { useMemo } from 'react'

const GridRow = React.memo(
  ({
    index,
    style,
    data,
    i18n,
    formatDate,
    blackListedImgUrls,
    defaultImage,
  }) => {
    // Responsive gap for different screen sizes
    const responsiveGap = useBreakpointValue({
      base: 12,
      sm: 16,
      lg: GAP,
    })
    const { rows, columns, width } = data
    const { activeAbilities } = useSelector(state => state.inventory)

    const filteredActiveAbilities = activeAbilities.filter(ability => {
      // Handle category boosts
      if (
        isCategoryBoost(ability.name) &&
        rows[index].items.length > 0 &&
        rows[index].items[0]?.category
      ) {
        const boostCategory = getCategoryFromBoost(ability.name)
        return (
          boostCategory.toLowerCase() ===
          rows[index].items[0].category.toLowerCase()
        )
      }
      // Include all other types of boosts
      return true
    })
    const effects = useMemo(
      () => calculateTotalEffect(filteredActiveAbilities, 'BOOST'),
      [activeAbilities],
    )
    const timeDilationEffect = useMemo(
      () =>
        calculateTotalEffect(
          filteredActiveAbilities.filter(
            ability => ability?.name === 'TimeDilation',
          ),
          'POWER_UP',
        ),
      [activeAbilities],
    )

    const rowData = rows[index]
    const cardWidth = (width - responsiveGap * (columns + 1)) / columns
    const totalRowWidth = cardWidth * columns + responsiveGap * (columns - 1)
    const leftPadding = (width - totalRowWidth) / 2

    return (
      <Flex
        style={{
          ...style,
          left: `${leftPadding}px`,
          width: `${totalRowWidth}px`,
        }}
        gap={`${responsiveGap}px`}
        justifyContent="flex-start"
        alignItems="stretch"
      >
        {rowData.isLoading
          ? Array(rowData.columns)
              .fill(null)
              .map((_, i) => (
                <CardContainer key={`skeleton-${index}-${i}`} width={cardWidth}>
                  <SkeletonCard />
                </CardContainer>
              ))
          : rowData.items.map(item => (
              <CardContainer key={item._id} width={cardWidth}>
                <Card
                  difficulty={item?.articleDifficulty}
                  multiplier={
                    effects?.multiplier <= 1 ? null : `${effects?.multiplier}x`
                  }
                  additionalTime={
                    timeDilationEffect?.additionalTime
                      ? `+${timeDilationEffect?.additionalTime}s`
                      : null
                  }
                  title={
                    i18n.language === 'en' ? item?.title : item?.hindiTitle
                  }
                  urlTitle={item?.title}
                  image={
                    (!blackListedImgUrls.find(url => url === item.imgURL) &&
                      item.imgURL) ||
                    defaultImage
                  }
                  category={item?.category}
                  date={formatDate(item?.dateTime, i18n.language)}
                  readTime={item.avgReadTime}
                  id={item._id}
                  articleData={item}
                />
              </CardContainer>
            ))}
      </Flex>
    )
  },
)

export const CardContainer = React.memo(({ width, children }) => (
  <Box
    width={`${width}px`}
    minWidth={`${width}px`}
    maxWidth={`${width}px`}
    padding={{ base: '2', md: '3' }}
    align="center"
  >
    {children}
  </Box>
))

export default GridRow
