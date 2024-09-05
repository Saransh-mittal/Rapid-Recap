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
import useSound from '../../../customHooks/useSound'
import { useTranslation } from 'react-i18next'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  const { t } = useTranslation('ConfirmationModal')
  const { playClick } = useSound()
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="#BBE2EC">
        <ModalHeader fontWeight="bold" fontSize="30px">
          {t('confirmationTitle')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody fontSize="17px">{message}</ModalBody>
        <ModalFooter>
          <Button
            bg="#50727B"
            color="#000000"
            mr={5}
            onClick={() => {
              playClick()
              onConfirm()
            }}
          >
            {t('confirmButton')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              playClick()
              onClose()
            }}
          >
            {t('cancelButton')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConfirmationModal
