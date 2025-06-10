// components/quickClashComponents/globalmatchmaking/components/StatusUpdatesPanel.jsx
import React from 'react'
import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

// --- Optimization: Define constant animation objects outside the component ---
const itemAnimation = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
}

/**
 * Panel that displays recent status updates during matchmaking
 */
const StatusUpdatesPanel = React.memo(({ statusUpdates }) => {
  const { t } = useTranslation('QuickClash')

  if (!statusUpdates || statusUpdates.length === 0) {
    return null
  }

  return (
    <Box
      w={{ base: '95%', md: '90%' }}
      bg="rgba(0, 0, 0, 0.3)"
      borderRadius="md"
      p={3}
      borderWidth="1px"
      borderColor="whiteAlpha.200"
    >
      <Text color="whiteAlpha.600" fontSize="xs" mb={2}>
        {t('Recent Updates')}
      </Text>
      <VStack spacing={1} align="stretch" maxH="100px" overflowY="auto">
        <AnimatePresence initial={false}>
          {statusUpdates.map(update => (
            <MotionBox key={update.id} {...itemAnimation}>
              <HStack justify="space-between">
                <Text
                  color="whiteAlpha.900"
                  fontSize="sm"
                  noOfLines={1}
                  flex="1"
                >
                  {update.message}
                </Text>
                <Text
                  color="whiteAlpha.500"
                  fontSize="xs"
                  fontFamily="mono"
                  minW="35px"
                  textAlign="right"
                >
                  {update.time}s
                </Text>
              </HStack>
            </MotionBox>
          ))}
        </AnimatePresence>
      </VStack>
    </Box>
  )
})

StatusUpdatesPanel.displayName = 'StatusUpdatesPanel'
export default StatusUpdatesPanel
