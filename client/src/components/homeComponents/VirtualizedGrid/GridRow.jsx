import React from 'react'
import { Box, Flex, useBreakpointValue } from '@chakra-ui/react'
import { GAP } from './constants'
import Card from '../Card'
import SkeletonCard from './SkeletonCard'
import { useSelector } from 'react-redux'

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
    const { effects } = useSelector(state => state.inventory)

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
                  multiplier={effects?.boost?.multiplier}
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
