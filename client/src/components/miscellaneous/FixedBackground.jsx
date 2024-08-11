import React from 'react'
import heroBg from '../../assets/hero/hero-bg.webp' // Adjust the path as necessary

const FixedBackground = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${heroBg})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        zIndex: -1,
      }}
    />
  )
}

export default FixedBackground
