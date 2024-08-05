// components/articleComponents/Sidebar.js

import React, { useContext } from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Flex,
  Tooltip,
  Badge,
  useDisclosure,
  Spinner,
  Skeleton,
} from '@chakra-ui/react'
import { LockIcon, TriangleDownIcon } from '@chakra-ui/icons'
import Alt_img from '/images/rr.webp'
import GivenQuiz from './GivenQuiz'
import QuizExpired from './QuizExpired'
import TakeQuizButton from './TakeQuizButton'
import TotalUserAttempted from './TotalUserAttempted'
import { AppContext } from '../../contextAPI/appContext'

const Sidebar = ({
  givenQuiz,
  percentile,
  RQM_score,
  onGoingQuiz,
  quizExpired,
  isQuinBoostAvailable,
  tour,
  trackGenerateQuizClick,
  setShowQuizLangModal,
  setShowQuiz,
  showQuiz,
  onOpen,
  totalUsersGivenQuiz,
  latestNews,
  articleHeight,
  article,
  id,
  state,
  isQuizGivenLoading,
}) => {
  const notLoggedIn = state.show
  const { playClick } = useContext(AppContext)

  const isLoading =
    !givenQuiz && !onGoingQuiz && !quizExpired && isQuizGivenLoading

  return (
    <Skeleton isLoaded={!isLoading}>
      <Box
        boxShadow={'0 100px 200px rgba(1, 1, 1, 1.1)'}
        borderRadius={'15px'}
        p={1.5}
        w={{ base: '90vw', md: '100%' }}
      >
        {givenQuiz ? (
          <GivenQuiz
            articleId={id}
            percentile={percentile}
            RQM_score={RQM_score}
          />
        ) : onGoingQuiz ? (
          <Heading
            size="md"
            margin={'5px'}
            mb={5}
            height={'100px'}
            color={'red'}
          >
            Quiz is Already going on in some other tab or device
          </Heading>
        ) : quizExpired ? (
          <QuizExpired />
        ) : (
          <Box position={'relative'}>
            <Box
              style={
                notLoggedIn
                  ? { filter: 'blur(5px)', userSelect: 'none' }
                  : { userSelect: 'text' }
              }
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              {isQuizGivenLoading ? (
                <Spinner />
              ) : (
                <TakeQuizButton
                  isQuinBoostAvailable={isQuinBoostAvailable}
                  onClick={() => {
                    playClick()
                    if (notLoggedIn) {
                      return
                    }
                    tour.complete()
                    trackGenerateQuizClick()
                    setShowQuizLangModal(true)
                    setShowQuiz(!showQuiz)
                    onOpen()
                  }}
                />
              )}
            </Box>
            {notLoggedIn && (
              <Tooltip label="Please log in to give quiz" placement="top">
                <LockIcon
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  color="white"
                  boxSize={8}
                  zIndex={2}
                />
              </Tooltip>
            )}
          </Box>
        )}
        <Box>
          <TotalUserAttempted
            totalUsersGivenQuiz={totalUsersGivenQuiz}
            notLoggedIn={notLoggedIn}
            RQM_score={RQM_score}
          />
        </Box>
        <Text as="h3" color="white" letterSpacing={1} ml={4}>
          Related Articles:
        </Text>
        <SimpleGrid
          columns={1}
          marginTop={5}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          position="relative"
        >
          {latestNews
            .filter(
              (_, idx) =>
                idx < Math.floor(articleHeight / 100) && _._id !== article._id,
            )
            .map(item => (
              <Box
                minHeight="100px"
                key={item._id}
                onClick={e => {
                  if (notLoggedIn) {
                    e.preventDefault()
                    return
                  }
                  playClick()
                  window.location.href = `/article/${item._id}`
                }}
                style={
                  notLoggedIn
                    ? { filter: 'blur(5px)', userSelect: 'none' }
                    : { userSelect: 'text', cursor: 'pointer' }
                }
                borderTop="2px solid lightblue"
                p={2}
                w="100%"
                h={'auto'}
                display="flex"
                className="related-article"
                backgroundColor="#2A2F4F"
                borderRadius="xl"
                transition="all 0.3s ease"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                mb={3}
                flexDirection={'column'}
              >
                <Flex w="100%" justifyContent="space-between">
                  <Text
                    m={0}
                    p={0}
                    textTransform="uppercase"
                    color="#9CAFAA"
                    fontWeight="bold"
                    letterSpacing="1px"
                  >
                    {item.date},
                  </Text>
                  <Text
                    fontSize="0.8rem"
                    m={0}
                    p={0}
                    textTransform="uppercase"
                    color="#9CAFAA"
                    letterSpacing="1px"
                  >
                    {item.avgReadTime} MIN READ
                  </Text>
                </Flex>
                <Flex mr={3} mb={2} alignItems={'center'}>
                  <Image
                    w={{ base: '130px', md: '160px' }}
                    h="auto"
                    mr={3}
                    mt={2}
                    float="left"
                    src={item.imgURL ? item.imgURL : Alt_img}
                    alt="Article img"
                    onError={e => {
                      e.target.onerror = null
                      e.target.src = Alt_img
                      e.target.style.height = '100%'
                    }}
                    borderRadius="8px"
                  />
                  <Flex flexDirection="column" w="100%">
                    <Text mt={2} color="#e0e0e0">
                      {item.title}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            ))}
          {notLoggedIn && (
            <Tooltip label="Please log in to navigate" placement="top">
              <LockIcon
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                color="white"
                boxSize={8}
                zIndex={2}
              />
            </Tooltip>
          )}
        </SimpleGrid>
      </Box>
    </Skeleton>
  )
}

export default Sidebar
