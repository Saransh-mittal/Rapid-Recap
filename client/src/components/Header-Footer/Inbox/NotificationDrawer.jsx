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
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import NotificationModal from "./NotificationModal";
import { AppContext } from "../../../contextAPI/appContext";
import Rapid_recap from "/images/Rapid Recap.png";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

const NotificationDrawer = ({ setIsDrawerOpen }) => {
  const { state, dispatch } = useContext(AppContext);
  const toast = useToast();

  const [notificationData, setNotificationData] = useState(state.updates); // State for notification data
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedNotification, setSelectedNotification] = useState(null); // State for selected notification
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation modal
  const [notificationToDelete, setNotificationToDelete] = useState(null); // State to store notification to delete

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const setReadUpdate = async (updateId) => {
    try {
      await axios.put(`/api/user/readUpdates?updateId=${updateId}`);
      const updatedNotifications = notificationData.map((update) =>
        update._id === updateId ? { ...update, read: true } : update
      );
      setNotificationData(updatedNotifications);
      // Dispatch action to update state globally (optional, if using context)
      dispatch({
        type: "APP_UPDATES",
        payloadAppUpdates: updatedNotifications,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as read",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    }
  };

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setIsDeleteModalOpen(true);
  };

  const trashUpdate = async()=>{
    try {
      await axios.put(`/api/user/trashUpdates/${notificationToDelete._id}`);
      const updatedNotificationData = notificationData.filter(
        (update) => update._id !== notificationToDelete._id
      );
      setNotificationData(updatedNotificationData);
      
      // Close the delete confirmation modal
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete update",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    }
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
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "black transparent",
            }}
          >
            {/* Render notifications */}
            {notificationData.length > 0 &&
              notificationData.map((update, index) => {
                return (
                  <Box
                    color={update.read ? "#9CAFAA" : null}
                    key={index}
                    style={{
                      marginBottom: "1rem",
                      cursor: "pointer",
                      backgroundColor: "#0f0d15",
                      backgroundImage:
                        "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                      boxShadow:
                        "0px 4px 8px rgba(0, 0, 0, 0.9), 0px 8px 16px rgba(0, 0, 0, 0.9), 0px 12px 24px rgba(0, 0, 0, 0.9)", // Increased intensity of the shadow
                    }}
                    onClick={() => {
                      setReadUpdate(update._id);
                      handleNotificationClick(update);
                    }}
                    paddingBottom={"20px"}
                    padding={"10px"}
                  >
                    <Flex
                      flexDirection={"row"}
                      justifyContent={"space-between"}
                      gap={3}
                    >
                      <Flex
                        w={"30%"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        height="50px"
                        p={0}
                        m={0}
                      >
                        <Image
                          src={Rapid_recap}
                          alt="Notification Image"
                          width="40px "
                          height="40px"
                          borderRadius="50%"
                          objectFit="cover"
                          objectPosition="center center"
                        />
                      </Flex>
                      <Flex justifyContent={"center"} alignItems={"center"}>
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
                    <Flex>
                      <small>{new Date(update.date).toLocaleString()}</small>
                      <small style={{ marginLeft: "auto" }}>
                        {update.read ? "Read" : "Unread"}
                      </small>
                    </Flex>
                    <Flex
                      width={"100%"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      marginTop={"10px"}
                    >
                      <small>
                        <Button
                          p={0}
                          background={"transparent"}
                          color={"white"}
                          _hover={{ background: "transparent", color: "red" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(update);
                          }}
                        >
                          <DeleteIcon />
                        </Button>
                      </small>
                    </Flex>
                  </Box>
                );
              })}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {isModalOpen && (
        <NotificationModal
          selectedNotification={selectedNotification}
          setIsModalOpen={setIsModalOpen}
        />
      )}
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent
          backgroundImage={{
            base: "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
          }}
          backgroundColor={{ base: "#0f0d15", xl: "transparent" }}
          boxShadow={{
            base: "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
          }}
          color={"white"}
          p={"3"}
        >
          <ModalHeader><b>Confirm Delete</b></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this notification?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={trashUpdate}>
              Confirm Delete
            </Button>
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NotificationDrawer;
