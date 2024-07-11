import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Portal } from "@chakra-ui/react";

const ContextMenu = ({
  isOpen,
  onClose,
  position,
  onDelete,
  onCopy,
  isSender,
  messageTime,
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
        <MenuList>
          {isSender && isWithinOneHour && (
            <MenuItem onClick={() => onDelete("everyone")}>
              Delete for Everyone
            </MenuItem>
          )}
          <MenuItem onClick={() => onDelete("me")}>Delete for Me</MenuItem>
          <MenuItem onClick={onCopy}>Copy</MenuItem>
        </MenuList>
      </Menu>
    </Portal>
  );
};

export default ContextMenu;
