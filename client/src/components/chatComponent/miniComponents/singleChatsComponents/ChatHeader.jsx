import React, { useMemo, useCallback, lazy, Suspense } from 'react'
import { Flex, IconButton, Image, Text } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { getSenderFull } from '../../config/ChatLogics'

// SSR image imports
const greaterThan = '/images/greaterThan.webp'

// Lazy load components
const UpdateGroupChatModal = lazy(() => import('../UpdateGroupChatModal'))

const ChatHeader = ({
  messages,
  selectedChat,
  user,
  navigate,
  istyping,
  handleClose,
  setFetchAgain,
}) => {
  const { t } = useTranslation('ChatHeader')

  const senderDetails = useMemo(
    () => getSenderFull(user, selectedChat.users),
    [user, selectedChat.users],
  )

  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${senderDetails.inGameName}`)
  }, [navigate, senderDetails.inGameName])

  const handleNavigateChat = useCallback(() => {
    navigate(`/chats/${selectedChat._id}`)
  }, [navigate, selectedChat._id])

  return (
    <Flex
      fontSize={{ base: '28px', md: '30px' }}
      pb={3}
      px={2}
      w="100%"
      display="flex"
      justifyContent={{ base: 'center' }}
      alignItems="center"
      position={'relative'}
    >
      <IconButton
        position="absolute"
        left={0}
        icon={<ArrowBackIcon />}
        onClick={handleClose}
        bg="rgba(255, 255, 255, 0.7)"
        _hover={{ bg: 'rgba(255, 255, 255, 0.9)' }}
        aria-label={t('backButton')}
      />

      {messages &&
        (!selectedChat.isGroupChat ? (
          <>
            <Flex
              gap={4}
              p={1}
              pl={3}
              _hover={{
                cursor: 'pointer',
                borderRadius: 'lg',
                bg: 'linear-gradient(-180deg, rgba(32, 28, 46, 0.8), rgba(19, 16, 29, 0.8) 88%, rgba(19, 16, 29, 0.8) 99%)',
                boxShadow:
                  'inset 0 0 15px rgba(255, 255, 255, 0.1), 0 6px 15px rgba(0, 0, 0, 0.4), 0 12px 30px rgba(0, 0, 0, 0.3)',
              }}
              onClick={handleProfileClick}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Flex>
                <Image
                  borderRadius="full"
                  boxSize={{ base: '35px', md: '45px' }}
                  src={senderDetails.pic}
                  alt={senderDetails.name}
                />
              </Flex>
              <Flex flexDirection={'column'}>
                <Flex>
                  <Text
                    fontSize={{ base: '1.2rem', md: '1.5rem' }}
                    mb={{ base: 0, md: '5px' }}
                    textColor={'white'}
                  >
                    {senderDetails.name}
                  </Text>
                </Flex>
                <Text
                  fontSize={{ base: '0.75rem', md: '0.85rem' }}
                  m={0}
                  mt={{ base: '0', md: -2 }}
                  textColor={'#9CAFAA'}
                >
                  {senderDetails.inGameName}
                </Text>
              </Flex>
              <Flex ml={-3} alignItems={'center'} mb={5}>
                <Image
                  borderRadius="full"
                  boxSize={{ base: '15px', md: '20px' }}
                  src={greaterThan}
                  alt={'greaterThan'}
                  onClick={handleNavigateChat}
                />
              </Flex>
            </Flex>
          </>
        ) : (
          <>
            {selectedChat.chatName.toUpperCase()}
            <Suspense fallback={<div>{t('loading')}</div>}>
              <UpdateGroupChatModal
                fetchMessages={fetchMessages}
                fetchAgain={fetchAgain}
                setFetchAgain={setFetchAgain}
              />
            </Suspense>
          </>
        ))}
      {istyping && (
        <Text
          fontSize="xs"
          color="#05f03c"
          position={'absolute'}
          bottom={'-1rem'}
          left={'47%'}
        >
          {t('typing')}
        </Text>
      )}
    </Flex>
  )
}

export default ChatHeader
