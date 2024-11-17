import React, { useEffect, lazy, Suspense, useCallback, useMemo } from 'react'
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { setShowXpLevelModal } from '../../../../redux/appSlice'

// Lazy loading the components
const ProfileExperienceLevel = lazy(() =>
  import(
    '../../../profileComponents/LeftProfileSectionComponents/ProfileExperienceLevel'
  ),
)
const Heading = lazy(() => import('../../../miscellaneous/HeadingComponent'))

const XPLevelModal = ({ setShowXPLevelModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user } = useSelector(state => state.auth)
  const { t } = useTranslation('XPLevelModal')

  useEffect(() => {
    onOpen()
  }, [])

  const handleClose = useCallback(() => {
    onClose()
    setShowXpLevelModal(false)
  }, [onClose, setShowXPLevelModal])

  const userXP = useMemo(() => user.xp, [user])
  const userLevel = useMemo(() => user.level, [user])

  return (
    <>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={handleClose}>
          {/* <ModalOverlay bg="rgba(15, 13, 21, 0.8)" /> */}
          <ModalContent
            bg="#1a1527"
            backgroundImage="linear-gradient(135deg, #2d2a47 0%, #0e0c16 100%)"
            p={8}
            borderRadius="lg"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.3)"
            color="white"
            fontFamily="'Roboto', sans-serif"
          >
            <ModalCloseButton color={'white'} onClick={handleClose} />
            <Suspense fallback={<div>Loading...</div>}>
              <Heading title={t('Experience')} />
              <ProfileExperienceLevel xp={userXP} level={userLevel} />
            </Suspense>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default XPLevelModal
