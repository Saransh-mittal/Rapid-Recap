import React, { Suspense } from 'react'
import { Flex, Skeleton, useColorModeValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

// Lazy loaded components
const LineGraph = React.lazy(() =>
  import('./RightProfileSectionComponents/LineGraph'),
)
const IQBarGraph = React.lazy(() =>
  import('./RightProfileSectionComponents/IQBarGraph'),
)
const SolvedQuizzes = React.lazy(() =>
  import('./RightProfileSectionComponents/SolvedQuizzes'),
)
const RankAndSociety = React.lazy(() =>
  import('./RightProfileSectionComponents/RankAndSociety'),
)
const TournamentSection = React.lazy(() =>
  import('./RightProfileSectionComponents/TournamentSection'),
)
const ProfileBox = React.lazy(() => import('../miscellaneous/ProfileBox'))

export const RightProfileSection = ({
  profile,
  isLoading,
  user,
  inGameName,
  privacyProfileData,
  loginedUserProfile,
}) => {
  const { t: IQLineTranslate } = useTranslation('LineGraph')
  const { t: IQBarTranslate } = useTranslation('IQBarGraph')

  const renderProfileBox = (children, privacyKey) => {
    if (isLoading) {
      return <Skeleton height="250px" width="100%" borderRadius="10px" />
    }
    return (
      <ProfileBox
        key={`${inGameName}-${privacyKey}`}
        loginedUserProfile={loginedUserProfile}
        user={user}
        privacyKey={privacyKey}
      >
        {children}
      </ProfileBox>
    )
  }

  return (
    <Flex
      w={{
        xl: '100%',
        lg: '100%',
        md: '100%',
        sm: '100%',
        base: '100%',
      }}
      flexDirection="column"
      margin="6px"
      alignItems={'center'}
      borderRadius="10px"
      className="right-profile-box"
    >
      <Suspense
        fallback={
          <Flex
            w={'100%'}
            margin="10px"
            marginBottom="5px"
            justifyContent="space-between"
            flexDirection={{ xl: 'row', base: 'column' }}
            gap={5}
          >
            <Skeleton height="250px" width="100%" borderRadius="10px" />
            <Skeleton height="250px" width="100%" borderRadius="10px" />
          </Flex>
        }
      >
        <Flex
          w={'100%'}
          margin="10px"
          marginBottom="5px"
          flexDirection={{ xl: 'row', base: 'column' }}
          justifyContent="space-between"
          gap={5}
        >
          {renderProfileBox(
            <LineGraph
              key={`line-graph-${inGameName}`}
              lineGraph={profile?.lineGraph}
              privateLineGraph={privacyProfileData?.lineGraph}
              loginedUserProfile={loginedUserProfile}
              isGuest={user?.role === 'guest'}
              t={IQLineTranslate}
              quantities={[
                { label: IQLineTranslate('iqScore'), key: 'IQScore' },
                { label: IQLineTranslate('date'), key: 'date' },
                { label: IQLineTranslate('dailyRank'), key: 'dailyRank' },
              ]}
            />,
            'lineGraph',
          )}
          {renderProfileBox(
            <IQBarGraph
              key={`bar-graph-${inGameName}`}
              barGraph={profile?.barGraph}
              privateBarGraph={privacyProfileData?.lineGraph}
              loginedUserProfile={loginedUserProfile}
              isGuest={user?.role === 'guest'}
              t={IQBarTranslate}
            />,
            'barGraph',
          )}
        </Flex>
      </Suspense>
      <Suspense
        fallback={
          <>
            <Flex
              w={'100%'}
              margin="10px"
              marginBottom="5px"
              flexDirection={{ xl: 'row', base: 'column' }}
              justifyContent="space-between"
              gap={5}
            >
              <Skeleton height="250px" width="100%" borderRadius="10px" />
              <Skeleton height="250px" width="100%" borderRadius="10px" />
            </Flex>
            <Skeleton height="300px" width="100%" borderRadius="10px" />
          </>
        }
      >
        <Flex
          flexDirection={'column'}
          gap={'10px'}
          w={'100%'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Flex
            w={'100%'}
            margin="10px"
            marginBottom="5px"
            flexDirection={{ xl: 'row', base: 'column' }}
            justifyContent="space-between"
            gap={5}
          >
            {renderProfileBox(
              <SolvedQuizzes
                key={`solved-quizzes-${inGameName}`}
                privateSolvedQuiz={
                  privacyProfileData?.solvedQuizzes && !loginedUserProfile
                }
                loginedUserProfile={loginedUserProfile}
                solvedQuizzes={profile?.solvedQuizzes}
                inGameName={inGameName}
              />,
              'solvedQuizzes',
            )}
            {renderProfileBox(
              <RankAndSociety
                key={`rank-society-${inGameName}`}
                privateSociety={privacyProfileData?.society}
                loginedUserProfile={loginedUserProfile}
                USER_IQ={profile?.barGraph?.USER_IQ}
                isGuest={user?.role === 'guest'}
              />,
              'society',
            )}
          </Flex>
          {renderProfileBox(
            <TournamentSection
              key={`tournament-${inGameName}`}
              privateTournament={privacyProfileData?.tournamentAnalytics}
              loginedUserProfile={loginedUserProfile}
              isGuest={user?.role === 'guest'}
              userId={profile?.userId}
            />,
            'tournamentAnalytics',
          )}
        </Flex>
      </Suspense>
    </Flex>
  )
}

export default RightProfileSection
