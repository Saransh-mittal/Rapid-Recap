import React from 'react'
import { VStack, Text, Spinner, Tooltip, Icon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import useNotification from '../../../../customHooks/useNotification'
import ProfileButton from '../../../miscellaneous/ProfileButton'
import { BellIcon, NotAllowedIcon } from '@chakra-ui/icons'

const BellOffIcon = props => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20.84 22.73L18.11 20H3v-2l2-2v-6c0-2.48 1.51-4.5 4-5.52V4c0-1.1.9-2 2-2s2 .9 2 2v.48l7.84 7.84L20.84 22.73zM19 15.8V11c0-3.1-2.01-5.63-4.78-6.5L13 3.28V4c0-.55-.45-1-1-1s-1 .45-1 1v1.18L8.82 8H10v1.18l8.18 8.18L19 15.8zM12 23c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"
    />
  </Icon>
)

const NotificationSubscription = () => {
  const { t } = useTranslation('Settings')
  const { supported, isSubscribed, loading, error, handleEnableNotifications } =
    useNotification()

  const getButtonText = () => {
    if (!supported) return t('notSupported')
    if (isSubscribed) return t('reEnableNotifications')
    return t('enableNotifications')
  }

  const getButtonIcon = () => {
    if (!supported) return <NotAllowedIcon />
    return isSubscribed ? <BellIcon /> : <BellOffIcon />
  }

  return (
    <VStack spacing={6} align="stretch" width="100%">
      {loading && <Spinner size="xl" alignSelf="center" />}
      {!loading && (
        <>
          <Text
            fontSize="lg"
            fontWeight="medium"
            color="white"
            textAlign="center"
          >
            {supported
              ? t(
                  isSubscribed
                    ? 'notificationsSubscribed'
                    : 'notificationsNotSubscribed',
                )
              : t('notificationsNotSupported')}
          </Text>

          <Tooltip
            label={
              !supported
                ? t('browserNotSupported')
                : isSubscribed
                ? t('reEnableTooltip')
                : t('enableTooltip')
            }
          >
            <ProfileButton
              buttonText={getButtonText()}
              onClick={handleEnableNotifications}
              icon={getButtonIcon()}
              inGameName=""
              stateUserInGameName=""
              Private={false}
              isGuest={false}
              notShowVisibility={true}
            />
          </Tooltip>
        </>
      )}
      {error && (
        <Text color="red.500" textAlign="center" fontSize="md">
          {error}
        </Text>
      )}
    </VStack>
  )
}

export default NotificationSubscription
