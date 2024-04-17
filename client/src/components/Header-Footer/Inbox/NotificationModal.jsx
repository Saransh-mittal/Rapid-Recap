import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect } from "react";

const NotificationModal = ({ setIsModalOpen, selectedNotification }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, []);
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsModalOpen(false);
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
              <p>{selectedNotification.mainText}</p>
              <small>
                {new Date(selectedNotification.date).toLocaleString()}
              </small>{" "}
              {/* Date */}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NotificationModal;
