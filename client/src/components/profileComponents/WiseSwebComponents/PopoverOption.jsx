import { Flex, Text } from '@chakra-ui/react'
import React, { useState } from 'react'

// Memoize PopoverOption
const PopoverOption = React.memo(
  ({ icon: Icon, text, onClick, isRed = false }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
      <Flex
        align="center"
        p={2}
        cursor="pointer"
        transition="all 0.3s ease"
        color={isRed ? '#ff6b6b' : '#e0e0e0'}
        borderRadius="md"
        bg={isHovered ? '#3d355a' : 'transparent'}
        transform={isHovered ? 'translateX(5px)' : 'translateX(0)'}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon
          color={isRed ? '#ff6b6b' : '#a49eb9'}
          size={16}
          style={{ marginRight: '8px' }}
        />
        <Text textAlign={'center'} m={0} fontWeight={isRed ? 'bold' : 'normal'}>
          {text}
        </Text>
      </Flex>
    )
  },
)

export default PopoverOption
