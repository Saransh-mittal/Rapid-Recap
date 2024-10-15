import React, { Suspense } from 'react'
import {
  Flex,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { ViewIcon, SettingsIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { keyframes } from '@emotion/react'

// Lazy loaded components
const LeftProfileBox = React.lazy(() => import('./LeftProfileBox'))
const ProfileExperienceLevel = React.lazy(() =>
  import('./ProfileExperienceLevel'),
)
const ProfileButton = React.lazy(() => import('./ProfileButton'))
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

  const {
    isOpen: isOpenSeasonSelector,
    onOpen: onOpenSeasonSelector,
    onClose: onCloseSeasonSelector,
  } = useDisclosure()
  const {
    isOpen: isOpenBookmarks,
    onOpen: onOpenBookmarks,
    onClose: onCloseBookmarks,
  } = useDisclosure()
  const {
    isOpen: isOpenSettings,
    onOpen: onOpenSettings,
    onClose: onCloseSettings,
  } = useDisclosure()

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
      w={{
        lg: '45%',
        sm: '100%',
        base: '100%',
      }}
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
                <Flex
                  py={'8px'}
                  borderRadius="10px"
                  flexDirection="column"
                  w={'100%'}
                  height="fit-content"
                  justifyContent={'center'}
                  alignItems={'center'}
                  position={'relative'}
                  className="season-analytics"
                >
                  <ProfileButton
                    key={`season-analytics-${inGameName}`}
                    buttonText={t('seasonAnalytics')}
                    inGameName={inGameName}
                    stateUserInGameName={user?.inGameName}
                    Private={user?.profilePrivacy.seasonAnalytics}
                    hoverAnimation={hoverAnimation}
                    onClick={onOpenSeasonSelector}
                    icon={
                      <HistogramSVG
                        width={'20px'}
                        height={'20px'}
                        fill={'#fff'}
                      />
                    }
                    top={'0.9rem'}
                  />

                  <SeasonSelectorModal
                    key={`season-selector-${inGameName}`}
                    privateSeasonAnalytics={privacyProfileData.seasonAnalytics}
                    currSeason={profile?.currentSeason}
                    isOpen={isOpenSeasonSelector}
                    onClose={onCloseSeasonSelector}
                    isLoading={isLoading}
                    profile={profile}
                    privacyProfileData={privacyProfileData}
                    loginedUserProfile={loginedUserProfile}
                    inGameName={inGameName}
                    seasons={profile?.seasons}
                  />
                </Flex>
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
              <Flex
                borderRadius="10px"
                flexDirection="column"
                w={'100%'}
                height="fit-content"
                justifyContent={'center'}
                alignItems={'center'}
                position={'relative'}
              >
                <ProfileButton
                  key={`settings-${inGameName}`}
                  buttonText={t('Settings')}
                  inGameName={inGameName}
                  stateUserInGameName={user?.inGameName}
                  Private={true}
                  hoverAnimation={hoverAnimation}
                  onClick={onOpenSettings}
                  icon={<SettingsIcon width={'20px'} height={'20px'} />}
                />

                <Settings
                  key={`settings-modal-${inGameName}`}
                  isOpen={isOpenSettings}
                  onClose={onCloseSettings}
                />
              </Flex>

              <Flex
                borderRadius="10px"
                flexDirection="column"
                w={'100%'}
                height="fit-content"
                justifyContent={'center'}
                alignItems={'center'}
                position={'relative'}
                py={'8px'}
              >
                <ProfileButton
                  key={`bookmarks-${inGameName}`}
                  buttonText={t('bookmarks')}
                  inGameName={inGameName}
                  stateUserInGameName={user?.inGameName}
                  Private={true}
                  hoverAnimation={hoverAnimation}
                  onClick={onOpenBookmarks}
                  icon={<BookmarkSVG width={'20px'} height={'20px'} />}
                />

                <Bookmarks
                  key={`bookmarks-modal-${inGameName}`}
                  isOpen={isOpenBookmarks}
                  onClose={onCloseBookmarks}
                  isLoading={isLoading}
                  profile={profile}
                  inGameName={inGameName}
                />
              </Flex>
            </>
          )
        )}
      </Suspense>
    </Flex>
  )
}

export default LeftProfileSection
