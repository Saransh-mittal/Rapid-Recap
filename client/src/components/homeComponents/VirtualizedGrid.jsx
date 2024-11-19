import React, { useCallback, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Box, Flex, Skeleton } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/helper.utils'
import { blackListedImgUrls } from '../../assets/blackListedImgUrls'
import Card from './Card'

const rrImage = '/images/rrlogo_HD.webp'

const BREAKPOINTS = {
  base: { width: 0, columns: 1 },
  md: { width: 768, columns: 2 },
  lg: { width: 1024, columns: 3 },
}

const VirtualizedGrid = ({ items, loading, onLoadMore, hasMore }) => {
  const { i18n } = useTranslation(['Timeline', 'formatDate'])

  const MIN_CARD_WIDTH = 320
  const GAP = 0
  const ROW_HEIGHT = 480

  // Calculate optimal columns based on width
  const getOptimalColumns = useCallback(width => {
    const maxPossibleColumns = Math.floor(
      (width + GAP) / (MIN_CARD_WIDTH + GAP),
    )

    // Find the appropriate breakpoint
    let breakpointColumns = BREAKPOINTS.base.columns
    Object.entries(BREAKPOINTS).forEach(([_, breakpoint]) => {
      if (width >= breakpoint.width) {
        breakpointColumns = breakpoint.columns
      }
    })

    return Math.min(maxPossibleColumns, breakpointColumns)
  }, [])

  const getRowData = useCallback(
    (items, width) => {
      const columns = getOptimalColumns(width)
      const rows = []

      for (let i = 0; i < items.length; i += columns) {
        rows.push({
          items: items.slice(i, i + columns),
          columns,
          width,
        })
      }

      return { rows, columns }
    },
    [getOptimalColumns],
  )

  const Row = useCallback(
    ({ index, style, data }) => {
      const { rows } = data
      const rowData = rows[index]
      const cardWidth =
        (rowData.width - GAP * (rowData.columns + 1)) / rowData.columns

      // Calculate total row width
      const totalRowWidth = cardWidth * rowData.columns
      // Calculate left padding to center the row
      const leftPadding = (rowData.width - totalRowWidth) / 2

      return (
        <Flex
          style={{
            ...style,
            left: `${leftPadding}px`, // Add left padding for centering
            width: `${totalRowWidth}px`, // Set exact row width
          }}
          gap={GAP}
          justifyContent="center"
          alignItems="stretch"
        >
          {rowData.items.map(item => (
            <Box
              key={item._id}
              width={`${cardWidth}px`}
              minWidth={`${cardWidth}px`}
              maxWidth={`${cardWidth}px`}
              align="center"
            >
              <Card
                title={i18n.language === 'en' ? item?.title : item?.hindiTitle}
                urlTitle={item?.title}
                image={
                  (!blackListedImgUrls.find(url => url === item.imgURL) &&
                    item.imgURL) ||
                  rrImage
                }
                category={item?.category}
                date={formatDate(item?.dateTime, i18n.language)}
                readTime={item.avgReadTime}
                id={item._id}
                articleData={item}
              />
            </Box>
          ))}
        </Flex>
      )
    },
    [i18n.language],
  )

  return (
    <Box
      width="100%"
      height="calc(100vh - 100px)"
      paddingTop="24px"
      position="relative"
    >
      <AutoSizer>
        {({ height, width }) => {
          const { rows, columns } = getRowData(items, width)
          // Calculate loading row styles
          const loadingRowWidth =
            ((width - GAP * (columns + 1)) / columns) * columns
          const loadingRowLeftPadding = (width - loadingRowWidth) / 2

          return (
            <List
              height={height}
              itemCount={rows.length + (loading ? 1 : 0)}
              itemSize={ROW_HEIGHT}
              width={width}
              itemData={{ rows, columns, width }}
              onScroll={({ scrollOffset, scrollHeight, clientHeight }) => {
                if (
                  !loading &&
                  hasMore &&
                  rows.length * ROW_HEIGHT - scrollOffset < ROW_HEIGHT * 5
                ) {
                  console.log('Loading more...')
                  onLoadMore()
                }
              }}
              overscanCount={2}
              style={{ overflow: 'auto' }}
            >
              {({ index, style, data }) => {
                if (loading && index === rows.length) {
                  return (
                    <Flex
                      gap={GAP}
                      width={`${loadingRowWidth}px`}
                      style={{
                        ...style,
                        left: `${loadingRowLeftPadding}px`,
                      }}
                      justify="flex-start"
                    >
                      {Array(data.columns)
                        .fill(null)
                        .map((_, i) => (
                          <Box
                            key={`skeleton-${i}`}
                            width={`${
                              (width - GAP * (data.columns + 1)) / data.columns
                            }px`}
                          >
                            <Skeleton height="420px" borderRadius="xl" />
                          </Box>
                        ))}
                    </Flex>
                  )
                }
                return <Row index={index} style={style} data={data} />
              }}
            </List>
          )
        }}
      </AutoSizer>
    </Box>
  )
}

export default React.memo(VirtualizedGrid)
