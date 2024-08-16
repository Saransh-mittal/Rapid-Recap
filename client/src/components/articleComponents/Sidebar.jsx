/* eslint-disable react/prop-types */
import React, { useCallback, useMemo, Suspense } from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Flex,
  Tooltip,
  Skeleton,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { LockIcon } from '@chakra-ui/icons'
import Alt_img from '/images/rr.webp'
import { useSelector } from 'react-redux'
import useSound from '../../customHooks/useSound'

const GivenQuiz = React.lazy(() => import('./GivenQuiz'))
const QuizExpired = React.lazy(() => import('./QuizExpired'))
const TakeQuizButton = React.lazy(() => import('./TakeQuizButton'))
const TotalUserAttempted = React.lazy(() => import('./TotalUserAttempted'))

const Sidebar = ({
  givenQuiz,
  percentile,
  RQM_score,
  onGoingQuiz,
  quizExpired,
  isQuinBoostAvailable,
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
  isQuizGivenLoading,
  onSigninOpen,
}) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const notLoggedIn = !isAuthenticated
  const { playClick } = useSound()
  const toast = useToast()

  const isLoaded = useMemo(() => {
    return (
      onGoingQuiz !== null &&
      quizExpired !== null &&
      isQuizGivenLoading !== null
    )
  }, [onGoingQuiz, quizExpired, isQuizGivenLoading])

  const handleQuizButtonClick = useCallback(() => {
    playClick()
    if (notLoggedIn) {
      toast({
        title: 'Login Required',
        description: 'Please log in to share this article.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    trackGenerateQuizClick()
    setShowQuizLangModal(true)
    setShowQuiz(!showQuiz)
    onOpen()
  }, [
    notLoggedIn,
    playClick,
    toast,
    trackGenerateQuizClick,
    setShowQuizLangModal,
    setShowQuiz,
    showQuiz,
    onOpen,
  ])

  const handleRelatedArticleClick = useCallback(
    (e, item) => {
      if (notLoggedIn) {
        e.preventDefault()
        toast({
          title: 'Login Required',
          description: 'Please log in to share this article.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      playClick()
      window.location.href = `/article/${item._id}`
    },
    [notLoggedIn, playClick, toast],
  )

  return (
    <Skeleton isLoaded={isLoaded}>
      <Box
        boxShadow={'0 100px 200px rgba(1, 1, 1, 1.1)'}
        borderRadius={'15px'}
        p={1.5}
        w={{ base: '90vw', md: '100%' }}
      >
        <Suspense fallback={<Spinner />}>
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
                    onClick={handleQuizButtonClick}
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
                    onClick={onSigninOpen}
                    cursor={'pointer'}
                  />
                </Tooltip>
              )}
            </Box>
          )}
        </Suspense>
        <Suspense fallback={<Spinner />}>
          <TotalUserAttempted
            totalUsersGivenQuiz={totalUsersGivenQuiz}
            notLoggedIn={notLoggedIn}
            RQM_score={RQM_score}
            articleId={id}
          />
        </Suspense>
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
                onClick={e => handleRelatedArticleClick(e, item)}
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
                backgroundColor="rgba(42, 47, 79, 0.7)"
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
                onClick={onSigninOpen}
                cursor={'pointer'}
              />
            </Tooltip>
          )}
        </SimpleGrid>
      </Box>
    </Skeleton>
  )
}

export default React.memo(Sidebar)
