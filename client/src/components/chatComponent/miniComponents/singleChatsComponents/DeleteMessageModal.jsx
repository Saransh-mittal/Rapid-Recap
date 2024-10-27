import React from 'react'
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

import { useTranslation } from 'react-i18next'
import { useFeatureDetection } from '../../../../utils/featureDetection'
import useSafeSound from '../../../../customHooks/useSafeSound'

const DeleteMessageModal = ({ isOpen, onClose, confirmDelete }) => {
  const { t } = useTranslation('DeleteMessageModal')
  const features = useFeatureDetection()
  const { playClick } = useSafeSound({
    enabled: features.hasAudioSupport,
    volume: 0.5,
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('deleteMessage')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{t('confirmDeleteMessage')}</ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            mr={3}
            onClick={() => {
              playClick()
              confirmDelete()
            }}
          >
            {t('deleteForEveryone')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              playClick()
              onClose()
            }}
          >
            {t('cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteMessageModal
