import React from 'react'
import { Flex, Icon, Tooltip } from '@chakra-ui/react'
import Button from '../miscellaneous/ButtonComponent'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import { LockIcon } from '@chakra-ui/icons'
import ShareSVG from '../../assets/svg/ShareSVG'
import { useSelector } from 'react-redux'

const ShareButton = ({
  onClick,
  isDisabled,
  onOpenSignin,
  setShowNote,
  user,
}) => {
  return (
    <Flex position={'relative'}>
      {isDisabled && (
        <Tooltip label="Please log in to share" placement="top">
          <LockIcon
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="white"
            boxSize={6}
            zIndex={2}
            onClick={user?.role !== 'guest' ? onOpenSignin : null}
            cursor={'pointer'}
          />
        </Tooltip>
      )}
      <Flex
        style={
          isDisabled
            ? { filter: 'blur(5px)', userSelect: 'none' }
            : { userSelect: 'text' }
        }
      >
        <Button
          onClick={() => {
            user?.role !== 'guest' ? onClick() : setShowNote(true)
          }}
          buttonW="7rem"
          textColor={'white'}
        >
          Share
          <Icon as={ShareSVG} />
        </Button>
        <ButtonGradient />
      </Flex>
    </Flex>
  )
}

export default ShareButton
