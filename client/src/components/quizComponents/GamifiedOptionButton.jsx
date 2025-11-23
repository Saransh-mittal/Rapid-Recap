import React from 'react'
import { Box, Text, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'

const MotionBox = motion(Box)

const GamifiedOptionButton = ({
  optionKey,
  optionText,
  isSelected,
  onSelect,
  isDisabled,
}) => {
  return (
    <MotionBox
      as="button"
      onClick={() => !isDisabled && onSelect(optionKey)}
      disabled={isDisabled}
      width="100%"
      position="relative"
      overflow="hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      p={4}
      borderRadius="xl"
      bg={
        isSelected
          ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.6) 0%, rgba(79, 70, 229, 0.6) 100%)'
          : 'rgba(255, 255, 255, 0.05)'
      }
      border="1px solid"
      borderColor={isSelected ? 'purple.400' : 'whiteAlpha.200'}
      _hover={{
        bg: isSelected
          ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.7) 0%, rgba(79, 70, 229, 0.7) 100%)'
          : 'rgba(255, 255, 255, 0.1)',
        borderColor: isSelected ? 'purple.300' : 'whiteAlpha.400',
      }}
      display="flex"
      alignItems="center"
      textAlign="left"
      role="group"
    >
      {/* Selection Indicator */}
      <Flex
        w="32px"
        h="32px"
        borderRadius="full"
        bg={isSelected ? 'white' : 'whiteAlpha.100'}
        color={isSelected ? 'purple.600' : 'whiteAlpha.400'}
        align="center"
        justify="center"
        mr={4}
        flexShrink={0}
        transition="all 0.2s"
        _groupHover={{
          bg: isSelected ? 'white' : 'whiteAlpha.200',
          transform: 'scale(1.1)',
        }}
      >
        {isSelected ? <Check size={18} strokeWidth={3} /> : <Text fontSize="sm" fontWeight="bold">{String.fromCharCode(65 + parseInt(optionKey))}</Text>}
      </Flex>

      {/* Option Text */}
      <Text
        color={isSelected ? 'white' : 'whiteAlpha.900'}
        fontSize={{ base: 'md', md: 'lg' }}
        fontWeight={isSelected ? 'bold' : 'medium'}
        flex="1"
      >
        {optionText}
      </Text>

      {/* Background Glow Effect for Selected */}
      {isSelected && (
        <MotionBox
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="purple.500"
          filter="blur(40px)"
          opacity={0.2}
          zIndex={-1}
          layoutId="selectionGlow"
        />
      )}
    </MotionBox>
  )
}

export default GamifiedOptionButton
