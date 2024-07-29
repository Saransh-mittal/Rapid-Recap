// StickerPicker.js
import React from "react";
import { Box, Image, SimpleGrid } from "@chakra-ui/react";

const stickers = [
  "/images/arrow.webp",
  "/images/arrow1.webp",
  "/images/circle.webp",

  // Add more sticker paths as needed
];

const StickerPicker = ({ onStickerSelect }) => {
  return (
    <Box bg="white" p={2} borderRadius="md" maxHeight="200px" overflowY="auto">
      <SimpleGrid columns={4} spacing={2}>
        {stickers.map((sticker, index) => (
          <Image
            key={index}
            src={sticker}
            alt={`Sticker ${index + 1}`}
            boxSize="50px"
            objectFit="contain"
            cursor="pointer"
            onClick={() => onStickerSelect(sticker)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default StickerPicker;
