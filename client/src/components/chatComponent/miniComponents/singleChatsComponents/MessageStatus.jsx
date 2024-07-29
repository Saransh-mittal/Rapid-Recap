// File: MessageStatus.js
import React from 'react'
import { BsClock, BsCheck, BsCheckAll } from 'react-icons/bs'

const MessageStatus = ({ message, user }) => {
  if (!user || message.sender._id !== user?._id) return null

  switch (message.status) {
    case 'sending':
      return <BsClock color="#999" size={16} />
    case 'sent':
      return <BsCheck color="#999" size={16} />
    case 'delivered':
      return <BsCheckAll color="#999" size={16} />
    case 'read':
      return <BsCheckAll color="#34B7F1" size={16} />
    default:
      return null
  }
}

export default MessageStatus
