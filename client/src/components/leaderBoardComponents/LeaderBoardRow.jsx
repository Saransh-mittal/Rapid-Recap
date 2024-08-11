import React, { lazy, Suspense, useCallback } from 'react'
import { Box, Flex, Heading, Image, Td, Tr } from '@chakra-ui/react'
import { findSocietyAndCircle } from '../../utils/helper.utils'

const NameLightning = lazy(() => import('../miscellaneous/NameLightning'))
const XPLevel = lazy(() => import('../Header-Footer/navbarComponents/XPLevel'))

const LeaderBoardRow = React.memo(
  ({
    user,
    index,
    currUserChar,
    isBaseScreen,
    isLgScreen,
    isMdScreen,
    navigate,
  }) => {
    const urlInGameName = user?.inGameName?.replace(/\./g, '%2E')

    const handleNavigate = useCallback(() => {
      navigate(`/profile/${urlInGameName}`)
    }, [navigate, urlInGameName])

    return (
      <Tr
        height={'80px'}
        key={user._id}
        className={
          currUserChar?.inGameName === user.inGameName
            ? 'highlighted-card-2'
            : ''
        }
        onClick={handleNavigate}
        cursor={'pointer'}
      >
        <Td textAlign={'center'}>
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            bgGradient="linear(to-b, rgba(26, 21, 39, 0.7), rgba(14, 12, 22, 0.7) 88%, rgba(14, 12, 22, 0.7) 99%)"
            border={'1px solid rgba(255, 255, 255, 0.1)'}
            p={2}
            gap={'25px'}
            borderRadius="xl"
          >
            {user.rank ? user.rank : index + 1}
            {!isBaseScreen && (
              <Flex
                border={'5px solid gold'}
                style={{ transform: 'rotate(45deg)' }}
                w="45px"
                h="45px"
                justifyContent={'center'}
                alignItems={'center'}
                bg={'blue.200'}
                position={'relative'}
                overflow={'hidden'}
              >
                <Box
                  position={'absolute'}
                  h="50px"
                  w="50px"
                  style={{ transform: 'rotate(-45deg)' }}
                >
                  <Image
                    h={'100%'}
                    w={'100%'}
                    src={user.pic}
                    alt="User profile picture"
                    objectFit={'cover'}
                  />
                </Box>
              </Flex>
            )}
            <Flex marginLeft={'-0.5rem'}>
              <Suspense fallback={<div>Loading...</div>}>
                <XPLevel level={user.level} className={'xp-level'} />
              </Suspense>
            </Flex>
          </Flex>
        </Td>
        {!isBaseScreen && (
          <Td>
            <Flex
              justifyContent={'center'}
              alignItems={'center'}
              w={'100%'}
              position="relative"
            >
              <Heading
                as="h6"
                size={'xs'}
                color={
                  user.rankedInCurrentSeason
                    ? findSocietyAndCircle(user.IQ_score)?.textColor
                    : 'gray.400'
                }
                marginTop={'5px'}
              >
                {user.name}
              </Heading>
              {user.rankedInCurrentSeason && (
                <Suspense fallback={<div>Loading...</div>}>
                  <NameLightning
                    boxShadow={findSocietyAndCircle(user.maxIQScore)?.boxShadow}
                    MAX_IQ={user.maxIQScore}
                  />
                </Suspense>
              )}
            </Flex>
          </Td>
        )}
        <Td
          textAlign="center"
          color={user.rankedInCurrentSeason ? 'white' : 'gray.400'}
        >
          {user.inGameName}
        </Td>
        <Td
          textAlign="center"
          color={user.rankedInCurrentSeason ? 'white' : 'gray.400'}
        >
          {user.IQ_score}
        </Td>
        {!isLgScreen && (
          <Td
            textAlign="center"
            color={user.rankedInCurrentSeason ? 'white' : 'gray.400'}
          >
            {user.quizSubmissions}
          </Td>
        )}
        {!isMdScreen && (
          <Td
            textAlign="center"
            color={user.rankedInCurrentSeason ? 'white' : 'gray.400'}
          >
            {user.RQM_avg}
          </Td>
        )}
      </Tr>
    )
  },
)

export default LeaderBoardRow
