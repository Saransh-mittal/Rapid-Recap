// components/quickClashComponents/globalmatchmaking/components/TeamSelectionPanel.jsx
import React, { useCallback } from 'react'
import {
  Box,
  Text,
  VStack,
  HStack,
  Center,
  Spinner,
  Icon,
  Badge,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Users, User } from 'lucide-react'

const MotionBox = motion(Box)
const motionBoxProps = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 },
  cursor: 'pointer',
  p: 3,
  borderRadius: 'md',
  borderWidth: '1px',
}

// --- Optimization: Co-located memoized component for list items ---
const SelectionOption = React.memo(({ option, isSelected, onSelectTeam }) => {
  const { t } = useTranslation('QuickClash')

  const handleSelect = useCallback(() => {
    onSelectTeam(option.id)
  }, [onSelectTeam, option.id])

  return (
    <MotionBox
      {...motionBoxProps}
      bg={isSelected ? 'rgba(128, 90, 213, 0.2)' : 'rgba(26, 32, 44, 0.6)'}
      borderColor={isSelected ? 'purple.500' : 'whiteAlpha.200'}
      onClick={handleSelect}
    >
      <HStack justify="space-between">
        <HStack>
          <Icon
            as={option.isSolo ? User : Users}
            color="purple.400"
            boxSize={5}
          />
          <Text
            color="white"
            fontWeight={isSelected ? 'bold' : 'normal'}
            noOfLines={1}
          >
            {option.name}
          </Text>
        </HStack>
        <Badge
          colorScheme={option.isSolo ? 'green' : 'blue'}
          minW="fit-content"
        >
          {option.isSolo ? t('Solo') : option.badgeContent}
        </Badge>
      </HStack>
    </MotionBox>
  )
})
SelectionOption.displayName = 'SelectionOption'

/**
 * Panel for selecting teams before joining matchmaking
 */
const TeamSelectionPanel = React.memo(
  ({ myTeams, loadingTeams, selectedTeamId, onSelectTeam }) => {
    const { t } = useTranslation('QuickClash')

    if (loadingTeams) {
      return (
        <Box>
          <Text color="whiteAlpha.900" fontWeight="bold" mb={3}>
            {t('Choose Your Entry')}
          </Text>
          <Center py={4}>
            <Spinner color="purple.400" />
          </Center>
        </Box>
      )
    }

    const soloOption = { id: null, name: t('Join Individually'), isSolo: true }

    return (
      <Box>
        <Text color="whiteAlpha.900" fontWeight="bold" mb={3}>
          {t('Choose Your Entry')}
        </Text>
        <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
          <SelectionOption
            option={soloOption}
            isSelected={!selectedTeamId}
            onSelectTeam={onSelectTeam}
          />

          {myTeams && myTeams.length > 0 ? (
            myTeams.map(team => (
              <SelectionOption
                key={team._id}
                option={{
                  id: team._id,
                  name: team.name,
                  isSolo: false,
                  badgeContent: `${team.members.length}/4`,
                }}
                isSelected={selectedTeamId === team._id}
                onSelectTeam={onSelectTeam}
              />
            ))
          ) : (
            <Box textAlign="center" py={4}>
              <Text color="whiteAlpha.700">{t('You have no teams')}</Text>
            </Box>
          )}
        </VStack>
      </Box>
    )
  },
)

TeamSelectionPanel.displayName = 'TeamSelectionPanel'
export default TeamSelectionPanel
