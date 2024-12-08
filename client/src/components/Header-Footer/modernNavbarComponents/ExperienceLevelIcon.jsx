import React from 'react'

const ExperienceLevelIcon = ({ level, size = 20 }) => {
  // Define level ranges and their corresponding colors
  const getLevelColor = level => {
    if (level >= 100) return '#FF4154' // Bright red for Master
    if (level >= 61) return '#9D5CFF' // Bright purple for Expert
    if (level >= 31) return '#FF8B3E' // Bright orange for Advanced
    if (level >= 11) return '#4ADE80' // Bright green for Intermediate
    return '#60A5FA' // Bright blue for Basic
  }

  const color = getLevelColor(level)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer glow effect */}
      <circle cx="12" cy="12" r="11" fill={color} opacity="0.15" />
      {/* Main star shape */}
      <path
        d="M12 2L14.4 9.2H22L16.8 13.8L19.2 21L12 16.4L4.8 21L7.2 13.8L2 9.2H9.6L12 2Z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export default ExperienceLevelIcon
