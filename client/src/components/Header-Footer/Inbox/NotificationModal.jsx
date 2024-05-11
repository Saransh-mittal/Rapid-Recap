import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Image,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import React, { useContext, useEffect } from "react";
import { AppContext } from "../../../contextAPI/appContext";
import Rapid_recap from "/images/Rapid Recap.png?url";

const NotificationModal = ({
  setIsModalOpen,
  selectedNotification,
  setIsDrawerOpen,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { state } = useContext(AppContext);

  useEffect(() => {
    onOpen();
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsModalOpen(false);
        setIsDrawerOpen(true);
        onClose();
      }}
      size={{ base: "full", md: "xl" }}
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
      >
        <ModalHeader>
          {selectedNotification && selectedNotification.title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedNotification && (
            <>
              {/* Circular image */}
              <Flex justifyContent="center">
                <Image
                  src={Rapid_recap}
                  alt="Notification Image"
                  width="80px"
                  height="80px"
                  borderRadius="50%"
                  objectFit="cover"
                  objectPosition="center center"
                />
              </Flex>
              {/* Greetings section */}
              <Flex justifyContent="center" mt={3} marginTop={"20px"}>
                <Heading as="h3" size="md" color="teal">
                  Hello, {state.user.name || "User"}!
                </Heading>
              </Flex>
              {/* Main content */}
              <Flex
                flexDirection="column"
                alignItems="center"
                marginTop={"30px"}
              >
                <Text
                  fontSize="lg"
                  color="gray.400"
                  fontStyle="italic"
                  textAlign="center"
                  marginBottom="20px"
                >
                  {selectedNotification.mainText}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(selectedNotification.date).toLocaleString()}
                </Text>
              </Flex>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NotificationModal;
