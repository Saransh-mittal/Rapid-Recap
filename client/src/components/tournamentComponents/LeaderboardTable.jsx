import React, {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from 'react'
import {
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Flex,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useTranslation } from 'react-i18next' // Import the useTranslation hook

// Lazy load UserStatsModal
const UserStatsModal = React.lazy(() => import('./UserStatsModal'))
const Medal = React.lazy(() => import('../../assets/svg/Medal'))
const TrophySVG = React.lazy(() => import('../../assets/svg/TrophySVG'))
const CrownSVG = React.lazy(() => import('../../assets/svg/CrownSVG'))

const MotionBox = motion(Box)

const LeaderboardTable = forwardRef(({ data, tournamentId }, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedUserStats, setSelectedUserStats] = useState(null)

  const { t } = useTranslation('LeaderboardTable') // Load translations from the 'LeaderBoard' namespace
  const { t: userStatstranlate } = useTranslation('UserStatsModal')

  // Memoize the handleRowClick function to avoid unnecessary re-creation
  const handleRowClick = useCallback(
    async (userId, inGameName) => {
      try {
        const response = await axios.get(
          `/api/tournament/user-stats/${tournamentId}/${userId}`,
        )
        setSelectedUserStats({ ...response.data, inGameName })
        onOpen()
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    },
    [tournamentId, onOpen],
  )

  // Memoize the table rows to avoid unnecessary re-renders
  const tableRows = useMemo(() => {
    return data.map((player, index) => (
      <MotionBox
        as={Tr}
        key={`${player.rank}-${player.inGameName}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          delay: (index % 20) * 0.1,
        }}
        _hover={{
          bg: 'whiteAlpha.100',
          transition: 'background-color 0.2s',
          cursor: 'pointer',
        }}
        borderBottom="1px solid"
        borderColor="whiteAlpha.300"
        onClick={() => handleRowClick(player.userId, player.inGameName)}
      >
        <Td textAlign={'center'}>
          {player.rank === 1 && (
            <Flex justifyContent={'center'}>
              <CrownSVG color="gold" width={'20px'} height={'20px'} />
            </Flex>
          )}
          {player.rank === 2 && (
            <Flex justifyContent={'center'}>
              <TrophySVG color="silver" width={'20px'} height={'20px'} />
            </Flex>
          )}
          {player.rank === 3 && (
            <Flex justifyContent={'center'}>
              <Medal color="#CD7F32" width={'25px'} height={'25px'} />
            </Flex>
          )}
          {player.rank > 3 && (
            <Text fontSize={{ base: 'xs', md: 'lg' }} fontWeight="bold">
              {player.rank}
            </Text>
          )}
        </Td>
        <Td>
          <VStack spacing={0} align={'left'} w={'fit-content'} ml={'25%'}>
            <Text
              fontSize={{ base: 'xs', md: 'sm' }}
              fontWeight="semibold"
              textAlign={'left'}
            >
              {player.name}
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.400">
              @{player.inGameName}
            </Text>
          </VStack>
        </Td>
        <Td textAlign={'center'} isNumeric>
          <Text fontSize={{ base: 'xs', md: 'lg' }} fontWeight="bold">
            {player.score}
          </Text>
        </Td>
      </MotionBox>
    ))
  }, [data, handleRowClick])

  return (
    <>
      <Box
        maxHeight="500px"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '0px',
          },
          '&::-webkit-scrollbar-track': {
            width: '0px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'transparent',
            borderRadius: '24px',
          },
        }}
      >
        <Table variant="unstyled">
          <Thead position="sticky" top={0} zIndex={1} bg="gray.800">
            <Tr>
              <Th
                color="white"
                fontSize={{ base: 'xs', md: 'lg' }}
                px={{ base: 4, md: 6 }}
                textAlign={'center'}
              >
                {t('Rank')} {/* Translate Rank */}
              </Th>
              <Th
                color="white"
                fontSize={{ base: 'xs', md: 'lg' }}
                px={6}
                textAlign={'center'}
              >
                {t('Player')} {/* Translate Player */}
              </Th>
              <Th
                color="white"
                fontSize={{ base: 'xs', md: 'lg' }}
                px={6}
                textAlign={'center'}
                isNumeric
              >
                {t('Score')} {/* Translate Score */}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableRows}
            {data && data.length > 0 && (
              <Tr>
                <Td ref={ref} style={{ height: '20px' }} />
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      <Suspense fallback={<Box>{t('LoadingUserStats')}</Box>}>
        <UserStatsModal
          isOpen={isOpen}
          onClose={onClose}
          userStats={selectedUserStats}
          t={userStatstranlate}
        />
      </Suspense>
    </>
  )
})

export default LeaderboardTable
