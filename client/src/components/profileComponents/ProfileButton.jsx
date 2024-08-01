import { Button, Tag, Tooltip } from '@chakra-ui/react'
import React, { useContext } from 'react'
import useSound from '../../customHooks/useSound'
import { AppContext } from '../../contextAPI/appContext'

const ProfileButton = ({
  buttonText,
  inGameName,
  stateUserInGameName,
  Private,
  hoverAnimation,
  onClick,
  icon,
}) => {
  const { playClick } = useContext(AppContext)
  return (
    <>
      {inGameName == stateUserInGameName && (
        <Tooltip label="Visibility to others">
          <Tag
            backgroundColor="#0f0d15"
            m={0}
            position={'absolute'}
            top={'1.2rem'}
            right={'1.2rem'}
            color={'#9CAFAA'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            w={'60px'}
            height={'30px'}
            zIndex={1}
          >
            {Private ? 'HIDDEN' : 'VISIBLE'}
          </Tag>
        </Tooltip>
      )}

      <Button
        w={'100%'}
        bgGradient="linear(to-r, teal.500, blue.500)"
        color="white"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        _hover={{
          bgGradient: 'linear(to-r, red.500, yellow.500)',
          animation: `${hoverAnimation} 0.5s ease-in-out`,
        }}
        _active={{
          bgGradient: 'linear(to-r, purple.500, pink.500)',
          transform: 'scale(0.95)',
        }}
        leftIcon={icon} // Add icon here
        onClick={() => {
          playClick()
          onClick()
        }}
      >
        {buttonText}
      </Button>
    </>
  )
}

export default ProfileButton
