import React from 'react'
import { Flex, Icon, Tooltip } from '@chakra-ui/react'
import Button from '../miscellaneous/ButtonComponent'
import ButtonGradient from '../../assets/svg/ButtonGradient'
import { LockIcon } from '@chakra-ui/icons'
import ShareSVG from '../../assets/svg/ShareSVG'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const ShareButton = ({
  onClick,
  isDisabled,
  onOpenSignin,
  setShowNote,
  user,
}) => {
  const { t } = useTranslation('ShareButton')
  return (
    <Flex position={'relative'}>
      {isDisabled && (
        <Tooltip label={t('loginToShare')} placement="top">
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
          {t('share')}
          <Icon as={ShareSVG} />
        </Button>
        <ButtonGradient />
      </Flex>
    </Flex>
  )
}

export default ShareButton
