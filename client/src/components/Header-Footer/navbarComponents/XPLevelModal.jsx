import React, { useContext, useEffect, useState } from 'react'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  Box,
} from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import ProfileExperienceLevel from '../../profileComponents/ProfileExperienceLevel'
import { AppContext } from '../../../contextAPI/appContext'
import Heading from '../../miscellaneous/HeadingComponent'

const XPLevelModal = ({ setShowXPLevelModal, level, requiredXP, xp }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { state } = useContext(AppContext)
  const [profile, setProfile] = useState(state.userProfile)
  console.log('profile', profile)
  console.log('state', state)

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
          // size="full"
        >
          <ModalOverlay bg="rgba(15, 13, 21, 0.8)" />
          <ModalContent
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            maxW={{ base: '100vw', md: '35vw' }}
            // w="auto"
            p={8}
            borderRadius="lg"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
            color="white"
            fontFamily="'Roboto', sans-serif"
          >
            <ModalCloseButton color={'white'} />
            <Heading title="Experience Level" />
            <ProfileExperienceLevel
              xp={state.user.xp}
              level={state.user.level}
              // requiredXP={requiredXP}
            />
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default XPLevelModal
