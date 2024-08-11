import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Box } from '@chakra-ui/react'

const SVGIQLineGraph = ({ data, width, height, onHover }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { points: [], xScale: 0, yScale: 0 }

    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const xScale = chartWidth / (data.length - 1)
    const yMin = Math.min(...data.map(d => d.IQScore)) - 20
    const yMax = Math.max(...data.map(d => d.IQScore)) + 10
    const yScale = chartHeight / (yMax - yMin)

    const points = data.map((d, i) => ({
      x: i * xScale + margin.left,
      y: chartHeight - (d.IQScore - yMin) * yScale + margin.top,
      ...d,
    }))

    return {
      points,
      xScale,
      yScale,
      yMin,
      yMax,
      margin,
      chartWidth,
      chartHeight,
    }
  }, [data, width, height])

  const handleInteraction = useCallback(
    event => {
      const svgRect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX || event.touches[0].clientX
      const relativeX = x - svgRect.left
      const closestIndex = Math.round(
        (relativeX - chartData.margin.left) / chartData.xScale,
      )
      if (closestIndex >= 0 && closestIndex < chartData.points.length) {
        setHoveredIndex(closestIndex)
        onHover(closestIndex)
      }
    },
    [chartData, onHover],
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(chartData.points.length - 1)
    onHover(chartData.points.length - 1)
  }, [chartData, onHover])

  const linePoints = chartData.points.map(p => `${p.x},${p.y}`).join(' ')
  return (
    <Box width={width} height={height}>
      <svg
        width={width}
        height={height}
        onMouseMove={handleInteraction}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleInteraction}
        onTouchMove={handleInteraction}
        onTouchEnd={handleMouseLeave}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F2D8D8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F2D8D8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M${chartData.points[0].x},${
            chartData.chartHeight + chartData.margin.top
          } ${linePoints} L${chartData.points[chartData.points.length - 1].x},${
            chartData.chartHeight + chartData.margin.top
          }`}
          fill="url(#lineGradient)"
        />
        <polyline
          fill="none"
          stroke="#F2D8D8"
          strokeWidth="2"
          points={linePoints}
        />
        {chartData.points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={index === hoveredIndex ? 4 : 0}
            fill={index === hoveredIndex ? '#ff9800' : '#FFF6F6'}
          />
        ))}
        {hoveredIndex !== null && (
          <line
            x1={chartData.points[hoveredIndex].x}
            y1={chartData.margin.top}
            x2={chartData.points[hoveredIndex].x}
            y2={height - chartData.margin.bottom}
            stroke="#B3A492"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </Box>
  )
}

export default SVGIQLineGraph
