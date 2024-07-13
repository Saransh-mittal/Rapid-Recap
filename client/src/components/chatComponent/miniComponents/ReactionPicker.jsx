import React, { useState } from "react";
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  SimpleGrid,
} from "@chakra-ui/react";
import { BsEmojiSmile } from "react-icons/bs";

const emojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ReactionPicker = ({ messageId, onAddReaction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji) => {
    onAddReaction(messageId, emoji);
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <PopoverTrigger>
        <IconButton
          icon={<BsEmojiSmile />}
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
        />
      </PopoverTrigger>
      <PopoverContent width="auto">
        <PopoverBody>
          <SimpleGrid columns={3} spacing={2}>
            {emojis.map((emoji, index) => (
              <Box
                key={index}
                as="button"
                fontSize="xl"
                onClick={() => handleEmojiClick(emoji)}
                _hover={{ bg: "gray.100" }}
                p={2}
                borderRadius="md"
              >
                {emoji}
              </Box>
            ))}
          </SimpleGrid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ReactionPicker;
