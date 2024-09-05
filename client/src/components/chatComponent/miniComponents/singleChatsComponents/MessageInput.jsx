import React, { useCallback, lazy, Suspense } from 'react'
import { Flex, FormControl, IconButton, Input, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import FilledBookmarkSVG from '../../../../assets/svg/FilledBookmarkSVG'
import EmojiSmileSVG from '../../../../assets/svg/EmojiSmileSVG'

// Lazy load EmojiPicker
const EmojiPicker = lazy(() => import('emoji-picker-react'))

const MessageInput = ({
  sendMessage,
  newMessage,
  typingHandler,
  showEmojiPicker,
  setShowEmojiPicker,
  setShowStickerPicker,
  emojiPickerRef,
  stickerPickerRef,
  onEmojiClick,
  setShowBookmarksModal,
  fetchBookmarks,
}) => {
  const { t } = useTranslation('MessageInput') // Adjust the namespace as needed

  // Memoized event handlers
  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev)
    setShowStickerPicker(false)
  }, [setShowEmojiPicker, setShowStickerPicker])

  const openBookmarksModal = useCallback(() => {
    setShowBookmarksModal(true)
    fetchBookmarks()
  }, [setShowBookmarksModal, fetchBookmarks])

  return (
    <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={3}>
      <Flex position="relative" alignItems="center">
        <IconButton
          icon={<EmojiSmileSVG width={'20px'} height={'20px'} fill={'#fff'} />}
          onClick={toggleEmojiPicker}
          border={'1px solid white'}
          background={'transparent'}
          color={'white'}
          _hover={{ background: '#38B2AC', color: 'white' }}
          borderRadius={'50%'}
        />
        <IconButton
          icon={
            <FilledBookmarkSVG fill={'#fff'} width={'20px'} height={'20px'} />
          }
          onClick={openBookmarksModal}
          bg="transparent"
          border="1px solid white"
          color="white"
          _hover={{ bg: '#38B2AC', color: 'white' }}
          ml={2}
          borderRadius={'50%'}
        />
        {showEmojiPicker && (
          <Suspense fallback={<Box>Loading...</Box>}>
            <Box
              position="absolute"
              bottom="60px"
              left="0"
              zIndex={1}
              ref={emojiPickerRef}
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                emojiStyle={'facebook'}
                theme={'dark'}
              />
            </Box>
          </Suspense>
        )}
        <Input
          placeholder={t('EnterMessage')}
          value={newMessage}
          onChange={typingHandler}
          ml={2}
          color={'white'}
          borderRadius={'20px'}
        />
      </Flex>
    </FormControl>
  )
}

export default React.memo(MessageInput)
