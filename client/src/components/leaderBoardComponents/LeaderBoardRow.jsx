import React, { lazy, Suspense, useRef, useEffect, useState } from 'react'
import { Td, Tr, Flex, Image, Text, Box } from '@chakra-ui/react'
import { findSocietyAndCircle } from '../../utils/helper.utils'
import { useTranslation } from 'react-i18next'

const NameLightning = lazy(() => import('../miscellaneous/NameLightning'))
const TournamentBadge = lazy(() =>
  import('../tournamentComponents/TournamentBadges'),
)

const LeaderBoardRow = React.memo(
  ({
    user,
    index,
    isMobile,
    isDesktop,
    isTablet,
    navigate,
    textColor,
    accentColor,
  }) => {
    const { t } = useTranslation('LeaderBoardRow')
    const urlInGameName = user?.inGameName?.replace(/\./g, '%2E')
    const nameRef = useRef(null)
    const [nameWidth, setNameWidth] = useState(0)

    useEffect(() => {
      if (nameRef.current) {
        setNameWidth(nameRef.current.offsetWidth)
      }
    }, [user.name])

    const handleNavigate = e => {
      navigate(`/profile/${urlInGameName}`)
    }

    const renderTournamentBadge = () => {
      if (user?.displayedBadge?.rank) {
        return (
          <Suspense
            fallback={
              <Box
                width={isMobile ? '40px' : '60px'}
                height={isMobile ? '40px' : '60px'}
              />
            }
          >
            <Box
              className="tournament-badge"
              left={`calc(${nameWidth}px + ${isMobile ? '10px' : `80px`})`}
              top="50%"
            >
              <TournamentBadge
                tournamentNumber={user?.displayedBadge?.tournamentNumber}
                rank={user?.displayedBadge?.rank}
                name={user?.name}
                inGameName={user?.inGameName}
                participantCnt={user?.displayedBadge?.participantCnt}
                size={isMobile ? 'sm' : 'md'}
              />
            </Box>
          </Suspense>
        )
      }
      return null
    }

    return (
      <Tr
        onClick={handleNavigate}
        cursor="pointer"
        _hover={{ bg: 'whiteAlpha.100' }}
        transition="background 0.2s"
        w={'100%'}
      >
        {isMobile ? (
          <>
            <Td
              textAlign="center"
              flexDirection={'row'}
              width={'70%'}
              gap={3}
              px={0}
            >
              <Flex
                alignItems="center"
                justifyContent="center"
                gap={2}
                position={'relative'}
              >
                <Box
                  as="span"
                  fontWeight="bold"
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={index < 3 ? 'yellow.400' : textColor}
                >
                  {index + 1}
                </Box>

                <Flex alignItems="center" w={'fit-content'}>
                  <Image
                    src={user.pic}
                    boxSize="40px"
                    borderRadius="full"
                    mr={3}
                  />
                  <Flex>
                    <Flex direction="column" position="relative">
                      <Flex
                        ref={nameRef}
                        fontWeight="bold"
                        color={
                          user.rankedInCurrentSeason
                            ? findSocietyAndCircle(user.IQ_score)?.textColor
                            : 'gray.400'
                        }
                        w={'fit-content'}
                        paddingX={'0.25rem'}
                        paddingY={'0.1rem'}
                        position={'relative'}
                        fontSize={{ base: 'xs', md: 'sm' }}
                        justifyContent={'flex-start'}
                        alignItems={'flex-start'}
                      >
                        <Text w={'100%'}>{user.name}</Text>
                        {user.rankedInCurrentSeason && (
                          <Suspense fallback={<span>⚡</span>}>
                            <NameLightning
                              boxShadow={
                                findSocietyAndCircle(user.maxIQScore)?.boxShadow
                              }
                              MAX_IQ={user.maxIQScore}
                            />
                          </Suspense>
                        )}
                      </Flex>
                      <Text
                        mt={1}
                        fontSize={{ base: 'xs', md: 'sm' }}
                        color="gray.400"
                        minW={'100px'}
                        paddingX={'0.25rem'}
                        paddingY={'0.1rem'}
                        textAlign={'left'}
                      >
                        @{user.inGameName}
                      </Text>

                      <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        color={accentColor}
                        minW={'110px'}
                        paddingX={'0.25rem'}
                        textAlign={'left'}
                      >
                        {t('xpLevel')} {user.level}
                      </Text>
                    </Flex>
                    <Flex position={'absolute'} right={-9}>
                      {renderTournamentBadge()}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Td>
            <Td
              width={'30%'}
              textAlign="right"
              fontWeight="bold"
              color="cyan.300"
              fontSize={{ base: 'sm', md: 'md' }}
              px={4}
            >
              {user.IQ_score}
            </Td>
          </>
        ) : (
          <>
            <Td width="10%" textAlign="center">
              <Box
                as="span"
                fontWeight="bold"
                fontSize={{ base: 'sm', md: 'md' }}
                color={index < 3 ? 'yellow.400' : textColor}
              >
                {index + 1}
              </Box>
            </Td>
            <Td width={isTablet ? '50%' : '25%'}>
              <Flex gap={2} position={'relative'}>
                <Flex alignItems="center">
                  <Image
                    src={user.pic}
                    boxSize="40px"
                    borderRadius="full"
                    mr={3}
                  />
                  <Flex>
                    <Flex direction="column" position="relative">
                      <Flex
                        ref={nameRef}
                        fontWeight="bold"
                        color={
                          user.rankedInCurrentSeason
                            ? findSocietyAndCircle(user.IQ_score)?.textColor
                            : 'gray.400'
                        }
                        w={'fit-content'}
                        paddingX={'0.5rem'}
                        paddingY={'0.1rem'}
                        position={'relative'}
                        fontSize={{ base: 'xs', md: 'sm' }}
                      >
                        {user.name}
                        {user.rankedInCurrentSeason && (
                          <Suspense fallback={<span>⚡</span>}>
                            <NameLightning
                              boxShadow={
                                findSocietyAndCircle(user.maxIQScore)?.boxShadow
                              }
                              MAX_IQ={user.maxIQScore}
                            />
                          </Suspense>
                        )}
                      </Flex>
                      <Text
                        mt={1}
                        fontSize={{ base: 'xs', md: 'sm' }}
                        color="gray.400"
                        paddingX={'0.5rem'}
                        paddingY={'0.1rem'}
                      >
                        @{user.inGameName}
                      </Text>
                      <Text
                        fontSize={{ base: 'xs', md: 'sm' }}
                        color={accentColor}
                        minW={'110px'}
                        paddingX={'0.25rem'}
                        textAlign={'left'}
                      >
                        {t('xpLevel')} {user.level}
                      </Text>
                    </Flex>
                    <Flex position={'absolute'} right={0}>
                      {renderTournamentBadge()}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Td>
            <Td
              width={'15%'}
              textAlign="center"
              fontWeight="bold"
              color="cyan.300"
              fontSize={{ base: 'sm', md: 'md' }}
            >
              {user.IQ_score}
            </Td>
          </>
        )}

        {isDesktop && (
          <>
            <Td width="20%" textAlign="center">
              {user.quizSubmissions}
            </Td>
            <Td width="15%" textAlign="center">
              {user.RQM_avg}
            </Td>
          </>
        )}
      </Tr>
    )
  },
)

export default LeaderBoardRow
