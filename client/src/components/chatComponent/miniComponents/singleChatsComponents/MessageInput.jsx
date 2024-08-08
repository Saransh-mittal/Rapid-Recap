import React from 'react'
import { Flex, FormControl, IconButton, Input, Box } from '@chakra-ui/react'
import EmojiPicker from 'emoji-picker-react'
import FilledBookmarkSVG from '../../../../assets/svg/FilledBookmarkSVG'
import EmojiSmileSVG from '../../../../assets/svg/EmojiSmileSVG'

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
  return (
    <FormControl onKeyDown={sendMessage} id="first-name" isRequired mt={3}>
      <Flex position="relative" alignItems="center">
        <IconButton
          icon={<EmojiSmileSVG width={'20px'} fill={'#fff'} />}
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker)
            setShowStickerPicker(false)
          }}
          border={'1px solid white'}
          background={'transparent'}
          color={'white'}
          _hover={{ background: '#38B2AC', color: 'white' }}
          borderRadius={'50%'}
        />
        <IconButton
          icon={<FilledBookmarkSVG fill={'#fff'} width={'20px'} />}
          onClick={() => {
            setShowBookmarksModal(true)
            fetchBookmarks()
          }}
          bg="transparent"
          border="1px solid white"
          color="white"
          _hover={{ bg: '#38B2AC', color: 'white' }}
          ml={2}
          borderRadius={'50%'}
        />
        {showEmojiPicker && (
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
        )}
        <Input
          placeholder="Enter a message.."
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

export default MessageInput
