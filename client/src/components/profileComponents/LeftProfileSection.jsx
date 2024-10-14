import React, { Suspense, useState } from 'react'
import {
  Flex,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useDisclosure,
  Tooltip,
  Container,
  Box,
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
        xl: '100%',
        lg: '70%',
        md: '80%',
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
              <Container padding={0}>
                <Flex flexDirection="column" width="100%" h={'100%'} m={0}>
                  <SkeletonText
                    noOfLines={1}
                    spacing="4"
                    skeletonHeight="20px"
                  />
                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent={'space-between'}
                    alignItems="center"
                    mt={4}
                  >
                    <Flex
                      justify="space-between"
                      align="left"
                      width="120px"
                      flexDirection="column"
                    >
                      <Box>
                        <Skeleton height="20px" width="100px" mb={2} />
                      </Box>
                      <Box position="relative" mb={4}>
                        <Skeleton
                          height="120px"
                          width="120px"
                          borderRadius="50%"
                          startColor="gray.200"
                          endColor="gray.400"
                        />
                      </Box>
                      <Box textAlign="left">
                        <Skeleton height="20px" width="100px" />
                      </Box>
                    </Flex>
                    <Flex textAlign={'center'}>
                      <Box>
                        <Skeleton height="20px" width="150px" mb={2} />
                        <Skeleton height="20px" width="150px" />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              </Container>
            </>
          }
        >
          {isLoading ? (
            <>
              <Container padding={0}>
                <Flex flexDirection="column" width="100%" h={'100%'} m={0}>
                  <SkeletonText
                    noOfLines={1}
                    spacing="4"
                    skeletonHeight="20px"
                  />
                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent={'space-between'}
                    alignItems="center"
                    mt={4}
                  >
                    <Flex
                      justify="space-between"
                      align="left"
                      width="120px"
                      flexDirection="column"
                    >
                      <Box>
                        <Skeleton height="20px" width="100px" mb={2} />
                      </Box>
                      <Box position="relative" mb={4}>
                        <Skeleton
                          height="120px"
                          width="120px"
                          borderRadius="50%"
                          startColor="gray.200"
                          endColor="gray.400"
                        />
                      </Box>
                      <Box textAlign="left">
                        <Skeleton height="20px" width="100px" />
                      </Box>
                    </Flex>
                    <Flex textAlign={'center'}>
                      <Box>
                        <Skeleton height="20px" width="150px" mb={2} />
                        <Skeleton height="20px" width="150px" />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              </Container>
            </>
          ) : (
            <ProfileExperienceLevel
              xp={profile?.experience?.xp}
              level={profile?.experience?.level}
            />
          )}
        </Suspense>
      </Flex>
      <Suspense
        fallback={
          <Skeleton
            // w={{ md: '85%', lg: '95%', base: '100%' }}
            w={'100%'}
            borderRadius="10px"
            height="50px"
            marginTop="12px"
          />
        }
      >
        {isLoading ? (
          <>
            <Skeleton
              w={{ md: '85%', lg: '95%', base: '100%' }}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
          </>
        ) : (
          <>
            {(!privacyProfileData.seasonAnalytics ||
              inGameName == user?.inGameName) &&
              user?.role !== 'guest' && (
                <Flex
                  py={'8px'}
                  borderRadius="10px"
                  flexDirection="column"
                  // w={{ md: '85%', lg: '95%', base: '100%' }}
                  w={'100%'}
                  height="fit-content"
                  justifyContent={'center'}
                  alignItems={'center'}
                  position={'relative'}
                  className="season-analytics"
                >
                  <ProfileButton
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
                {' '}
                <SecureYourProgress />
              </Suspense>
            )}
          </>
        )}
      </Suspense>
      <Suspense
        fallback={
          <>
            <Skeleton
              w={{ md: '85%', lg: '95%', base: '100%' }}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
            <Skeleton
              w={{ md: '85%', lg: '95%', base: '100%' }}
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
              w={{ md: '85%', lg: '95%', base: '100%' }}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
            <Skeleton
              w={{ md: '85%', lg: '95%', base: '100%' }}
              borderRadius="10px"
              height="50px"
              marginTop="12px"
            />
          </>
        ) : (
          inGameName == user?.inGameName && (
            <>
              <Suspense
                fallback={
                  <>
                    <Skeleton
                      w={{ md: '85%', lg: '95%', base: '100%' }}
                      borderRadius="10px"
                      height="50px"
                      marginTop="12px"
                    />
                    <Skeleton
                      w={{ md: '85%', lg: '95%', base: '100%' }}
                      borderRadius="10px"
                      height="50px"
                      marginTop="12px"
                    />
                  </>
                }
              >
                <Flex
                  borderRadius="10px"
                  flexDirection="column"
                  // w={{ md: '85%', lg: '95%', base: '100%' }}
                  w={'100%'}
                  height="fit-content"
                  justifyContent={'center'}
                  alignItems={'center'}
                  position={'relative'}
                >
                  <ProfileButton
                    buttonText={t('Settings')}
                    inGameName={inGameName}
                    stateUserInGameName={user?.inGameName}
                    Private={true}
                    hoverAnimation={hoverAnimation}
                    onClick={onOpenSettings}
                    icon={<SettingsIcon width={'20px'} height={'20px'} />}
                  />

                  <Settings isOpen={isOpenSettings} onClose={onCloseSettings} />
                </Flex>

                <Flex
                  borderRadius="10px"
                  flexDirection="column"
                  // w={{ md: '85%', lg: '95%', base: '100%' }}
                  w={'100%'}
                  height="fit-content"
                  justifyContent={'center'}
                  alignItems={'center'}
                  position={'relative'}
                  py={'8px'}
                >
                  <ProfileButton
                    buttonText={t('bookmarks')}
                    inGameName={inGameName}
                    stateUserInGameName={user?.inGameName}
                    Private={true}
                    hoverAnimation={hoverAnimation}
                    onClick={onOpenBookmarks}
                    icon={<BookmarkSVG width={'20px'} height={'20px'} />}
                  />

                  <Bookmarks
                    isOpen={isOpenBookmarks}
                    onClose={onCloseBookmarks}
                    isLoading={isLoading}
                    profile={profile}
                    inGameName={inGameName}
                  />
                </Flex>
              </Suspense>
            </>
          )
        )}
      </Suspense>
    </Flex>
  )
}
