// src/components/WiseWeb/components/chat/EmptyConversationState.jsx - Empty state component
import React from 'react'
import { MessageCircle, Users, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { QUICK_CLASH_CLASSES } from '../../../quickClashComponents/utils/quickClashColors'

const EmptyConversationState = ({ type = 'no-conversations', onAction }) => {
  const { t } = useTranslation('WiseWeb')

  const states = {
    'no-conversations': {
      icon: MessageCircle,
      title: t('No Conversations Yet'),
      description: t(
        'Start chatting with your friends to see conversations here',
      ),
      actionText: t('Find Friends'),
      actionIcon: Users,
    },
    'no-messages': {
      icon: MessageCircle,
      title: t('Start the Conversation'),
      description: t('Send your first message to get things started'),
      actionText: t('Say Hello'),
      actionIcon: Zap,
    },
    'friend-offline': {
      icon: MessageCircle,
      title: t('Friend is Offline'),
      description: t('They will see your messages when they come back online'),
      actionText: null,
      actionIcon: null,
    },
  }

  const state = states[type]
  const Icon = state.icon
  const ActionIcon = state.actionIcon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`
          w-20 h-20 rounded-2xl flex items-center justify-center mb-6
          bg-gradient-to-br from-cyan-500/20 to-blue-500/20
          border border-cyan-400/30
          ${QUICK_CLASH_CLASSES.shadowCyan}
        `}
      >
        <Icon className="w-10 h-10 text-cyan-300" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-bold text-cyan-200 mb-3"
      >
        {state.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs"
      >
        {state.description}
      </motion.p>

      {state.actionText && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onAction}
          className={`
            ${QUICK_CLASH_CLASSES.btnPrimary} px-6 py-3 rounded-xl font-medium
            flex items-center gap-2 ${QUICK_CLASH_CLASSES.shadowCyan}
            hover:scale-105 transition-all duration-200
          `}
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {state.actionText}
        </motion.button>
      )}
    </motion.div>
  )
}

export default EmptyConversationState
