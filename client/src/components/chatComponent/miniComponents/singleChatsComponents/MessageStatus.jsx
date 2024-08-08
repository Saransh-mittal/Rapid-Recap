// File: MessageStatus.js
import React from 'react'
import ClockSVG from '../../../../assets/svg/ClockSVG'
import CheckSVG from '../../../../assets/svg/CheckSVG'
import CheckAllSVG from '../../../../assets/svg/CheckAllSVG'

const MessageStatus = ({ message, user }) => {
  if (!user || message.sender._id !== user?._id) return null

  switch (message.status) {
    case 'sending':
      return <ClockSVG width={'16px'} height={'16px'} stroke={'#999'} />
    case 'sent':
      return <CheckSVG width={'16px'} height={'16px'} stroke={'#999'} />
    case 'delivered':
      return <CheckAllSVG width={'16px'} height={'16px'} fill={'#999'} />
    case 'read':
      return <CheckAllSVG width={'16px'} height={'16px'} fill={'#34B7F1'} />
    default:
      return null
  }
}

export default MessageStatus
