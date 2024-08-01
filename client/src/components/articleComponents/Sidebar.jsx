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
} from '@chakra-ui/react'
import { LockIcon, TriangleDownIcon } from '@chakra-ui/icons'
import Alt_img from '/images/rr.webp'
import GivenQuiz from './GivenQuiz'
import QuizExpired from './QuizExpired'
import TakeQuizButton from './TakeQuizButton'
import TotalUserAttempted from './TotalUserAttempted'
import QuinBoost from './quizComponents/QuinBoost'
import starBoost from '/GIFs/starBoost.gif'
import TextBackgound from '/images/textBackground.webp'
import ShareButton from './ShareButton'
import ShareChatModal from '../chatComponent/miniComponents/ShareChatModal'
import useSound from '../../customHooks/useSound'
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
  quizLeftToGetQuizBoost,
  openModal,
  quinTour,
  isQuizGivenLoading,
}) => {
  const notLoggedIn = state.show
  const { isOpen, onOpen: onOpenShareModal, onClose } = useDisclosure()
  const { playClick } = useContext(AppContext)
  const handleShare = () => {
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
    onOpenShareModal()

    // In a real implementation, you might do something like:
    // shareToChat(article);
  }
  return (
    <Box
      boxShadow={'0 100px 200px rgba(1, 1, 1, 1.1)'}
      borderRadius={'15px'}
      p={1.5}
    >
      {givenQuiz ? (
        <GivenQuiz
          articleId={id}
          percentile={percentile}
          RQM_score={RQM_score}
        />
      ) : onGoingQuiz ? (
        <Heading size="md" margin={'5px'} mb={5} height={'100px'} color={'red'}>
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
        />
      </Box>
      <Flex
        w={'100%'}
        marginTop={'2rem'}
        marginBottom={'2'}
        gap={3}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <ShareButton onClick={handleShare} isDisabled={notLoggedIn} />
        <Flex
          flexDirection={'column'}
          position={'relative'}
          className="quin-boost-tag"
        >
          {isQuinBoostAvailable ? (
            <Flex mb={5}>
              <QuinBoost />
            </Flex>
          ) : (
            !state.isBoosted && (
              <>
                <Text
                  m={0}
                  p={0}
                  textAlign={'left'}
                  paddingLeft={'30px'}
                  position={'absolute'}
                  color={'#9CAFAA'}
                  fontWeight={'bold'}
                >
                  Quin Boost
                </Text>
                <Flex
                  marginTop={'5px'}
                  position={'relative'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  onClick={e => {
                    playClick()
                    if (notLoggedIn) {
                      e.preventDefault()
                      return
                    }
                    quinTour.complete()
                    openModal()
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Image
                    src={TextBackgound}
                    background={'none'}
                    height={'100px'}
                    width={'200px'}
                    className="quin-boost-tracker"
                    style={notLoggedIn ? { filter: 'blur(5px)' } : {}}
                  />
                  <Text
                    m={0}
                    p={0}
                    textAlign={'left'}
                    position={'absolute'}
                    color={'black'}
                    fontSize={'20px'}
                    fontWeight={'bold'}
                  >
                    {quizLeftToGetQuizBoost} Quiz Left
                  </Text>
                  {notLoggedIn && (
                    <Tooltip
                      label="Please log in to use the feature"
                      placement="top"
                    >
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
                </Flex>
              </>
            )
          )}
        </Flex>
        {state.isBoosted && (
          <Flex
            justifyContent={'center'}
            alignItems={'center'}
            gap={2}
            marginTop={'10px'}
            onClick={() => {
              playClick()
              openModal()
            }}
            style={{ cursor: 'pointer' }}
          >
            <Image
              src={starBoost}
              background={'none'}
              height={'60px'}
              w={'60px'}
            />
            <Badge fontSize={'1.2rem'} color={'yellow'} background={'none'}>
              Enjoy!! 1.5x multiplier
            </Badge>
          </Flex>
        )}
      </Flex>
      <Heading as="h3" fontSize="25px" color="white" letterSpacing={1}>
        <TriangleDownIcon color="#F2D7D9" /> Related Articles
      </Heading>
      <SimpleGrid
        columns={1}
        marginTop={5}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'justify'}
        position={'relative'}
      >
        {latestNews
          .filter(
            (_, idx) =>
              idx < Math.floor(articleHeight / 100) && _._id !== article._id,
          )
          .map(item => {
            return (
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
                borderTop={'2px solid lightblue'}
                p={2}
                w={'100%'}
                display={'flex'}
              >
                <Image
                  width="100px"
                  mr={3}
                  mt={2}
                  height={'100%'}
                  float="left"
                  src={item.imgURL ? item.imgURL : Alt_img}
                  alt="Article img"
                  onError={e => {
                    e.target.onerror = null
                    e.target.src = Alt_img
                    e.target.style.height = `100%`
                  }}
                />
                <Flex flexDirection={'column'} w={'100%'}>
                  <Flex w={'100%'} justifyContent={'space-between'}>
                    <Text
                      m={0}
                      p={0}
                      textTransform="uppercase"
                      color="#9CAFAA"
                      fontWeight="bold"
                      letterSpacing="1px"
                    >
                      {item.date}
                      {','}
                    </Text>
                    <Text
                      fontSize={'0.8rem'}
                      m={0}
                      p={0}
                      textTransform="uppercase"
                      color="#9CAFAA"
                      letterSpacing="1px"
                    >
                      {item.avgReadTime} MIN READ
                    </Text>
                  </Flex>
                  <Text mt={2}>{item.title}</Text>
                </Flex>
              </Box>
            )
          })}
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
      <ShareChatModal
        isOpen={isOpen}
        onClose={onClose}
        articleToShare={article}
        notLoggedIn={notLoggedIn}
      />
    </Box>
  )
}

export default Sidebar
