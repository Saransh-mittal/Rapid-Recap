import React from 'react'
import { Flex, Badge, Tooltip } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import useSound from '../../customHooks/useSound'

const ProfileButton = React.forwardRef(
  (
    {
      buttonText,
      inGameName,
      stateUserInGameName,
      Private,
      hoverAnimation,
      onClick,
      icon,
      isGuest = false,
      notShowVisibility = false,
    },
    ref,
  ) => {
    const { playClick } = useSound()
    const { t } = useTranslation('ProfileButton')

    return (
      <Flex
        ref={ref}
        w={'100%'}
        bg="#1a1527"
        color="white"
        fontSize="0.9em"
        letterSpacing="1px"
        _active={{
          bg: '#0f0d15',
          transform: 'scale(0.98)',
        }}
        onClick={() => {
          playClick()
          onClick()
        }}
        borderColor="#2c2541"
        borderWidth="2px"
        backgroundColor="rgba(15, 13, 21, 0.8)"
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
        transition="all 0.3s ease-in-out"
        textTransform="uppercase"
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
          cursor: 'pointer',
        }}
        p={2}
        borderRadius="xl"
      >
        <Flex w={'100%'} alignItems={'center'}>
          <Flex gap={2} justifyContent={'center'} w={'100%'}>
            <Flex>{icon}</Flex>
            <Flex>{t(buttonText)}</Flex>
          </Flex>

          <Flex position={'absolute'} right={2}>
            {inGameName == stateUserInGameName &&
              !isGuest &&
              !notShowVisibility && (
                <Tooltip label={t('visibilityTooltip')}>
                  <Badge
                    colorScheme="green"
                    m={0}
                    zIndex={1}
                    borderRadius="5px"
                  >
                    {Private ? t('hidden') : t('visible')}
                  </Badge>
                </Tooltip>
              )}
          </Flex>
        </Flex>
      </Flex>
    )
  },
)

export default ProfileButton
