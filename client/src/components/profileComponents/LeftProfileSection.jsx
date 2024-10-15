import React, { Suspense } from 'react'
import {
  Flex,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'

// Lazy loaded components
const LeftProfileBox = React.lazy(() => import('./LeftProfileBox'))
const ProfileExperienceLevel = React.lazy(() =>
  import('./ProfileExperienceLevel'),
)
const ProfileButtonWithModal = React.lazy(() =>
  import('./ProfileButtonWithModal'),
)
const SeasonSelectorModal = React.lazy(() => import('./SeasonSelectorModal'))
const Settings = React.lazy(() => import('./Settings'))
const Bookmarks = React.lazy(() => import('./Bookmarks'))
const SecureYourProgress = React.lazy(() =>
  import('../miscellaneous/SecureYourProgress'),
)

import HistogramSVG from '../../assets/svg/HistogramSVG'
import BookmarkSVG from '../../assets/svg/BookmarkSVG'

export const LeftProfileSection = ({
  profile,
  isLoading,
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
  const bgColor = useColorModeValue(
    'rgba(26, 32, 44, 0.8)',
    'rgba(23, 25, 35, 0.8)',
  )
  const borderColor = useColorModeValue('gold', 'goldenrod')

  return (
    <Flex
      flexDirection={'column'}
      w={{ lg: '45%', sm: '100%', base: '100%' }}
      margin={'6px'}
    >
      <Flex
        marginTop={'18px'}
        padding="10px"
        borderRadius="10px"
        flexDirection="column"
        w={'100%'}
        height="fit-content"
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
      >
        <Suspense fallback={<SkeletonCircle size="10" />}>
          {isLoading ? (
            <>
              <SkeletonCircle size="10" />
              <SkeletonText mt="4" noOfLines={4} spacing="4" />
            </>
          ) : (
            <LeftProfileBox
              key={`left-profile-box-${inGameName}`}
              leftProfileView={profile?.leftProfileView}
              CURR_IQ={profile?.USER_IQ}
              MAX_IQ={profile?.maxIQScore}
            />
          )}
        </Suspense>
      </Flex>

      <Flex
        marginTop={'12px'}
        px={'15px'}
        py={'6px'}
        borderRadius="10px"
        flexDirection="column"
        w={'100%'}
        height="fit-content"
        bg={bgColor}
        border={'1px solid'}
        borderColor={borderColor}
      >
        <Suspense
          fallback={
            <>
              <SkeletonText noOfLines={1} spacing="4" skeletonHeight="20px" />
              <Skeleton
                height="120px"
                width="120px"
                borderRadius="50%"
                mt={4}
              />
              <Skeleton height="20px" width="150px" mt={2} />
            </>
          }
        >
          {isLoading ? (
            <>
              <SkeletonText noOfLines={1} spacing="4" skeletonHeight="20px" />
              <Skeleton
                height="120px"
                width="120px"
                borderRadius="50%"
                mt={4}
              />
              <Skeleton height="20px" width="150px" mt={2} />
            </>
          ) : (
            <ProfileExperienceLevel
              key={`profile-experience-${inGameName}`}
              xp={profile?.experience?.xp}
              level={profile?.experience?.level}
            />
          )}
        </Suspense>
      </Flex>

      <Suspense
        fallback={
          <Skeleton
            w={'100%'}
            borderRadius="10px"
            height="50px"
            marginTop="12px"
          />
        }
      >
        {isLoading ? (
          <Skeleton
            w={'100%'}
            borderRadius="10px"
            height="50px"
            marginTop="12px"
          />
        ) : (
          <>
            {(!privacyProfileData.seasonAnalytics ||
              inGameName === user?.inGameName) &&
              user?.role !== 'guest' && (
                <ProfileButtonWithModal
                  buttonText={t('seasonAnalytics')}
                  inGameName={inGameName}
                  stateUserInGameName={user?.inGameName}
                  isPrivate={user?.profilePrivacy.seasonAnalytics}
                  hoverAnimation={hoverAnimation}
                  icon={
                    <HistogramSVG
                      width={'20px'}
                      height={'20px'}
                      fill={'#fff'}
                    />
                  }
                  modalComponent={SeasonSelectorModal}
                  isModalOpen={seasonSelectorDisclosure.isOpen}
                  onOpenModal={seasonSelectorDisclosure.onOpen}
                  onCloseModal={seasonSelectorDisclosure.onClose}
                  isLoading={isLoading}
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
          </>
        )}
      </Suspense>

      <Suspense
        fallback={
          <>
            <Skeleton
              w={'100%'}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
            <Skeleton
              w={'100%'}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
          </>
        }
      >
        {isLoading ? (
          <>
            <Skeleton
              w={'100%'}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
            <Skeleton
              w={'100%'}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
          </>
        ) : (
          inGameName === user?.inGameName && (
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
                isLoading={isLoading}
                additionalProps={{ profile }}
              />
            </>
          )
        )}
      </Suspense>
    </Flex>
  )
}

export default LeftProfileSection
