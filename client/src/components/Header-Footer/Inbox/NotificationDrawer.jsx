import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Image,
  Heading,
  Text,
  Flex,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { dummyNotificationData as notificationData } from "./dummyNotificationData";
import NotificationModal from "../NotificationModal";

const NotificationDrawer = ({ setIsDrawerOpen }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNotification, setSelectedNotification] = useState(null); // State for selected notification
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };
  useEffect(() => {
    onOpen();
  }, []);
  return (
    <>
      <Drawer
        size={{ base: "full", lg: "xs" }}
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          setIsDrawerOpen(false);
          onClose();
        }} // Close drawer onClose
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
          <DrawerHeader size="10px">Inbox</DrawerHeader>
          <DrawerBody
          style={{
            scrollbarWidth: "thin",
            WebkitScrollbar: "none",
            overflowY: "scroll",
            "&::-webkit-scrollbar": {
              width: "5px",
              backgroundColor:"#0f0d15"
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#0f0d15",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#0f0d15",
              borderRadius: "8px",
            },
          }}
          >
            {/* Render notifications */}
            {notificationData &&
              notificationData.updates.map((update, index) => (
                <Box
                  key={index}
                  style={{ marginBottom: "1rem", cursor: "pointer" }}
                  onClick={() => handleNotificationClick(update)}
                  paddingBottom={"20px"}
                  borderBottom={"2px solid white"}
                >
                  <Flex flexDirection={"row"} justifyContent={"space-between"} gap={3}>
                    <Flex
                      w={"30%"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      height="50px"
                      p={0}
                      m={0}
                     
                    >
                      <Image
                        src={update.img}
                        alt="Notification Image"
                        width="40px "
                        height="40px"
                        borderRadius="50%"
                     
                        objectFit="cover"
                        objectPosition="center center"
                      />
                    </Flex>
                    <Flex
                     
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Heading
                        as={"h5"}
                        size={"sm"}
                        style={{ marginBottom: "0.5rem", textAlign: "left" }}
                      >
                        {update.title}
                      </Heading>
                    </Flex>
                  </Flex>

                  <Text style={{ textAlign: "left" }}>{update.mainText}</Text>

                  <small>{new Date(update.date).toLocaleString()}</small>
                </Box>
              ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {isModalOpen && (
        <NotificationModal
          selectedNotification={selectedNotification}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </>
  );
};

export default NotificationDrawer;
