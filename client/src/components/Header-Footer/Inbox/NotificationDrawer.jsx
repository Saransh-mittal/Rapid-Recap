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
import { AppContext } from "../../../contextAPI/appContext";
import Rapid_recap from "/images/rr.png";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import parse from "html-react-parser";

const NotificationDrawer = ({
  setIsDrawerOpen,
  setIsModalOpen,
  setSelectedNotification,
}) => {
  const { state, dispatch } = useContext(AppContext);
  const toast = useToast();

  const [notificationData, setNotificationData] = useState(state.updates); // State for notification data
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation modal
  const [notificationToDelete, setNotificationToDelete] = useState(null); // State to store notification to delete
  const [removeAllModalOpen, setRemoveAllModalOpen] = useState(false); // State for remove all notifications modal

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    setIsDrawerOpen(false);
  };

  const setReadUpdate = async (updateId) => {
    try {
      await axios.put(`/api/user/readUpdates?updateId=${updateId}`);
      const updatedNotifications = notificationData.map((update) =>
        update._id === updateId ? { ...update, read: true } : update
      );
      setNotificationData(updatedNotifications);
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

  const handleRemoveAllClick = () => {
    setRemoveAllModalOpen(true);
  };

  const trashUpdate = async () => {
    try {
      await axios.put(`/api/user/trashUpdates/${notificationToDelete._id}`);
      const updatedNotificationData = notificationData.filter(
        (update) => update._id !== notificationToDelete._id
      );
      setNotificationData(updatedNotificationData);
      dispatch({
        type: "APP_UPDATES",
        payloadAppUpdates: updatedNotificationData,
      });
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
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const removeAllNotifications = async () => {
    try {
      const response = await axios.put("/api/user/trashAllUpdates");

      if (response.status === 200) {
        setNotificationData([]);
        dispatch({
          type: "APP_UPDATES",
          payloadAppUpdates: [],
        });
        toast({
          title: "Success",
          description: "All notifications removed successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove all notifications",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove all notifications",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    } finally {
      setRemoveAllModalOpen(false);
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
        }}
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
          <DrawerHeader size="10px">
            <span>Inbox</span>
          </DrawerHeader>
          <DrawerHeader size="10px">
            {notificationData.length > 0 && (
              <Button
                color="white"
                border={"2px solid white"}
                background={"transparent"}
                _hover={{ color: "red", borderColor: "red" }}
                onClick={handleRemoveAllClick}
              >
                Remove all Notifications
              </Button>
            )}
          </DrawerHeader>
          <DrawerBody
            style={{
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "black transparent",
            }}
          >
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
                        "0px 4px 8px rgba(0, 0, 0, 0.9), 0px 8px 16px rgba(0, 0, 0, 0.9), 0px 12px 24px rgba(0, 0, 0, 0.9)",
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

                    <Text style={{ textAlign: "left" }}>
                      {parse(update.mainText.substring(0, 60))}.....
                    </Text>
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
      <Modal
        isOpen={isDeleteModalOpen || removeAllModalOpen}
        onClose={() =>
          isDeleteModalOpen
            ? setIsDeleteModalOpen(false)
            : setRemoveAllModalOpen(false)
        }
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
          <ModalHeader>
            {isDeleteModalOpen ? (
              <b>Confirm Remove Notification</b>
            ) : (
              <b>Confirm Remove All Notifications</b>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isDeleteModalOpen
              ? "Are you sure you want to delete this notification?"
              : "Are you sure you want to remove all notifications from inbox?"}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={isDeleteModalOpen ? trashUpdate : removeAllNotifications}
            >
              Confirm Delete
            </Button>
            <Button
              onClick={() =>
                isDeleteModalOpen
                  ? setIsDeleteModalOpen(false)
                  : setRemoveAllModalOpen(false)
              }
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NotificationDrawer;
