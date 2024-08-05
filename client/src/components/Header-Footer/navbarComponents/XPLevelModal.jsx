import React, { useEffect } from 'react'
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import ProfileExperienceLevel from '../../profileComponents/ProfileExperienceLevel'

import Heading from '../../miscellaneous/HeadingComponent'
import { useSelector } from 'react-redux'

const XPLevelModal = ({ setShowXPLevelModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    onOpen()
  }, [])

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            onClose()
            setShowXPLevelModal(false)
          }}
        >
          <ModalOverlay bg="rgba(15, 13, 21, 0.8)" />
          <ModalContent
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            maxW={{ base: '100vw', md: '35vw' }}
            p={8}
            borderRadius="lg"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
            color="white"
            fontFamily="'Roboto', sans-serif"
          >
            <ModalCloseButton color={'white'} />
            <Heading title="Experience Level" />
            <ProfileExperienceLevel xp={user.xp} level={user.level} />
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default XPLevelModal
