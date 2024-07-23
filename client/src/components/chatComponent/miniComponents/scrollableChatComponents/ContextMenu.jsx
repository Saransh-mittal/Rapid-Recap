// src/components/chat/ContextMenu.js
import React from "react";
import {
  Box,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
} from "@chakra-ui/react";

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
  return (
    isOpen && (
      <Box
        position="absolute"
        left={`${position.x}px`}
        top={`${position.y}px`}
        zIndex="popover"
        onMouseLeave={onClose}
      >
        <Menu isOpen={isOpen}>
          <MenuButton as={Button} variant="ghost">
            Options
          </MenuButton>
          <MenuList>
            {!isMessageDeleted && (
              <MenuItem onClick={() => onReact({ emoji: "❤️", messageId })}>
                React with ❤️
              </MenuItem>
            )}
            {isSender && (
              <MenuItem onClick={() => onDelete("everyone")}>
                Delete for Everyone
              </MenuItem>
            )}
            <MenuItem onClick={() => onDelete("me")}>Delete for Me</MenuItem>
            <MenuItem onClick={onCopy}>Copy Message</MenuItem>
          </MenuList>
        </Menu>
      </Box>
    )
  );
};

export default ContextMenu;
