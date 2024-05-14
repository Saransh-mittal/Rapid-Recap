import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";

const QuinBoostModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quin Boost Information</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Information about Quin Boost goes here</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuinBoostModal;
