// File: useSocketHandlers.js
import { useEffect } from 'react'
import { handleSocketEvents } from '../utils/chat.utils'

const useSocketHandlers = (
  socket,
  user,
  selectedChat,
  setIsTyping,
  setFetchAgain,
  messages,
  setMessages,
  updateLatestMessage,
  setNotification,
  selectedChatCompare,
  fetchAgain,
) => {
  useEffect(() => {
    const socketEvents = {
      onTyping: () => setIsTyping(true),
      onStopTyping: () => setIsTyping(false),
      onMessageReceived: newMessageRecieved => {
        if (
          selectedChatCompare.current && // if chat is not selected or doesn't match current chat
          selectedChatCompare.current._id === newMessageRecieved.chat._id
        ) {
          setMessages([...messages, newMessageRecieved])
          updateLatestMessage(newMessageRecieved.chat._id, newMessageRecieved)
          setNotification(prevNotification => {
            return prevNotification.filter(
              chatId => chatId !== newMessageRecieved.chat._id.toString(),
            )
          })
        }
        setFetchAgain(!fetchAgain)

        // console.log("Message Received");
        socket?.emit('message delivered', {
          messageId: newMessageRecieved._id,
          userId: user._id,
        })
      },
      onMessageDeleted: deletedMessageInfo => {
        const { messageId, deleteType, chatId } = deletedMessageInfo
        const updatedMessages = messages?.map(msg =>
          msg._id === messageId
            ? deleteType === 'everyone'
              ? { ...msg, isDeleted: true }
              : { ...msg, deletedFor: [...msg.deletedFor, user._id] }
            : msg,
        )
        setFetchAgain(!fetchAgain)
        setMessages(updatedMessages)
      },
      onMessageStatusUpdated: ({ messageId, status }) => {
        setMessages(prevMessages =>
          prevMessages?.map(msg =>
            msg._id === messageId ? { ...msg, status } : msg,
          ),
        )
      },
      onReactionAdded: updatedMessage => {
        setMessages(
          messages?.map(msg =>
            msg._id === updatedMessage._id ? updatedMessage : msg,
          ),
        )
      },
      onReactionRemoved: updatedMessage => {
        setMessages(
          messages?.map(msg =>
            msg._id === updatedMessage._id ? updatedMessage : msg,
          ),
        )
      },
      userId: user?._id,
      chatId: selectedChat?._id,
    }

    socket?.emit('open chat', { userId: user?._id, chatId: selectedChat?._id })
    return handleSocketEvents(socket, socketEvents)
  }, [socket, user, selectedChat, messages, fetchAgain])
}

export default useSocketHandlers
