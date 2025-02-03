// src/components/UserCard.js

import React from 'react'
import {
  Box,
  HStack,
  Flex,
  VStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import Medal from '../../assets/svg/Medal'

const UserCard = ({ user, t }) => {
  const navigate = useNavigate()
  if (user?.role === 'guest') {
    return null
  }
  if (user?.needsOnboarding) return null
  return (
    user &&
    user.IQ_score && (
      <Box
        bg="whiteAlpha.200"
        p={4}
        borderRadius="md"
        boxShadow="md"
        cursor="pointer"
        onClick={() => navigate(`/profile/${user.inGameName}`)}
        _hover={{ bg: 'whiteAlpha.300' }}
        height={'120px'}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <HStack>
            <Flex mb={'auto'} mt={1}>
              <Medal color="#ECC94B" size={'25px'} />
            </Flex>
            <VStack alignItems="flex-start" spacing={0}>
              <Text fontWeight="bold">{t('Your_Rank')}</Text>
              <Text fontSize="2xl" fontWeight="bold" color="pink.400">
                #
                {user?.needsOnboarding && user?.rank === 0
                  ? ' ' + t('rankNA')
                  : user.rank}
              </Text>
            </VStack>
          </HStack>
          <VStack alignItems="flex-end" spacing={0}>
            <Text fontWeight="bold">{user.name}</Text>
            <Text color="gray.400">@{user.inGameName}</Text>
            <Text fontSize="xl" fontWeight="bold" color="pink.400">
              {t('IQ_Score')}: {user.IQ_score}
            </Text>
          </VStack>
        </HStack>
      </Box>
    )
  )
}

export default UserCard
