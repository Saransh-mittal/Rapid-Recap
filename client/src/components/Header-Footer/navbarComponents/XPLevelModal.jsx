import React, { useEffect, lazy, Suspense, useCallback, useMemo } from 'react'
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'

// Lazy loading the components
const ProfileExperienceLevel = lazy(() =>
  import('../../profileComponents/ProfileExperienceLevel'),
)
const Heading = lazy(() => import('../../miscellaneous/HeadingComponent'))

const XPLevelModal = ({ setShowXPLevelModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useSelector(state => state.auth)

  useEffect(() => {
    onOpen()
  }, [onOpen])

  const handleClose = useCallback(() => {
    onClose()
    setShowXPLevelModal(false)
  }, [onClose, setShowXPLevelModal])

  const userXP = useMemo(() => user.xp, [user.xp])
  const userLevel = useMemo(() => user.level, [user.level])

  return (
    <>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose}>
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
            <Suspense fallback={<div>Loading...</div>}>
              <Heading title="Experience Level" />
              <ProfileExperienceLevel xp={userXP} level={userLevel} />
            </Suspense>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default XPLevelModal
