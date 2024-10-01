import React, { createContext, useContext, useRef } from 'react'
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  useColorModeValue,
  Text,
  useDisclosure,
  Flex,
  Box,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'

const InfoButtonContext = createContext()

export const InfoButtonProvider = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const openPopoverId = useRef(null)

  const open = id => {
    if (openPopoverId.current !== id) {
      onOpen()
      openPopoverId.current = id
    }
  }

  const close = () => {
    onClose()
    openPopoverId.current = null
  }

  return (
    <InfoButtonContext.Provider value={{ isOpen, open, close, openPopoverId }}>
      {children}
    </InfoButtonContext.Provider>
  )
}

const InfoButton = ({
  id,
  text = 'This elegantly designed component brings a touch of sophistication to your interface.',
  size = 4,
  color = 'gray.500',
}) => {
  const { isOpen, open, close, openPopoverId } = useContext(InfoButtonContext)
  const buttonBg = useColorModeValue(
    'linear(to-r, yellow.400, amber.300)',
    'linear(to-r, yellow.200, amber.100)',
  )
  const iconColor = useColorModeValue('white.800', 'white.900')
  const textColor = 'gray.300'
  const popoverBgGradient = 'linear(to-b, gray.900, black)'
  const borderColor = useColorModeValue('amber.300', 'amber.500')

  const handleOpen = () => open(id)
  const isThisOpen = isOpen && openPopoverId.current === id

  return (
    <Flex justifyContent={'center'} alignItems={'center'}>
      <Popover
        isOpen={isThisOpen}
        onClose={close}
        placement="auto"
        closeOnBlur={true}
        strategy="fixed"
        flip={true}
        preventOverflow={true}
      >
        <PopoverTrigger>
          <IconButton
            icon={<InfoIcon boxSize={size} color={color} />}
            aria-label="Information"
            bgGradient={buttonBg}
            color={iconColor}
            bg="transparent"
            rounded="full"
            onClick={handleOpen}
            _hover={{
              shadow: 'lg',
              _dark: { shadow: 'dark-lg' },
            }}
            _active={{
              bgGradient: useColorModeValue(
                'linear(to-r, yellow.500, amber.400)',
                'linear(to-r, yellow.300, amber.200)',
              ),
            }}
          />
        </PopoverTrigger>
        <PopoverContent
          bgGradient={popoverBgGradient}
          borderColor={borderColor}
          boxShadow="xl"
          _dark={{ boxShadow: 'dark-lg' }}
          width="auto"
          maxWidth="calc(100vw - 32px)"
          mx="16px"
        >
          <PopoverBody>
            <Text
              color={textColor}
              fontFamily="serif"
              fontSize="md"
              lineHeight="tall"
            >
              {text}
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  )
}

export default InfoButton
