import React, { Suspense, useEffect } from 'react'
import { Box, Flex, Skeleton } from '@chakra-ui/react'
import { useProfile } from '../customHooks/useProfile'
import { ProfileMetadata } from '../components/profileComponents/ProfileMetadata'
import { LeftProfileSection } from '../components/profileComponents/LeftProfileSection'
import { RightProfileSection } from '../components/profileComponents/RightProfileSection'
import { findSocietyAndCircle } from '../utils/helper.utils'
import LeftProfileSectionSkeleton from '../components/profileComponents/LeftProfileSectionSkeleton'
import RightProfileSectionSkeleton from '../components/profileComponents/RightProfileSectionSkeleton'

export default function Profile() {
  const {
    profile,
    isLoading,
    user,
    inGameName,
    privacyProfileData,
    loginedUserProfile,
  } = useProfile()

  useEffect(() => {
    document.title = `${inGameName}'s Rapid Recap Profile${
      profile ? ` | IQ Score: ${profile.USER_IQ}` : ''
    }`
  }, [inGameName, profile])

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
        {isLoading ? (
          <LeftProfileSectionSkeleton />
        ) : (
          <LeftProfileSection
            key={`left-${inGameName}`}
            profile={profile}
            user={user}
            inGameName={inGameName}
            privacyProfileData={privacyProfileData}
            loginedUserProfile={loginedUserProfile}
          />
        )}

        {isLoading ? (
          <RightProfileSectionSkeleton />
        ) : (
          <RightProfileSection
            key={`right-${inGameName}`}
            profile={profile}
            user={user}
            inGameName={inGameName}
            privacyProfileData={privacyProfileData}
            loginedUserProfile={loginedUserProfile}
          />
        )}
      </Flex>
    </Box>
  )
}
