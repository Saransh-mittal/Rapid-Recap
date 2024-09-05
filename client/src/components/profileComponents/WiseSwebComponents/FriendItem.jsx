import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box,
  Flex,
  Text,
  Avatar,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Badge,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next' // Import useTranslation hook
import UnlinkSVG from '../../../assets/svg/UnlinkSVG'
import UserSVG from '../../../assets/svg/UserSVG'
import MessageCircleSVG from '../../../assets/svg/MessageCircleSVG'
import PopoverOption from './PopoverOption'

const FriendItem = React.memo(
  ({ friend, index, openPopoverId, setOpenPopoverId, onSeverTies }) => {
    const { t } = useTranslation('FriendItem') // Hook for translation
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const cancelRef = useRef()
    const navigate = useNavigate()
    const popoverRef = useRef(null)

    useEffect(() => {
      if (openPopoverId === index && popoverRef.current) {
        const popoverRect = popoverRef.current.getBoundingClientRect()
        const modalBody = popoverRef.current.closest('.chakra-modal__body')
        if (modalBody) {
          const modalBodyRect = modalBody.getBoundingClientRect()
          if (popoverRect.bottom > modalBodyRect.bottom) {
            modalBody.scrollTop +=
              popoverRect.bottom - modalBodyRect.bottom + 10
          }
        }
      }
    }, [openPopoverId, index])

    const handleSeverTies = useCallback(() => {
      setOpenPopoverId(null)
      setIsConfirmOpen(true)
    }, [setOpenPopoverId])

    const onConfirmSeverTies = useCallback(() => {
      setIsConfirmOpen(false)
      onSeverTies(friend._id)
    }, [friend._id, onSeverTies])

    const handleToggle = useCallback(() => {
      setOpenPopoverId(prevId => (prevId === index ? null : index))
    }, [index, setOpenPopoverId])

    const handleCommune = useCallback(() => {
      setOpenPopoverId(null)
      navigate(`/chats?chatId=${friend.chatId}`)
    }, [friend.chatId, setOpenPopoverId, navigate])

    const handleGlimpseWisdom = useCallback(() => {
      setOpenPopoverId(null)
      navigate(`/profile/${friend.inGameName}`)
    }, [friend.inGameName, setOpenPopoverId, navigate])

    const calculatePlacement = useCallback(() => {
      if (
        !popoverRef.current ||
        !popoverRef.current.closest('.chakra-modal__body')
      )
        return 'bottom'
      const popoverRect = popoverRef.current.getBoundingClientRect()
      const modalRect = popoverRef.current
        .closest('.chakra-modal__body')
        .getBoundingClientRect()
      const spaceBelow = modalRect.bottom - popoverRect.bottom
      const spaceAbove = popoverRect.top - modalRect.top
      return spaceBelow >= 100 || spaceBelow > spaceAbove ? 'bottom' : 'top'
    }, [])

    const hoverBg = useColorModeValue('#2a2438', '#2a2438')
    const textColor = useColorModeValue('white', 'white')
    const subTextColor = useColorModeValue('#a0a0a0', '#a0a0a0')
    const onlineColor = '#4CAF50'
    const offlineColor = '#9e9e9e'
    const badgeBg = useColorModeValue('#4CAF50', '#4CAF50')

    return (
      <>
        <Popover
          isOpen={openPopoverId === index}
          onClose={() => setOpenPopoverId(null)}
          placement={calculatePlacement()}
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Flex
              alignItems="center"
              p={3}
              borderRadius="lg"
              transition="all 0.3s"
              _hover={{
                bg: hoverBg,
                transform: 'scale(1.02)',
                boxShadow: 'md',
              }}
              cursor="pointer"
              onClick={e => {
                e.stopPropagation()
                handleToggle()
              }}
            >
              <Avatar
                name={friend.name}
                src={
                  friend.pic
                    ? friend.pic
                    : `https://api.dicebear.com/6.x/initials/svg?seed=${friend.name}`
                }
                size="md"
              />
              <Box ml={4} flex={1}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={textColor}
                  mb={'2px'}
                >
                  {friend.name}
                </Text>
                <Text fontSize="xs" color={subTextColor} mb={0}>
                  @{friend.inGameName}
                </Text>
              </Box>
              <Badge
                bg={badgeBg}
                color="white"
                borderRadius="full"
                px={2}
                py={1}
                fontWeight="bold"
                fontSize="xs"
                boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                display="flex"
                alignItems="center"
              >
                <Text as="span" role="img" aria-label="brain" mr={1}>
                  🧠
                </Text>
                {friend.IQ_score}
              </Badge>
              <Box
                width="10px"
                height="10px"
                borderRadius="50%"
                bg={friend.isOnline ? onlineColor : offlineColor}
                ml={2}
              />
            </Flex>
          </PopoverTrigger>

          <PopoverContent
            ref={popoverRef}
            bg="#2a2438"
            borderColor="#3d355a"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            _focus={{ boxShadow: 'none' }}
            width="100%"
            zIndex={1500}
          >
            <PopoverBody p={2} width="100%">
              <PopoverOption
                icon={MessageCircleSVG}
                text={t('commune')}
                onClick={handleCommune}
              />
              <Box
                height="1px"
                width="100%"
                bg="linear-gradient(to right, #2a2438, #a49eb9, #2a2438)"
                my={2}
              />
              <PopoverOption
                icon={UserSVG}
                text={t('glimpseWisdom')}
                onClick={handleGlimpseWisdom}
              />
              <Box
                height="1px"
                width="100%"
                bg="linear-gradient(to right, #2a2438, #a49eb9, #2a2438)"
                my={2}
              />
              <PopoverOption
                icon={UnlinkSVG}
                text={t('severTies')}
                onClick={handleSeverTies}
                isRed={true}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <AlertDialog
          isOpen={isConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg="#2a2438" color="white">
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {t('severTiesWith', { name: friend.name })}
              </AlertDialogHeader>

              <AlertDialogBody>
                {t('severTiesConfirmation', { name: friend.name })}
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsConfirmOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button colorScheme="red" onClick={onConfirmSeverTies} ml={3}>
                  {t('severTies')}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    )
  },
)

export default FriendItem
