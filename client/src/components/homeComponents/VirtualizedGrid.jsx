import React from 'react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Box, useMediaQuery } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/helper.utils'
import { blackListedImgUrls } from '../../assets/blackListedImgUrls'
import { ROW_HEIGHT, DEFAULT_IMAGE } from './VirtualizedGrid/constants'
import { useColumnCalculation, useRowData } from './VirtualizedGrid/hooks'
import GridRow from './VirtualizedGrid/GridRow'
import InitialLoadingGrid from './VirtualizedGrid/InitialLoadingGrid'
import { css, Global } from '@emotion/react'

// Define scrollbar styles
const customScrollbarStyles = css`
  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-track {
      background: rgba(30, 41, 59, 0.2);
      border-radius: 4px;
      margin: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(
        135deg,
        rgba(147, 51, 234, 0.6) 0%,
        rgba(236, 72, 153, 0.6) 100%
      );
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      min-height: 40px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(
        135deg,
        rgba(147, 51, 234, 0.8) 0%,
        rgba(236, 72, 153, 0.8) 100%
      );
    }

    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(236, 72, 153, 0.6) rgba(30, 41, 59, 0.2);
  }

  @media (max-width: 991px) {
    .custom-scrollbar {
      &::-webkit-scrollbar {
        width: 0;
        display: none;
      }
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
  }
`

const VirtualizedGrid = ({ items, loading, onLoadMore, hasMore }) => {
  const { i18n } = useTranslation(['Timeline', 'formatDate'])
  const getOptimalColumns = useColumnCalculation()
  const getRowData = useRowData(getOptimalColumns)
  const [isLargerThan992] = useMediaQuery('(min-width: 992px)')

  return (
    <Box
      width="100%"
      height="calc(100vh - 100px)"
      paddingTop="24px"
      position="relative"
      className="virtualized-grid-container"
    >
      <Global styles={customScrollbarStyles} />
      <AutoSizer>
        {({ height, width }) => {
          const scrollbarWidth = isLargerThan992 ? 8 : 0
          const effectiveWidth = width - scrollbarWidth

          if (!items.length && loading) {
            return (
              <InitialLoadingGrid
                width={effectiveWidth}
                height={height}
                getOptimalColumns={getOptimalColumns}
              />
            )
          }

          const { rows, columns } = getRowData(items, effectiveWidth, loading)

          return (
            <Box
              width={width}
              height={height}
              position="relative"
              className="list-container"
              sx={{
                '& > div': {
                  className: 'custom-scrollbar !important',
                },
              }}
            >
              <List
                height={height}
                itemCount={rows.length}
                itemSize={ROW_HEIGHT}
                width={width}
                itemData={{ rows, columns, width: effectiveWidth }}
                onScroll={({ scrollOffset }) => {
                  if (
                    !loading &&
                    hasMore &&
                    rows.length * ROW_HEIGHT - scrollOffset < ROW_HEIGHT * 5
                  ) {
                    onLoadMore()
                  }
                }}
                overscanCount={2}
                style={{
                  overflow: 'overlay',
                  scrollbarGutter: 'stable',
                }}
                className="custom-scrollbar"
              >
                {props => (
                  <GridRow
                    {...props}
                    i18n={i18n}
                    formatDate={formatDate}
                    blackListedImgUrls={blackListedImgUrls}
                    defaultImage={DEFAULT_IMAGE}
                  />
                )}
              </List>
            </Box>
          )
        }}
      </AutoSizer>
    </Box>
  )
}

export default React.memo(VirtualizedGrid)
