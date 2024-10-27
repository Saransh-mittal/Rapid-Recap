import React from 'react'
import { Box, Flex, Image, Tooltip } from '@chakra-ui/react'

// SSR image
const levelImage = '/images/level.webp'

const XPLevel = ({ level, onClick, _hover, className }) => {
  return (
    <Tooltip
      label={`Your Current Level is ${level}`}
      aria-label="User Level Tooltip"
    >
      <Flex
        position="relative"
        width="50px"
        height="50px"
        justifyContent="center"
        alignItems="center"
        className={className}
        onClick={onClick}
        _hover={_hover}
        // w={"100%"}
      >
        <Image
          src={levelImage}
          alt="Level"
          width="40px"
          height="40px"
          style={{
            position: 'relative',
            zIndex: 1,
          }}
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          fontSize="1.1rem"
          fontWeight="bold"
          zIndex={1}
        >
          {level}
        </Box>
      </Flex>
    </Tooltip>
  )
}

export default XPLevel
