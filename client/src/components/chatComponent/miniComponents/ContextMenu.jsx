import React, { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Box,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
} from '@chakra-ui/react'
import EmojiPicker, { Emoji } from 'emoji-picker-react'
import { AddIcon } from '@chakra-ui/icons'

const emojis = [
  '1f44d', // 👍
  '2764-fe0f', // ❤️
  '1f602', // 😂
  '1f62e', // 😮
  '1f622', // 😢
  '1f621', // 😡
]

const ContextMenu = ({
  isOpen,
  onClose,
  messageRect,
  onDelete,
  onCopy,
  onReact,
  isSender,
  messageTime,
  isMessageDeleted,
  messageId,
  position,
}) => {
  const { t } = useTranslation('ContextMenu')
  const [showReactions, setShowReactions] = useState(false)
  const menuRef = useRef(null)
  const [currentMessageId, setCurrentMessageId] = useState(messageId)
  const isWithinOneHour = new Date() - new Date(messageTime) <= 60 * 60 * 1000
  const {
    isOpen: isEmojiModalOpen,
    onOpen: onEmojiModalOpen,
    onClose: onEmojiModalClose,
  } = useDisclosure()
  const emojiPickerRef = useRef(null)

  useEffect(() => {
    if (messageId) setCurrentMessageId(messageId)
  }, [messageId])

  useEffect(() => {
    if (isOpen && messageRect && menuRef.current) {
      const scrollableDiv = document.querySelector('.scrollable-div')
      const scrollTop = scrollableDiv.scrollTop

      menuRef.current.style.position = 'absolute'
      menuRef.current.style.top = `${messageRect.top + scrollTop}px`
      menuRef.current.style.left = `${messageRect.left}px`
    }
  }, [isOpen, messageRect])

  const handleReact = emoji => {
    onReact({ emoji, messageId: currentMessageId })
    setShowReactions(false)
    onClose()
  }

  const handleEmojiSelect = emojiObject => {
    handleReact(emojiObject.unified)
    onEmojiModalClose()
  }

  return (
    <>
      <Menu isOpen={isOpen} onClose={onClose}>
        <MenuButton
          position="absolute"
          top={position.y}
          left={position.x}
          visibility="hidden"
        />
        <MenuList minWidth="200px" boxShadow="md" borderRadius="md" bg="white">
          {isSender && isWithinOneHour && !isMessageDeleted && (
            <>
              <MenuItem
                onClick={() => onDelete('everyone')}
                _hover={{ bg: 'red.50' }}
                color="red.500"
                fontWeight="bold"
              >
                {t('deleteForEveryone')}
              </MenuItem>
              <MenuDivider />
            </>
          )}
          {!isMessageDeleted && (
            <MenuItem
              onClick={() => onDelete('me')}
              _hover={{ bg: 'gray.100' }}
              color="red.500"
              fontWeight="bold"
            >
              {t('deleteForMe')}
            </MenuItem>
          )}
          {isMessageDeleted && (
            <MenuItem
              onClick={() => onDelete('permanent')}
              _hover={{ bg: 'gray.100' }}
              color={'red.500'}
              fontWeight="bold"
            >
              {t('deletePermanent')}
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem
            onClick={onCopy}
            _hover={{ bg: 'gray.100' }}
            color={'black'}
            fontWeight="bold"
          >
            {t('copy')}
          </MenuItem>
          {!isMessageDeleted && (
            <>
              <MenuDivider />
              <Flex justifyContent="space-around" py={2}>
                {emojis.map((emoji, index) => (
                  <Box
                    key={index}
                    as="button"
                    fontSize="xl"
                    onClick={() => handleReact(emoji)}
                    _hover={{ bg: 'gray.100' }}
                    p={2}
                    borderRadius="full"
                  >
                    <Emoji unified={emoji} size="28" />
                  </Box>
                ))}
                <Box
                  as="button"
                  fontSize="xl"
                  onClick={onEmojiModalOpen}
                  _hover={{ bg: 'gray.100' }}
                  p={2}
                  borderRadius="full"
                  color={'black'}
                >
                  <AddIcon fontSize={'1rem'} />
                </Box>
              </Flex>
            </>
          )}
        </MenuList>
      </Menu>
      <Modal isOpen={isEmojiModalOpen} onClose={onEmojiModalClose}>
        <ModalOverlay />
        <ModalContent bg={'transparent'} position={'relative'}>
          <ModalBody>
            <Box ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={emojiObject => handleEmojiSelect(emojiObject)}
                emojiStyle={'facebook'}
                theme={'dark'}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ContextMenu
