import React from 'react'
import { Flex, Badge, useColorModeValue } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const ProfileBox = ({ loginedUserProfile, user, privacyKey, children }) => {
  const { t } = useTranslation('ProfileBox')

  return (
    <Flex
      w="100%"
      marginTop="10px"
      padding="20px"
      borderRadius="xl"
      position="relative"
      bgGradient="linear(to-b, rgba(28, 20, 56, 0.4), rgba(15, 13, 21, 0.4))"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.05)"
      boxShadow="0px 4px 20px rgba(0, 0, 0, 0.2)"
      _before={{
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
      }}
      backdropFilter="blur(12px)"
      flexDirection="column"
      transition="all 0.2s ease-in-out"
      _hover={{
        bgGradient:
          'linear(to-b, rgba(35, 25, 70, 0.4), rgba(20, 17, 28, 0.4))',
        boxShadow: '0px 4px 25px rgba(0, 0, 0, 0.25)',
      }}
    >
      <Flex w="100%" justifyContent="flex-end">
        {loginedUserProfile && (
          <Badge
            m={0}
            variant="solid"
            bg="rgba(72, 187, 120, 0.2)"
            color="green.200"
            borderRadius="md"
            px={2}
            py={0.5}
            fontSize="sm"
          >
            {user.profilePrivacy[privacyKey] ? t('hidden') : t('visible')}
          </Badge>
        )}
      </Flex>
      <Flex>{children}</Flex>
    </Flex>
  )
}

export default ProfileBox
