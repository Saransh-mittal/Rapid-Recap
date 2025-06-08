// components/quickClashComponents/VSLine.jsx
import React, { memo } from 'react'
import { Flex, Tag, Icon, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionTag = motion(Tag)

/**
 * Simplified VS Line component - displays VS indicator and category for active challenges
 * Protection information is now handled in PlayerStatus component
 */
const VSLine = ({
  category = null,
  categoryColorScheme = 'purple',
  isActiveChallenge = false,
  myAttempted = false,
}) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Flex
      justify="center"
      align="center"
      py={1}
      position="relative"
      width="100%"
    >
      {/* Center container with VS */}
      <Flex
        align="center"
        justify="center"
        position="relative"
        width="100%"
        zIndex={1}
      >
        {/* VS Tag - centered */}
        <MotionTag
          size="sm"
          colorScheme="gray"
          variant="subtle"
          borderRadius="full"
          whileHover={{ scale: 1.05 }}
          px={3}
          py={1}
          zIndex={2}
        >
          {t('vs')}
        </MotionTag>

        {/* Category Tag for Active Challenges - positioned to the right */}
        {isActiveChallenge && category && (
          <Tag
            position="absolute"
            right={0}
            size="sm"
            colorScheme={categoryColorScheme}
            borderRadius="full"
            px={3}
            zIndex={2}
            animation={
              isActiveChallenge && !myAttempted
                ? 'pulse 3s infinite ease-in-out'
                : 'none'
            }
            css={
              isActiveChallenge && !myAttempted
                ? `@keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                  }`
                : ''
            }
          >
            <Icon as={Target} size={12} mr={1} />
            <Text fontSize="xs">{category}</Text>
          </Tag>
        )}
      </Flex>
    </Flex>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(VSLine)
