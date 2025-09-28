// src/components/WiseWeb/components/chat/ChatConnectionStatus.jsx - Connection indicator
import React from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const ChatConnectionStatus = ({
  isConnected,
  isConnecting,
  hasError = false,
  showText = true,
  size = 'sm',
}) => {
  const { t } = useTranslation('WiseWeb')

  const getStatus = () => {
    if (hasError)
      return { icon: AlertCircle, color: 'text-red-400', text: t('Error') }
    if (isConnecting)
      return { icon: Wifi, color: 'text-yellow-400', text: t('Connecting...') }
    if (isConnected)
      return { icon: Wifi, color: 'text-green-400', text: t('Connected') }
    return { icon: WifiOff, color: 'text-red-400', text: t('Offline') }
  }

  const status = getStatus()
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={isConnecting ? { rotate: 360 } : {}}
        transition={
          isConnecting ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}
        }
      >
        <status.icon className={`${iconSizes[size]} ${status.color}`} />
      </motion.div>

      {showText && (
        <span className={`text-xs ${status.color}`}>{status.text}</span>
      )}
    </div>
  )
}

export default ChatConnectionStatus
