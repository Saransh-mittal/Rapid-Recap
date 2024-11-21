import { useCallback } from 'react'
import { BREAKPOINTS, MIN_CARD_WIDTH, GAP, SKELETON_COUNT } from './constants'

export const useColumnCalculation = () => {
  return useCallback(width => {
    const maxPossibleColumns = Math.floor(
      (width + GAP) / (MIN_CARD_WIDTH + GAP),
    )

    let breakpointColumns = BREAKPOINTS.base.columns
    Object.entries(BREAKPOINTS).forEach(([_, breakpoint]) => {
      if (width >= breakpoint.width) {
        breakpointColumns = breakpoint.columns
      }
    })

    return Math.min(maxPossibleColumns, breakpointColumns)
  }, [])
}

export const useRowData = getOptimalColumns => {
  return useCallback(
    (items, width, loading) => {
      const columns = getOptimalColumns(width)
      const rows = []
      const skeletonRows = Math.ceil(SKELETON_COUNT / columns)

      // Add actual content rows
      for (let i = 0; i < items.length; i += columns) {
        rows.push({
          items: items.slice(i, i + columns),
          columns,
          width,
          isLoading: false,
        })
      }

      // Add skeleton rows if loading more content
      if (loading && items.length > 0) {
        for (let i = 0; i < skeletonRows; i++) {
          const remainingSkeletons = Math.min(
            columns,
            SKELETON_COUNT - i * columns,
          )
          if (remainingSkeletons > 0) {
            rows.push({
              items: Array(remainingSkeletons).fill(null),
              columns,
              width,
              isLoading: true,
            })
          }
        }
      }

      return { rows, columns }
    },
    [getOptimalColumns],
  )
}
