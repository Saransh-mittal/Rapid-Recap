// src/components/WiseWeb/components/chat/ChatNotificationBadge.jsx - Unread message badge
import React from 'react'
import { motion } from 'framer-motion'
import { QUICK_CLASH_CLASSES } from '../../../quickClashComponents/utils/quickClashColors'

const ChatNotificationBadge = ({ count, size = 'sm', className = '' }) => {
  if (!count || count === 0) return null

  const sizeClasses = {
    xs: 'text-xs min-w-[14px] h-[14px] px-1',
    sm: 'text-xs min-w-[18px] h-[18px] px-1.5',
    md: 'text-sm min-w-[20px] h-[20px] px-2',
    lg: 'text-sm min-w-[24px] h-[24px] px-2.5',
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={`
        ${sizeClasses[size]} ${QUICK_CLASH_CLASSES.badgeRed}
        flex items-center justify-center font-bold rounded-full
        ${className}
      `}
    >
      {count > 99 ? '99+' : count}
    </motion.div>
  )
}

export default ChatNotificationBadge
