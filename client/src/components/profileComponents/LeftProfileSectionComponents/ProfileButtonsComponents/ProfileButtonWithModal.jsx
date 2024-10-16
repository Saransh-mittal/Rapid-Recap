import React, { Suspense } from 'react'
import { Flex, Skeleton } from '@chakra-ui/react'
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
  isLoading,
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

      <Suspense fallback={<Skeleton height="200px" width="100%" />}>
        <ModalComponent
          isOpen={isModalOpen}
          onClose={onCloseModal}
          isLoading={isLoading}
          inGameName={inGameName}
          {...additionalProps}
        />
      </Suspense>
    </Flex>
  )
}

export default ProfileButtonWithModal
