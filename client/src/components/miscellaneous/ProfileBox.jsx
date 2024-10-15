import React from 'react'
import { Flex, Badge, useColorModeValue } from '@chakra-ui/react'

const ProfileBox = ({ loginedUserProfile, user, privacyKey, children }) => {
  const bgColor = useColorModeValue(
    'rgba(26, 32, 44, 0.8)',
    'rgba(23, 25, 35, 0.8)',
  )
  const borderColor = useColorModeValue('gold', 'goldenrod')

  return (
    <Flex
      w={'100%'}
      marginTop={'10px'}
      padding={'10px'}
      borderRadius="10px"
      bg={bgColor}
      border={`1px solid ${borderColor}`}
      flexDirection={'column'}
    >
      <Flex w={'100%'} justifyContent={'flex-end'}>
        {loginedUserProfile && (
          <Badge m={0} colorScheme="green">
            {user.profilePrivacy[privacyKey] ? 'hidden' : 'visible'}
          </Badge>
        )}
      </Flex>
      <Flex>{children}</Flex>
    </Flex>
  )
}

export default ProfileBox
