import { Flex, keyframes, Spinner, useDisclosure } from '@chakra-ui/react'
import React, { Suspense } from 'react'
import ProfileButton from '../profileComponents/ProfileButton'
import SecureProgressSVG from '../../assets/svg/SecureProgressSVG'
import Register from '../../screens/Register'
import { useSelector } from 'react-redux'

const SecureYourProgress = () => {
  const { user } = useSelector(state => state.auth)
  const {
    isOpen: isOpenRegister,
    onOpen: onOpenRegister,
    onClose: onCloseRegister,
  } = useDisclosure()

  const hoverAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `
  return (
    <Flex
      py={'8px'}
      borderRadius="10px"
      flexDirection="column"
      w={{ md: '85%', lg: '95%', base: '100%' }}
      height="fit-content"
      justifyContent={'center'}
      alignItems={'center'}
      position={'relative'}
      className="season-analytics"
    >
      <ProfileButton
        buttonText="Secure your process"
        isGuest={true}
        hoverAnimation={hoverAnimation}
        onClick={() => {
          onOpenRegister()
        }}
        icon={
          <SecureProgressSVG width={'20px'} height={'20px'} fill={'#fff'} />
        }
        top={'0.9rem'}
      />
      <Suspense fallback={<Spinner />}>
        <Register
          isOpen={isOpenRegister}
          onClose={onCloseRegister}
          exportData={true}
          guestId={user?._id}
        />
      </Suspense>
    </Flex>
  )
}

export default SecureYourProgress
