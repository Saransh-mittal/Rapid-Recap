// MessageActions.jsx
import React, { Suspense } from 'react'
import { HStack, Button, Flex, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckIcon, CloseIcon } from '@chakra-ui/icons'

// Lazy load ButtonFactory
const ButtonFactory = React.lazy(() => import('../ButtonFactory'))

// Motion components
const MotionFlex = motion(Flex)
const MotionButton = motion(Button)

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 120,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
}

const buttonVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      damping: 10,
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 300,
    },
  },
}

const MessageActions = ({ message, handleAction, handleDismiss }) => {
  const { t } = useTranslation('NoteMessageSummary')
  const { t: GuestLoginTranslate } = useTranslation('GuestLogin')

  return (
    <MotionFlex
      mt={3}
      spacing={2}
      justify="flex-end"
      alignItems="center"
      flexWrap="wrap"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Suspense fallback={null}>
        {message.actions &&
          message.actions.map((action, actionIndex) => (
            <motion.div
              key={actionIndex}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              style={{ margin: '4px' }}
            >
              <ButtonFactory
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
            </motion.div>
          ))}
      </Suspense>

      <motion.div
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        style={{ margin: '4px' }}
      >
        <MotionButton
          size="sm"
          onClick={() => handleDismiss(message.id)}
          borderRadius="full"
          bg="rgba(255,255,255,0.1)"
          color="whiteAlpha.800"
          _hover={{
            bg: 'rgba(255,255,255,0.15)',
          }}
          leftIcon={<CloseIcon boxSize="0.7em" />}
          fontWeight="medium"
          px={3}
          fontSize="0.8rem"
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor="rgba(255,255,255,0.1)"
        >
          {t('dismiss')}
        </MotionButton>
      </motion.div>
    </MotionFlex>
  )
}

export default MessageActions
