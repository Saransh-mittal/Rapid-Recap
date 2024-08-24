import React from 'react'
import { Flex, Icon, Tooltip } from '@chakra-ui/react'
import Button from '../miscellaneous/ButtonComponent'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import { LockIcon } from '@chakra-ui/icons'
import ShareSVG from '../../assets/svg/ShareSVG'
import { useDispatch } from 'react-redux'
import { addNoteMessage } from '../../redux/appSlice'

const ShareButton = ({ onClick, isDisabled, onOpenSignin, user }) => {
  const dispatch = useDispatch()
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
            onClick={
              user?.role !== 'guest'
                ? onOpenSignin
                : () =>
                    dispatch(
                      addNoteMessage({
                        title:
                          'Register to see your IQ score and grow Wise Web',
                        duration: 10000,
                        width: '250px',
                        actions: [
                          {
                            actionType: 'SECURE_YOUR_PROGRESS',
                          },
                        ],
                      }),
                    )
            }
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
            console.log('Share button clicked')
            user?.role !== 'guest'
              ? onClick()
              : dispatch(
                  addNoteMessage({
                    title: 'Register to see your IQ score and grow Wise Web',
                    duration: 10000,
                    width: '250px',
                    actions: [
                      {
                        actionType: 'SECURE_YOUR_PROGRESS',
                      },
                    ],
                  }),
                )
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
