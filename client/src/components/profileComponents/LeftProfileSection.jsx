import React, { Suspense } from 'react'
import { Flex, useDisclosure } from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'
import LeftProfileBox from './LeftProfileSectionComponents/LeftProfileBox'
import ProfileExperienceLevel from './LeftProfileSectionComponents/ProfileExperienceLevel'
import ProfileButtonWithModal from './LeftProfileSectionComponents/ProfileButtonsComponents/ProfileButtonWithModal'
// Lazy loaded components
const SeasonSelectorModal = React.lazy(() =>
  import(
    './LeftProfileSectionComponents/SeasonButtonComponents/SeasonSelectorModal'
  ),
)
const Settings = React.lazy(() =>
  import('./LeftProfileSectionComponents/Settings'),
)
const Bookmarks = React.lazy(() =>
  import('./LeftProfileSectionComponents/Bookmarks'),
)
const SecureYourProgress = React.lazy(() =>
  import('../miscellaneous/SecureYourProgress'),
)

import HistogramSVG from '../../assets/svg/HistogramSVG'
import BookmarkSVG from '../../assets/svg/BookmarkSVG'

export const LeftProfileSection = ({
  profile,
  user,
  inGameName,
  privacyProfileData,
  loginedUserProfile,
}) => {
  const { t } = useTranslation('Profile')

  const seasonSelectorDisclosure = useDisclosure()
  const bookmarksDisclosure = useDisclosure()
  const settingsDisclosure = useDisclosure()

  const hoverAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `
  const sharedBoxStyles = {
    bgGradient: 'linear(to-b, rgba(28, 20, 56, 0.4), rgba(15, 13, 21, 0.4))',
    border: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    transition: 'all 0.2s ease-in-out',
    _hover: {
      bgGradient: 'linear(to-b, rgba(35, 25, 70, 0.4), rgba(20, 17, 28, 0.4))',
      boxShadow: '0px 4px 25px rgba(0, 0, 0, 0.25)',
    },
    _before: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 'xl',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      pointerEvents: 'none',
    },
  }

  return (
    <Flex
      flexDirection={'column'}
      w={{ lg: '45%', sm: '100%', base: '100%' }}
      margin={'6px'}
    >
      <Flex
        {...sharedBoxStyles}
        marginTop={'18px'}
        padding="10px"
        borderRadius="10px"
        flexDirection="column"
        w={'100%'}
        height="fit-content"
      >
        <LeftProfileBox
          key={`left-profile-box-${inGameName}`}
          leftProfileView={profile?.leftProfileView}
          CURR_IQ={profile?.USER_IQ}
          MAX_IQ={profile?.maxIQScore}
        />
      </Flex>

      <Flex
        marginTop={'12px'}
        px={'15px'}
        py={'6px'}
        borderRadius="10px"
        flexDirection="column"
        w={'100%'}
        height="fit-content"
        {...sharedBoxStyles}
      >
        <ProfileExperienceLevel
          key={`profile-experience-${inGameName}`}
          xp={profile?.experience?.xp}
          level={profile?.experience?.level}
        />
      </Flex>

      {(!privacyProfileData.seasonAnalytics ||
        inGameName === user?.inGameName) &&
        user?.role !== 'guest' && (
          <ProfileButtonWithModal
            buttonText={t('seasonAnalytics')}
            inGameName={inGameName}
            stateUserInGameName={user?.inGameName}
            isPrivate={user?.profilePrivacy.seasonAnalytics}
            hoverAnimation={hoverAnimation}
            icon={<HistogramSVG width={'20px'} height={'20px'} fill={'#fff'} />}
            modalComponent={SeasonSelectorModal}
            isModalOpen={seasonSelectorDisclosure.isOpen}
            onOpenModal={seasonSelectorDisclosure.onOpen}
            onCloseModal={seasonSelectorDisclosure.onClose}
            additionalProps={{
              privateSeasonAnalytics: privacyProfileData.seasonAnalytics,
              currSeason: profile?.currentSeason,
              profile,
              privacyProfileData,
              loginedUserProfile,
              seasons: profile?.seasons,
            }}
          />
        )}
      {user?.role === 'guest' && (
        <Suspense fallback={null}>
          <SecureYourProgress key={`secure-progress-${inGameName}`} />
        </Suspense>
      )}

      {inGameName === user?.inGameName && (
        <>
          <ProfileButtonWithModal
            buttonText={t('Settings')}
            inGameName={inGameName}
            stateUserInGameName={user?.inGameName}
            isPrivate={true}
            hoverAnimation={hoverAnimation}
            icon={<SettingsIcon width={'20px'} height={'20px'} />}
            modalComponent={Settings}
            isModalOpen={settingsDisclosure.isOpen}
            onOpenModal={settingsDisclosure.onOpen}
            onCloseModal={settingsDisclosure.onClose}
          />

          <ProfileButtonWithModal
            buttonText={t('bookmarks')}
            inGameName={inGameName}
            stateUserInGameName={user?.inGameName}
            isPrivate={true}
            hoverAnimation={hoverAnimation}
            icon={<BookmarkSVG width={'20px'} height={'20px'} />}
            modalComponent={Bookmarks}
            isModalOpen={bookmarksDisclosure.isOpen}
            onOpenModal={bookmarksDisclosure.onOpen}
            onCloseModal={bookmarksDisclosure.onClose}
            additionalProps={{ profile }}
          />
        </>
      )}
    </Flex>
  )
}

export default LeftProfileSection
