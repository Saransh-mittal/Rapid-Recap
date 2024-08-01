import React, { useContext } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react'
import useSound from '../../../../customHooks/useSound'
import { AppContext } from '../../../../contextAPI/appContext'

const DeleteMessageModal = ({ isOpen, onClose, confirmDelete }) => {
  const { playClick } = useContext(AppContext)
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
          <Button
            colorScheme="red"
            mr={3}
            onClick={() => {
              playClick()
              confirmDelete()
            }}
          >
            Delete for Everyone
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              playClick()
              onClose()
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteMessageModal
