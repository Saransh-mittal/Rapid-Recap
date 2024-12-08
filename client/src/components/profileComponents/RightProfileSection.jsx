import React from 'react'
import { Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import ProfileBox from '../miscellaneous/ProfileBox'
import LineGraph from './RightProfileSectionComponents/LineGraph'
import IQBarGraph from './RightProfileSectionComponents/IQBarGraph'
import SolvedQuizzes from './RightProfileSectionComponents/SolvedQuizzes'
import RankAndSociety from './RightProfileSectionComponents/RankAndSociety'
import TournamentSection from './RightProfileSectionComponents/TournamentSection'

// Lazy loaded components

export const RightProfileSection = ({
  profile,
  user,
  inGameName,
  privacyProfileData,
  loginedUserProfile,
}) => {
  const { t: IQLineTranslate } = useTranslation('LineGraph')
  const { t: IQBarTranslate } = useTranslation('IQBarGraph')

  const renderProfileBox = (children, privacyKey) => {
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
            privateTournament={privacyProfileData?.tournamentAnalytics}
            loginedUserProfile={loginedUserProfile}
            isGuest={user?.role === 'guest'}
            userId={profile?.userId}
          />,
          'tournamentAnalytics',
        )}
      </Flex>
    </Flex>
  )
}

export default RightProfileSection
