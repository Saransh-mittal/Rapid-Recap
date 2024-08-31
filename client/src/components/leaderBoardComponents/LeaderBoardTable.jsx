import React, { useMemo, useCallback, Suspense } from 'react'
import {
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Skeleton,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

// Lazy load components
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

  // Memoize the data to avoid re-calculation
  const data = useMemo(
    () => (searchResults.length > 0 ? searchResults : leaders),
    [searchResults, leaders],
  )

  // Memoize the uniqueData
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

  // Memoize the navigate function
  const handleNavigate = useCallback(route => navigate(route), [navigate])

  return (
    <TableContainer width={'100%'} className="mainBoard" overflowX="auto">
      <Table variant={'unstyled'}>
        <TableCaption color={'white'} placement="top">
          {t('tableCaption')}
        </TableCaption>
        <Thead>
          <Tr boxShadow={'dark-lg'} letterSpacing={'2px'}>
            <Th textAlign={'center'} bg={'green.300'} color={'white'}>
              {t('rank')}
            </Th>
            {!isBaseScreen && (
              <Th textAlign={'center'} bg={'red.300'}>
                {t('name')}
              </Th>
            )}
            <Th textAlign={'center'} bg={'blue.300'} px={'0.5rem'}>
              {t('inGameName')}
            </Th>
            <Th textAlign={'center'} bg={'orange.300'}>
              {t('iqScores')}
            </Th>
            {!isLgScreen && (
              <Th textAlign={'center'} bg={'teal.300'}>
                {t('quizSubmissions')}
              </Th>
            )}
            {!isMdScreen && (
              <Th textAlign={'center'} bg={'pink.300'}>
                {t('avgRQMScore')}
              </Th>
            )}
          </Tr>
        </Thead>
        <Suspense fallback={<LoadingState />}>
          {searchLoad ? (
            <LoadingState />
          ) : (
            <Tbody marginTop={'20px'} className="Entries">
              {uniqueData.length > 0 &&
                uniqueData.map((user, index) => (
                  <LeaderBoardRow
                    key={`${user._id}-${index}`}
                    user={user}
                    index={index}
                    currUserChar={currUserChar}
                    isBaseScreen={isBaseScreen}
                    isLgScreen={isLgScreen}
                    isMdScreen={isMdScreen}
                    navigate={handleNavigate}
                  />
                ))}
              {currUserChar?.rank > 500 && (
                <>
                  <Tr>
                    <Td colSpan={6}>
                      <VerticalDotsSeparator />
                    </Td>
                  </Tr>
                  <LeaderBoardRow
                    key={`currentUser-${currUserChar._id}`}
                    user={currUserChar}
                    index={50}
                    currUserChar={currUserChar}
                    isBaseScreen={isBaseScreen}
                    navigate={handleNavigate}
                    isLgScreen={isLgScreen}
                    isMdScreen={isMdScreen}
                  />
                </>
              )}
              {loadNextPage &&
                hasMore &&
                Array.from({ length: PAGE_LIMIT }).map((_, index) => (
                  <Tr key={index}>
                    <Td colSpan={6}>
                      <Skeleton height="50px" borderRadius={'10px'} />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          )}
        </Suspense>
      </Table>
    </TableContainer>
  )
}

export default LeaderBoardTable
