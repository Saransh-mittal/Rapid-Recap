// src/utils/chatHelpers.js - Chat utility functions
export const formatChatTime = (timestamp, locale = 'en-US') => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Today - show time
  if (diffDays === 0) {
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday'
  }

  // This week - show day name
  if (diffDays < 7) {
    return date.toLocaleDateString(locale, { weekday: 'short' })
  }

  // Older - show date
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })
}

export const formatLastSeen = (timestamp, locale = 'en-US') => {
  if (!timestamp) return 'Never'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  })
}

export const truncateMessage = (content, maxLength = 50) => {
  if (!content) return ''
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength - 3) + '...'
}

export const generateConversationId = (userId1, userId2) => {
  // Create consistent conversation ID regardless of order
  const sortedIds = [userId1, userId2].sort()
  return sortedIds.join('_')
}

export const isValidMessageContent = content => {
  if (!content || typeof content !== 'string') return false
  if (content.trim().length === 0) return false
  if (content.length > 1000) return false
  return true
}

export const sanitizeMessageContent = content => {
  if (!content) return ''

  // Basic sanitization
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 1000) // Enforce max length
}

export const getMessageStatusIcon = status => {
  const statusIcons = {
    sending: '⏳',
    sent: '✓',
    delivered: '✓✓',
    read: '✓✓',
  }
  return statusIcons[status] || ''
}

export const getMessageStatusColor = status => {
  const statusColors = {
    sending: 'text-slate-500',
    sent: 'text-slate-400',
    delivered: 'text-slate-400',
    read: 'text-cyan-400',
  }
  return statusColors[status] || 'text-slate-500'
}
