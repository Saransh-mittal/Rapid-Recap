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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="#BBE2EC">
        <ModalHeader fontWeight="bold" fontSize="30px">Confirmation</ModalHeader>
        <ModalCloseButton />
        <ModalBody fontSize="17px">{message}</ModalBody>
        <ModalFooter>
          <Button bg="#50727B" color="#000000" mr={5} onClick={onConfirm}>
            Confirm
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
