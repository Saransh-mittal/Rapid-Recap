import React, { useMemo, useCallback, Suspense } from 'react'
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Box,
  VStack,
  Flex,
  Image,
  Text,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
const LeaderBoardRow = React.lazy(() => import('./LeaderBoardRow'))
const LoadingState = React.lazy(() => import('./LoadingState'))
const VerticalDotsSeparator = React.lazy(() =>
  import('./VerticalDotsSeparator'),
)

const LeaderBoardTable = ({
  leaders,
  searchResults,
  searchLoad,
  isBaseScreen,
  isLgScreen,
  isMdScreen,
  currUserChar,
  navigate,
  loadNextPage,
  PAGE_LIMIT,
  hasMore,
}) => {
  const { t } = useTranslation('LeaderBoardTable')
  const data = useMemo(
    () => (searchResults.length > 0 ? searchResults : leaders),
    [searchResults, leaders],
  )

  const uniqueData = useMemo(() => {
    const seenUserIds = new Set()
    return data.filter(user => {
      if (seenUserIds.has(user._id)) {
        return false
      } else {
        seenUserIds.add(user._id)
        return true
      }
    })
  }, [data])

  const handleNavigate = useCallback(route => navigate(route), [navigate])

  const textColor = useColorModeValue('gray.100', 'gray.50')
  const accentColor = useColorModeValue('purple.500', 'purple.300')

  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })
  const isDesktop = useBreakpointValue({ base: false, lg: true })

  return (
    <Box overflowX="hidden">
      <Table variant="unstyled">
        <Thead>
          <Tr>
            <Th
              textAlign="center"
              color={accentColor}
              paddingX={{ base: '0', md: '24px' }}
            >
              {t('rank')}
            </Th>
            <Th
              textAlign="center"
              color={accentColor}
              paddingX={{ base: '0', md: '24px' }}
            >
              {t('Player')}
            </Th>
            {isTablet && (
              <Th textAlign="center" color={accentColor}>
                {t('Experience')}
              </Th>
            )}
            <Th
              textAlign="center"
              color={accentColor}
              paddingX={{ base: '0', md: '24px' }}
            >
              {t('iqScores')}
            </Th>
            {isDesktop && (
              <>
                <Th textAlign="center" color={accentColor}>
                  {t('quizSubmissions')}
                </Th>
                <Th textAlign="center" color={accentColor}>
                  {t('avgRQMScore')}
                </Th>
              </>
            )}
          </Tr>
        </Thead>
        <Suspense fallback={<LoadingState />}>
          {searchLoad ? (
            <LoadingState />
          ) : (
            <Tbody>
              {uniqueData.length > 0 &&
                uniqueData.map((user, index) => (
                  <LeaderBoardRow
                    key={`${user._id}-${index}`}
                    user={user}
                    index={index}
                    currUserChar={currUserChar}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isDesktop={isDesktop}
                    navigate={handleNavigate}
                    textColor={textColor}
                    accentColor={accentColor}
                  />
                ))}
              {currUserChar?.rank > 500 && (
                <>
                  <Tr>
                    <Td colSpan={isDesktop ? 6 : 4}>
                      <VerticalDotsSeparator />
                    </Td>
                  </Tr>
                  <LeaderBoardRow
                    key={`currentUser-${currUserChar._id}`}
                    user={currUserChar}
                    index={50}
                    currUserChar={currUserChar}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isDesktop={isDesktop}
                    navigate={handleNavigate}
                    textColor={textColor}
                    accentColor={accentColor}
                  />
                </>
              )}
              {loadNextPage &&
                hasMore &&
                Array.from({ length: PAGE_LIMIT }).map((_, index) => (
                  <Tr key={index}>
                    <Td colSpan={isDesktop ? 6 : 4}>
                      <Box height="50px" borderRadius={'10px'} bg="gray.800" />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          )}
        </Suspense>
      </Table>
    </Box>
  )
}

export default LeaderBoardTable
