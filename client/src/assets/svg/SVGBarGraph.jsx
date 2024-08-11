import React, { useEffect, useRef, useState } from 'react'

const SVGBarGraph = ({ data, labels, height, width, onHover, userIQ }) => {
  const svgRef = useRef(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const margin = { top: 10, right: 10, bottom: 10, left: 10 }
  const graphWidth = width - margin.left - margin.right
  const graphHeight = height - margin.top - margin.bottom

  const barWidth = (graphWidth / data.length) * 0.6 // Make bars 60% of available space
  const barMargin = (graphWidth / data.length) * 0.2 // 40% for margins
  const maxValue = Math.max(...data)
  const scale = graphHeight / maxValue

  const minBarHeight = 10 // Minimum height for bars in pixels

  useEffect(() => {
    const svg = svgRef.current
    const handleMouseLeave = () => {
      setHoveredIndex(null)
      onHover(null, [])
    }

    if (svg) {
      svg.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (svg) {
        svg.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [onHover])

  const handleMouseEnter = index => {
    setHoveredIndex(index)
    onHover({ type: 'mousemove' }, [{ index }])
  }

  const getBarColor = (index, value) => {
    const [lowerBound, upperBound] = labels[index].split('-').map(Number)
    if (userIQ < upperBound && userIQ >= lowerBound) {
      return '#776B5D'
    }
    return hoveredIndex === index ? '#776B5D' : '#DED0B6'
  }

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((value, index) => {
          const scaledHeight = value * scale
          const barHeight = Math.max(scaledHeight, minBarHeight)
          const x = index * (barWidth + barMargin) + barMargin / 2
          const y = graphHeight - barHeight

          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={getBarColor(index, value)}
              onMouseEnter={() => handleMouseEnter(index)}
              rx={2}
              ry={2}
            />
          )
        })}
      </g>
    </svg>
  )
}

export default SVGBarGraph
