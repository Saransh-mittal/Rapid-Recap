// components/quickClashComponents/globalmatchmaking/components/TeamSelectionPanel.jsx
import React from 'react'
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

    if (!myTeams || myTeams.length === 0) {
      return (
        <Box>
          <Text color="whiteAlpha.900" fontWeight="bold" mb={3}>
            {t('Choose Your Entry')}
          </Text>
          <VStack spacing={2} align="stretch">
            <MotionBox
              p={3}
              borderRadius="md"
              bg="rgba(128, 90, 213, 0.2)"
              borderWidth="1px"
              borderColor="purple.500"
              cursor="pointer"
              onClick={() => onSelectTeam(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <HStack justify="space-between">
                <HStack>
                  <Icon as={User} color="purple.400" boxSize={5} />
                  <Text color="white" fontWeight="bold">
                    {t('Join Individually')}
                  </Text>
                </HStack>
                <Badge colorScheme="green">{t('Solo')}</Badge>
              </HStack>
            </MotionBox>

            <Box textAlign="center" py={4}>
              <Text color="whiteAlpha.700">{t('You have no teams')}</Text>
            </Box>
          </VStack>
        </Box>
      )
    }

    return (
      <Box>
        <Text color="whiteAlpha.900" fontWeight="bold" mb={3}>
          {t('Choose Your Entry')}
        </Text>
        <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
          {/* Solo option */}
          <MotionBox
            p={3}
            borderRadius="md"
            bg={
              !selectedTeamId
                ? 'rgba(128, 90, 213, 0.2)'
                : 'rgba(26, 32, 44, 0.6)'
            }
            borderWidth="1px"
            borderColor={!selectedTeamId ? 'purple.500' : 'whiteAlpha.200'}
            cursor="pointer"
            onClick={() => onSelectTeam(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <HStack justify="space-between">
              <HStack>
                <Icon as={User} color="purple.400" boxSize={5} />
                <Text
                  color="white"
                  fontWeight={!selectedTeamId ? 'bold' : 'normal'}
                >
                  {t('Join Individually')}
                </Text>
              </HStack>
              <Badge colorScheme="green">{t('Solo')}</Badge>
            </HStack>
          </MotionBox>

          {/* Team options */}
          {myTeams.map(team => (
            <MotionBox
              key={team._id}
              p={3}
              borderRadius="md"
              bg={
                selectedTeamId === team._id
                  ? 'rgba(128, 90, 213, 0.2)'
                  : 'rgba(26, 32, 44, 0.6)'
              }
              borderWidth="1px"
              borderColor={
                selectedTeamId === team._id ? 'purple.500' : 'whiteAlpha.200'
              }
              cursor="pointer"
              onClick={() => onSelectTeam(team._id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <HStack justify="space-between">
                <HStack>
                  <Icon as={Users} color="purple.400" boxSize={5} />
                  <Text
                    color="white"
                    fontWeight={selectedTeamId === team._id ? 'bold' : 'normal'}
                    noOfLines={1}
                  >
                    {team.name}
                  </Text>
                </HStack>
                <Badge colorScheme="blue" minW="fit-content">
                  {team.members.length}/4
                </Badge>
              </HStack>
            </MotionBox>
          ))}
        </VStack>
      </Box>
    )
  },
)

TeamSelectionPanel.displayName = 'TeamSelectionPanel'

export default TeamSelectionPanel
