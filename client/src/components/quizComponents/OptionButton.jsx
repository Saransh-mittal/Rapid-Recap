import React from 'react'
import { Button, Text, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const OptionButton = React.memo(
  ({ optionKey, optionText, isSelected, onSelect, isTournament = false }) => {
    // Helper to switch between tournament and default colors
    const getColor = (defaultColor, tournamentColor) =>
      isTournament ? tournamentColor : defaultColor

    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => onSelect(optionKey)}
          variant="solid"
          size="lg"
          width="100%"
          justifyContent="flex-start"
          bg={
            isSelected
              ? getColor('rgba(138, 43, 226, 0.4)', 'rgba(255, 215, 0, 0.5)')
              : getColor('rgba(255, 255, 255, 0.1)', 'rgba(255, 223, 0, 0.1)')
          }
          _hover={{
            bg: getColor('rgba(138, 43, 226, 0.3)', 'rgba(255, 215, 0, 0.3)'),
          }}
          mb={4}
          color={'white'}
          whiteSpace="normal"
          height="auto"
          py={2}
        >
          <Flex alignItems="flex-start" width="100%">
            <Text fontSize="md" fontWeight="bold" mr={2} mb={0} flexShrink={0}>
              {optionKey.toUpperCase()}.
            </Text>
            <Text fontSize="md" mb={0} textAlign="left" wordBreak="break-word">
              {optionText}
            </Text>
          </Flex>
        </Button>
      </motion.div>
    )
  },
)

export default OptionButton
