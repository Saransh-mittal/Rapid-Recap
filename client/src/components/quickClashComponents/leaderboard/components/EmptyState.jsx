// components/quickClashComponents/leaderboard/components/EmptyState.jsx
import React from 'react'
import { Center, VStack, Text, Icon, Button } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion.div

const EmptyState = React.memo(({ searchQuery, handleClearSearch }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Center py={10} h="50vh">
      <VStack spacing={3}>
        <MotionBox
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon as={Search} color="whiteAlpha.500" boxSize={7} />
        </MotionBox>
        <Text color="whiteAlpha.700" fontSize="sm">
          {t('No players found')}
        </Text>
        {searchQuery && (
          <Button
            onClick={handleClearSearch}
            variant="outline"
            colorScheme="purple"
            size="xs"
            mt={2}
          >
            {t('Clear Search')}
          </Button>
        )}
      </VStack>
    </Center>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState
