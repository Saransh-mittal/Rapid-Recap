import React, { lazy, Suspense, useCallback } from 'react'
import { Box, Flex, Td, Tr, VStack, Image, Text } from '@chakra-ui/react'
import { findSocietyAndCircle } from '../../utils/helper.utils'

const NameLightning = lazy(() => import('../miscellaneous/NameLightning'))

const LeaderBoardRow = React.memo(
  ({
    user,
    index,
    currUserChar,
    isMobile,
    isTablet,
    isDesktop,
    navigate,
    textColor,
    accentColor,
  }) => {
    const urlInGameName = user?.inGameName?.replace(/\./g, '%2E')

    const handleNavigate = useCallback(() => {
      navigate(`/profile/${urlInGameName}`)
    }, [navigate, urlInGameName])

    return (
      <Tr
        key={user._id}
        className={
          currUserChar?.inGameName === user.inGameName
            ? 'highlighted-card-2'
            : ''
        }
        onClick={handleNavigate}
        cursor={'pointer'}
        _hover={{ bg: 'whiteAlpha.100' }}
        transition="background 0.2s"
      >
        <Td textAlign="center" paddingX={{ base: '0', md: '24px' }}>
          <Box
            as="span"
            fontWeight="bold"
            fontSize={{ base: 'lg', md: 'xl' }}
            color={index < 3 ? 'yellow.400' : textColor}
          >
            {index + 1}
          </Box>
        </Td>
        <Td>
          <Flex alignItems="center">
            <Image src={user.pic} boxSize="40px" borderRadius="full" mr={3} />
            <VStack align="start" spacing={0}>
              <Flex
                w={'fit-content'}
                position="relative"
                paddingX={'5px'}
                paddingY={'2px'}
              >
                <Text
                  fontWeight="bold"
                  color={
                    user.rankedInCurrentSeason
                      ? findSocietyAndCircle(user.IQ_score)?.textColor
                      : 'gray.400'
                  }
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {user.name}
                  {user.rankedInCurrentSeason && (
                    <Suspense fallback={<div>Loading...</div>}>
                      <NameLightning
                        boxShadow={
                          findSocietyAndCircle(user.maxIQScore)?.boxShadow
                        }
                        MAX_IQ={user.maxIQScore}
                      />
                    </Suspense>
                  )}
                </Text>
              </Flex>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color="gray.400"
                paddingLeft={'5px'}
              >
                @{user.inGameName}
              </Text>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                color={accentColor}
                fontWeight="bold"
                paddingLeft={'5px'}
              >
                Experience Level: {user.level}
              </Text>
            </VStack>
          </Flex>
        </Td>
        {isTablet && (
          <Td textAlign="center" color={accentColor}>
            {user.level}
          </Td>
        )}
        <Td
          textAlign="center"
          fontWeight="bold"
          color="cyan.300"
          fontSize={{ base: 'sm', md: 'md' }}
          paddingX={{ base: '0', md: '24px' }}
        >
          {user.IQ_score}
        </Td>
        {isDesktop && (
          <>
            <Td textAlign="center">{user.quizSubmissions}</Td>
            <Td textAlign="center">{user.RQM_avg}</Td>
          </>
        )}
      </Tr>
    )
  },
)

export default LeaderBoardRow
