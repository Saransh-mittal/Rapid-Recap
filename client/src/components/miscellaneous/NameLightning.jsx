import React from 'react'
import { motion } from 'framer-motion'
import { Image } from '@chakra-ui/react'

//SSR images
const TitansFrame = '/images/TitansFrame.webp'

const NameLightning = ({ boxShadow, MAX_IQ }) => {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'transparent', // Set background to transparent
        pointerEvents: 'none',
        left: 0, // Align the container correctly
        top: 0, // Align the container correctly
      }}
      animate={{ opacity: [0.6, 1.5, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {/* Boundary with shadow */}
      <div
        style={{
          width: '100%', // Use full width
          borderRadius: '5px', // Inherit border radius
          height: '100%', // Use full height
          boxShadow: boxShadow, // Add shadow
          boxSizing: 'border-box', // Ensure boundary remains within dimensions
          display: 'flex',
          justifyContent: 'center',

          alignItems: 'center',
          position: 'relative', // Ensure the frame remains relative to this div
        }}
      >
        {MAX_IQ >= 150 && (
          <Image
            src={TitansFrame}
            position={'absolute'}
            background={'transparent'}
            width={'120%'} // Use responsive width
            height={'auto'} // Maintain aspect ratio
            style={{
              top: '-62%',
              maxHeight: '200%', // Ensure it doesn't overflow the container
              maxWidth: '160%', // Ensure it doesn't overflow the container
            }}
          />
        )}
      </div>
    </motion.div>
  )
}

export default NameLightning
