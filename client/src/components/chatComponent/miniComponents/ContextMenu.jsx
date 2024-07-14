import React, { useRef, useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  SimpleGrid,
  Box,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalHeader,
} from "@chakra-ui/react";
import EmojiPicker from "emoji-picker-react";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ContextMenu = ({
  isOpen,
  onClose,
  position,
  onDelete,
  onCopy,
  onReact,
  isSender,
  messageTime,
  isMessageDeleted,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const isWithinOneHour = new Date() - new Date(messageTime) <= 60 * 60 * 1000;
  const {
    isOpen: isEmojiModalOpen,
    onOpen: onEmojiModalOpen,
    onClose: onEmojiModalClose,
  } = useDisclosure();
  const emojiPickerRef = useRef(null);

  const handleReact = (emoji) => {
    onReact(emoji);
    setShowReactions(false);
    onClose();
  };
  const handleEmojiSelect = (emojiObject) => {
    handleReact(emojiObject.emoji);
    onEmojiModalClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        onEmojiModalClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onEmojiModalClose]);

  return (
    <Portal>
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
                onClick={() => onDelete("everyone")}
                _hover={{ bg: "red.50" }}
                color="red.500"
                fontWeight="medium"
              >
                Delete for Everyone
              </MenuItem>
              <MenuDivider />
            </>
          )}
          {!isMessageDeleted && (
            <MenuItem
              onClick={() => onDelete("me")}
              _hover={{ bg: "gray.100" }}
            >
              Delete for Me
            </MenuItem>
          )}
          {isMessageDeleted && (
            <MenuItem
              onClick={() => onDelete("permanent")}
              _hover={{ bg: "gray.100" }}
            >
              Delete
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem onClick={onCopy} _hover={{ bg: "gray.100" }}>
            Copy
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
                    _hover={{ bg: "gray.100" }}
                    p={2}
                    borderRadius="full"
                  >
                    {emoji}
                  </Box>
                ))}
                <Box
                  as="button"
                  fontSize="xl"
                  onClick={onEmojiModalOpen}
                  _hover={{ bg: "gray.100" }}
                  p={2}
                  borderRadius="full"
                >
                  +
                </Box>
              </Flex>
            </>
          )}
        </MenuList>
      </Menu>
      <Modal isOpen={isEmojiModalOpen} onClose={onEmojiModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Choose an Emoji</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={handleEmojiSelect} />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Portal>
  );
};

export default ContextMenu;
