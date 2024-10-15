import React, { Suspense } from 'react'
import { Box, Flex, Skeleton } from '@chakra-ui/react'
import { useProfile } from '../customHooks/useProfile'
import { ProfileMetadata } from '../components/profileComponents/ProfileMetadata'
import { LeftProfileSection } from '../components/profileComponents/LeftProfileSection'
import { RightProfileSection } from '../components/profileComponents/RightProfileSection'
import { findSocietyAndCircle } from '../utils/helper.utils'

export default function Profile() {
  const {
    profile,
    isLoading,
    user,
    inGameName,
    privacyProfileData,
    loginedUserProfile,
  } = useProfile()

  return (
    <Box marginTop={'4.5rem'} w={'100%'}>
      <ProfileMetadata
        profile={profile}
        userSocietyAndCircle={findSocietyAndCircle(user?.IQ_score)}
      />
      <Flex
        flexDirection={{ base: 'column', md: 'row' }}
        marginTop="20px"
        marginInline={{ base: '2%', xl: '6.5%' }}
        alignItems={{ base: 'center', md: 'normal' }}
        justifyContent={{ base: 'center', md: 'center', lg: 'normal' }}
        className="profile-info"
        gap={'3rem'}
      >
        <Suspense fallback={<Skeleton height="600px" width="100%" />}>
          <LeftProfileSection
            profile={profile}
            isLoading={isLoading}
            user={user}
            inGameName={inGameName}
            privacyProfileData={privacyProfileData}
            loginedUserProfile={loginedUserProfile}
          />
        </Suspense>
        <Suspense fallback={<Skeleton height="600px" width="100%" />}>
          <RightProfileSection
            profile={profile}
            isLoading={isLoading}
            user={user}
            inGameName={inGameName}
            privacyProfileData={privacyProfileData}
            loginedUserProfile={loginedUserProfile}
          />
        </Suspense>
      </Flex>
    </Box>
  )
}
