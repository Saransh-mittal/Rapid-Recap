import React, { useContext, useEffect } from "react";
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
import { AppContext } from "../../contextAPI/appContext";
import { useNavigate } from "react-router-dom";

const Categories = ({ setShowCategory }) => {
  const { state, dispatch } = useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
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
                  transition: "box-shadow 0.3s ease-in-out",
                }}
                cursor={"pointer"}
                onClick={() => {
                  // dispatch({
                  //   type: "category",
                  //   payloadCategory: item.toLocaleLowerCase(),
                  // });

                  navigate(`/${item.toLowerCase()}`);
                  onClose();
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.90)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = "scale(0.90)";
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
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
