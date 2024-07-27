import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react";

const DeleteMessageModal = ({ isOpen, onClose, confirmDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Message</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Are you sure you want to delete this message for everyone?
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={confirmDelete}>
            Delete for Everyone
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteMessageModal;
