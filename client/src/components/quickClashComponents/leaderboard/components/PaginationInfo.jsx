// components/quickClashComponents/leaderboard/components/PaginationInfo.jsx
import React from 'react'
import { Flex, HStack, Text, Icon } from '@chakra-ui/react'
import { Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const PaginationInfo = React.memo(({ pagination }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Flex
      justify="center"
      align="center"
      p={2}
      borderTopWidth="1px"
      borderTopColor="rgba(255, 255, 255, 0.03)"
    >
      <HStack spacing={1}>
        <Icon as={Trophy} color="yellow.400" boxSize={3} />
        <Text color="whiteAlpha.600" fontSize="2xs" letterSpacing="wider">
          {t('Showing')} {pagination.page} {t('of')}{' '}
          {pagination.totalPages || 1} • {pagination.totalUsers} {t('Players')}
        </Text>
      </HStack>
    </Flex>
  )
})

PaginationInfo.displayName = 'PaginationInfo'

export default PaginationInfo
