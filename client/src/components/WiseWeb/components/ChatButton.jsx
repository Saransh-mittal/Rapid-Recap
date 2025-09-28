// src/components/WiseWeb/components/ChatButton.jsx - Chat button for friend cards
import React from 'react'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { QUICK_CLASH_CLASSES } from '../../quickClashComponents/utils/quickClashColors'

const ChatButton = ({ friend, onClick, size = 'sm' }) => {
  const { t } = useTranslation('WiseWeb')

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <button
      onClick={e => {
        e.stopPropagation()
        onClick(friend)
      }}
      className={`
        ${sizeClasses[size]} rounded-lg flex items-center justify-center
        ${QUICK_CLASH_CLASSES.btnSecondary} ${QUICK_CLASH_CLASSES.hoverCyan}
        transition-all duration-200 hover:scale-105
        ${QUICK_CLASH_CLASSES.focusRingCyan}
      `}
      title={t('Start Chat with {{name}}', { name: friend.name })}
    >
      <MessageCircle className={`${iconSizes[size]} text-white`} />
    </button>
  )
}

ChatButton.displayName = 'ChatButton'

export default ChatButton
