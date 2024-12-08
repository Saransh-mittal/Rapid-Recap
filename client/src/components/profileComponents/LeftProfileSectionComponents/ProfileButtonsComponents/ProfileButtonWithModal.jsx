import React from 'react'
import { Flex } from '@chakra-ui/react'
import ProfileButton from '../../../miscellaneous/ProfileButton'

const ProfileButtonWithModal = ({
  buttonText,
  inGameName,
  stateUserInGameName,
  isPrivate,
  hoverAnimation,
  icon,
  modalComponent: ModalComponent,
  isModalOpen,
  onOpenModal,
  onCloseModal,

  additionalProps = {},
}) => {
  return (
    <Flex
      borderRadius="10px"
      flexDirection="column"
      w={'100%'}
      height="fit-content"
      justifyContent={'center'}
      alignItems={'center'}
      position={'relative'}
      py={'5px'}
    >
      <ProfileButton
        buttonText={buttonText}
        inGameName={inGameName}
        stateUserInGameName={stateUserInGameName}
        Private={isPrivate}
        hoverAnimation={hoverAnimation}
        onClick={onOpenModal}
        icon={icon}
      />

      <ModalComponent
        isOpen={isModalOpen}
        onClose={onCloseModal}
        inGameName={inGameName}
        {...additionalProps}
      />
    </Flex>
  )
}

export default ProfileButtonWithModal
