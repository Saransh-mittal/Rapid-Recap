import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Portal,
} from "@chakra-ui/react";

const ContextMenu = ({
  isOpen,
  onClose,
  position,
  onDelete,
  onCopy,
  isSender,
  messageTime,
  isMessageDeleted,
}) => {
  const isWithinOneHour = new Date() - new Date(messageTime) <= 60 * 60 * 1000;

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
        </MenuList>
      </Menu>
    </Portal>
  );
};

export default ContextMenu;
