import React from 'react'
import { FixedSizeList as List } from 'react-window'
import { Flex } from '@chakra-ui/react'
import { GAP, ROW_HEIGHT, SKELETON_COUNT } from './constants'
import SkeletonCard from './SkeletonCard'
import { CardContainer } from './GridRow'

const InitialLoadingGrid = React.memo(
  ({ width, height, getOptimalColumns }) => {
    const columns = getOptimalColumns(width)
    const cardWidth = (width - GAP * (columns + 1)) / columns
    const totalRowWidth = cardWidth * columns + GAP * (columns - 1)
    const leftPadding = (width - totalRowWidth) / 2
    const skeletonRows = Math.ceil(SKELETON_COUNT / columns)

    return (
      <List
        height={height}
        itemCount={skeletonRows}
        itemSize={ROW_HEIGHT}
        width={width}
        style={{ overflow: 'auto' }}
      >
        {({ index, style }) => (
          <Flex
            style={{
              ...style,
              width: `${totalRowWidth}px`,
              marginLeft: `${leftPadding}px`,
            }}
            gap={`${GAP}px`}
            justifyContent="flex-start"
            alignItems="stretch"
          >
            {Array(Math.min(columns, SKELETON_COUNT - index * columns))
              .fill(null)
              .map((_, i) => (
                <CardContainer
                  key={`initial-skeleton-${index}-${i}`}
                  width={cardWidth}
                >
                  <SkeletonCard />
                </CardContainer>
              ))}
          </Flex>
        )}
      </List>
    )
  },
)

export default InitialLoadingGrid
