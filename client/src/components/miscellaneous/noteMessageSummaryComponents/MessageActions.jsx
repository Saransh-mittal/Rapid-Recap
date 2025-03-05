import React, { Suspense } from 'react'
import { HStack, Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const ButtonFactory = React.lazy(() => import('../ButtonFactory'))

const MessageActions = ({ message, handleAction, handleDismiss }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const { t: GuestLoginTranslate } = useTranslation('GuestLogin')

  return (
    <HStack mt={2} spacing={2} justify={'center'}>
      <Suspense fallback={null}>
        {message.actions &&
          message.actions.map((action, actionIndex) => (
            <ButtonFactory
              key={actionIndex}
              actionType={action.actionType}
              path={action?.path}
              onClick={() =>
                handleAction(action.actionType, message.id, action.payload)
              }
              size="sm"
              innerText={action.text}
              GuestLoginTranslate={GuestLoginTranslate}
            >
              {!(action.actionType === 'SIGN_IN') && action.text}
            </ButtonFactory>
          ))}
      </Suspense>
      <Button size="sm" onClick={() => handleDismiss(message.id)}>
        {t('dismiss')}
      </Button>
    </HStack>
  )
}

export default MessageActions
