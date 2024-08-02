import { EmailIcon } from '@chakra-ui/icons'
import { Badge, Button, Flex } from '@chakra-ui/react'
import React, { useContext } from 'react'
import useSound from '../../../customHooks/useSound'
import { AppContext } from '../../../contextAPI/appContext'

const Inbox = ({
  className,
  marginLeftButton,
  onClick,
  notifyCont,
  display,
  h = '6',
  w = '6',
}) => {
  const { playClick } = useContext(AppContext)
  return (
    <>
      <Flex className={className} display={display}>
        <Button
          display={display}
          background={'transparent'}
          padding={0}
          marginLeft={marginLeftButton}
          color={'white'}
          _hover={{ background: 'transparent' }}
          onClick={() => {
            playClick()
            onClick()
          }} // Open drawer onClick
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
              // padding="2px"
              pb={'2px'}
              pr={'5px'}
            >
              {notifyCont}
            </Badge>
          )}
        </Button>
      </Flex>
    </>
  )
}

export default Inbox
