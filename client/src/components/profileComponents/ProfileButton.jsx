import { Button, Tag, Tooltip } from '@chakra-ui/react'
import React from 'react'
import useSound from '../../customHooks/useSound'
const ProfileButton = ({
  buttonText,
  inGameName,
  stateUserInGameName,
  Private,
  hoverAnimation,
  onClick,
  icon,
  top,
}) => {
  const { playClick } = useSound()
  return (
    <>
      {inGameName == stateUserInGameName && (
        <Tooltip label="Visibility to others">
          <Tag
            backgroundColor="rgba(15, 13, 21, 0.8)"
            m={0}
            position={'absolute'}
            top={top}
            right={'1.2rem'}
            color={'#9CAFAA'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            w={'60px'}
            height={'28px'}
            zIndex={1}
            borderRadius="5px"
            backdropFilter="blur(5px)"
          >
            {Private ? 'HIDDEN' : 'VISIBLE'}
          </Tag>
        </Tooltip>
      )}

      <Button
        w={'100%'}
        bg="#1a1527"
        color="white"
        fontSize="0.9em"
        letterSpacing="1px"
        _active={{
          bg: '#0f0d15',
          transform: 'scale(0.98)',
        }}
        // height={'50px'}
        leftIcon={icon}
        onClick={() => {
          playClick()
          onClick()
        }}
        borderColor="#2c2541"
        borderWidth="2px"
        // boxShadow="0 0 15px rgba(44, 37, 65, 0.5)"
        backgroundColor="rgba(15, 13, 21, 0.8)" // Adjust the alpha value (0.8) for transparency
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
        transition="all 0.3s ease-in-out"
        textTransform="uppercase"
        // py={6}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          transform: 'rotate(45deg)',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'all 0.6s ease-in-out',
        }}
        _hover={{
          _before: {
            left: '-100%',
            top: '-100%',
          },
        }}
      >
        {buttonText}
      </Button>
    </>
  )
}

export default ProfileButton
