import React from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const RewardIcon = ({ icon }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        w={{ base: '140px', md: '160px' }}
        h={{ base: '140px', md: '160px' }}
        bg="linear-gradient(145deg, blue.800, blue.700)"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="0 0 40px rgba(37, 99, 235, 0.3)"
        border="2px solid"
        borderColor="blue.400"
        position="relative"
        _after={{
          content: '""',
          position: 'absolute',
          inset: '-1px',
          borderRadius: 'full',
          padding: '1px',
          background: 'linear-gradient(145deg, blue.400, transparent)',
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        {icon}
      </Box>
    </motion.div>
  )
}

export default RewardIcon
