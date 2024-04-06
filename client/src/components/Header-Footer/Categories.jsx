import React, { useEffect } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

const Categories = ({ setShowCategory }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    onOpen();
  }, []);
  const listItems = [
    "General",
    "Business",
    "Health",
    "Science",
    "Sports",
    "Technology",
    "Entertainment",
  ];
  return (
    <Drawer
      onClose={() => {
        onClose();
        setShowCategory(false);
      }}
      isOpen={isOpen}
      size={"xs"}
      backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
      boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
    >
      <DrawerOverlay />
      <DrawerContent
        backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
        color="white"
      >
        <DrawerCloseButton />
        <DrawerHeader marginTop={"20px"}>Categories</DrawerHeader>
        <DrawerBody
          overflow={"hidden"}
          marginTop={"50px"}
        >
          <UnorderedList
            height={"40%"}
            justifyContent={"space-between"}
            display={"flex"}
            flexDirection={"column"}
          >
            {listItems.map((item) => (
              <ListItem
                key={item}
                _hover={{
                  backgroundImage:
                    "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                  boxShadow:
                    "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
                  fontSize: "1.2rem",
                }}
                cursor={"pointer"}
              >
                {item}
              </ListItem>
            ))}
          </UnorderedList>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Categories;
