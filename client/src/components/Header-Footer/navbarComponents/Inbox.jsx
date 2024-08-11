import { EmailIcon } from '@chakra-ui/icons'
import { Badge, Button, Flex } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import useSound from '../../../customHooks/useSound'

const Inbox = ({
  className,
  marginLeftButton,
  onClick,
  notifyCont,
  display,
  h = '6',
  w = '6',
}) => {
  const { playClick } = useSound()

  // Memoize the onClick handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    playClick()
    onClick()
  }, [playClick, onClick])

  return (
    <Flex className={className} display={display}>
      <Button
        display={display}
        background={'transparent'}
        padding={0}
        marginLeft={marginLeftButton}
        color={'white'}
        _hover={{ background: 'transparent' }}
        onClick={handleClick} // Use memoized handler
        h={'fit-content'}
      >
        <EmailIcon width={w} height={h} />
        {notifyCont > 0 && (
          <Badge
            borderRadius="50%"
            h={'15px'}
            w={'15px'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            backgroundColor="red"
            color="white"
            fontSize="sm"
            position="absolute"
            top="-5px"
            right="0"
            pb={'2px'}
            pr={'5px'}
          >
            {notifyCont}
          </Badge>
        )}
      </Button>
    </Flex>
  )
}

export default Inbox
