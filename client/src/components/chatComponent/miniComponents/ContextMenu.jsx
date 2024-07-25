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
import EmojiPicker, { Emoji } from "emoji-picker-react";
import { AddIcon } from "@chakra-ui/icons";

const emojis = [
  "1f44d", // 👍
  "2764-fe0f", // ❤️
  "1f602", // 😂
  "1f62e", // 😮
  "1f622", // 😢
  "1f621", // 😡
];

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
  messageId,
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
    onReact({ emoji, messageId });
    setShowReactions(false);
    onClose();
  };
  const handleEmojiSelect = (emojiObject) => {
    handleReact(emojiObject.unified);
    onEmojiModalClose();
  };

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
                onClick={() => onDelete("everyone")}
                _hover={{ bg: "red.50" }}
                color="red.500"
                fontWeight="bold"
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
              color="red.500"
              fontWeight="bold"
            >
              Delete for Me
            </MenuItem>
          )}
          {isMessageDeleted && (
            <MenuItem
              onClick={() => onDelete("permanent")}
              _hover={{ bg: "gray.100" }}
              color={"red.500"}
              fontWeight="bold"
            >
              Delete
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem
            onClick={onCopy}
            _hover={{ bg: "gray.100" }}
            color={"black"}
            fontWeight="bold"
          >
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
                    <Emoji unified={emoji} size="28" />
                  </Box>
                ))}
                <Box
                  as="button"
                  fontSize="xl"
                  onClick={onEmojiModalOpen}
                  _hover={{ bg: "gray.100" }}
                  p={2}
                  borderRadius="full"
                  color={"black"}
                >
                  <AddIcon fontSize={"1rem"} />
                </Box>
              </Flex>
            </>
          )}
        </MenuList>
      </Menu>
      <Modal isOpen={isEmojiModalOpen} onClose={onEmojiModalClose}>
        <ModalOverlay />
        <ModalContent bg={"transparent"} position={"relative"}>
          <ModalBody>
            <Box ref={emojiPickerRef}>
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                emojiStyle={"facebook"}
                theme={"dark"}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContextMenu;
