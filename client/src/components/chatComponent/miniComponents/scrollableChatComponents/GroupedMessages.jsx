// src/components/chat/GroupedMessages.js
import React, { useMemo, useCallback, useRef } from 'react'
import { Box, Tooltip, Flex, Avatar, Text } from '@chakra-ui/react'
import {
  isSameSender,
  isLastMessage,
  isSameSenderMargin,
  isMessageDeletedForUser,
} from '../../config/ChatLogics'
import ArticleCard from '../../../miscellaneous/ArticleCard'
import MessageReactions from './MessageReactions'
import { useNavigate } from 'react-router-dom'
import { safelyAccessProperty } from '../../../../utils/helper.utils'

const SystemMessage = ({ content, id }) => (
  <Box
    style={{
      textAlign: 'center',
      margin: '40px 0',
      color: '#999',
      userSelect: 'none',
    }}
    key={id}
  >
    {content}
  </Box>
)

const ArticleMessage = React.memo(
  ({
    message,
    isSameSender,
    isLastMessage,
    user,
    handleContextMenu,
    handleTouchStart,
    handleTouchEnd,
    isScreenSmallerThan600px,
    formatTime,
    MessageStatus,
    navigate,
    handleReactionClick,
    isSameLoggedUser,
    isSameSenderMarginValue,
  }) => {
    const messageRef = useRef()
    return (
      <Box
        ref={messageRef}
        userSelect={'none'}
        mt={'1.5rem'}
        key={message._id}
        style={{
          display: 'flex',
          justifyContent: isSameLoggedUser ? 'flex-end' : 'flex-start',
          marginBottom: '0.45rem',
          width: '100%',
          alignSelf: isSameLoggedUser ? 'flex-end' : 'flex-start',
        }}
      >
        {(isSameSender || isLastMessage) && (
          <Tooltip
            label={message.sender.name}
            placement="bottom-start"
            hasArrow
          >
            <Avatar
              mt="7px"
              mr={3}
              size="sm"
              cursor="pointer"
              name={message.sender.name}
              src={message.sender.pic}
            />
          </Tooltip>
        )}
        <Flex
          w={isScreenSmallerThan600px ? '75%' : '40%'}
          onContextMenu={e =>
            handleContextMenu(e, message._id, messageRef.current)
          }
          onTouchStart={e =>
            handleTouchStart(e, message._id, messageRef.current)
          }
          onTouchEnd={handleTouchEnd}
          position={'relative'}
          marginLeft={isSameSenderMarginValue}
        >
          <ArticleCard
            article={message.article}
            onClick={() => {
              navigate(`/article/${message.article._id}`)
            }}
            viewMode="grid"
            width={'100%'}
            cancelHoverEffect={true}
          />
          <div
            style={{
              fontSize: '0.75rem',
              color: '#555',
              textAlign: 'right',
              marginTop: '2px',
              display: 'flex',
              position: 'absolute',
              bottom: '0.5rem',
              right: '0.5rem',
            }}
          >
            {formatTime(message.createdAt)}
            {!message.isDeleted && (
              <span style={{ marginLeft: '4px' }}>
                <MessageStatus message={message} user={user} />
              </span>
            )}
          </div>
          <Box>
            {message.content}
            <MessageReactions
              message={message}
              isSameLoggedUser={isSameLoggedUser}
              handleReactionClick={handleReactionClick}
            />
          </Box>
        </Flex>
      </Box>
    )
  },
)

const TextMessage = React.memo(
  ({
    message,
    isSameSender,
    isLastMessage,
    user,
    handleContextMenu,
    handleTouchStart,
    handleTouchEnd,
    isSameSenderMargin,
    formatTime,
    MessageStatus,
    handleReactionClick,
    isSameLoggedUser,
  }) => {
    const messageRef = useRef()
    return (
      <Box
        ref={messageRef}
        style={{ display: 'flex' }}
        key={message._id}
        marginBottom={'0.75rem'}
        className="message-container"
        userSelect={'none'}
      >
        {(isSameSender || isLastMessage) && (
          <Tooltip
            label={message.sender.name}
            placement="bottom-start"
            hasArrow
          >
            <Avatar
              mt="7px"
              mr={3}
              size="sm"
              cursor="pointer"
              name={message.sender.name}
              src={message.sender.pic}
            />
          </Tooltip>
        )}
        <span
          style={{
            backgroundColor: isSameLoggedUser ? '#BEE3F8' : '#B9F5D0',
            marginLeft: isSameSenderMargin,
            marginTop: isSameLoggedUser ? 3 : 5,
            borderRadius: '12px',
            padding: '5px 15px',
            maxWidth: '80%',
            color: 'black',
            marginRight: '0.75rem',
            position: 'relative',
            cursor: 'pointer',
          }}
          onContextMenu={e =>
            handleContextMenu(e, message._id, messageRef.current)
          }
          onTouchStart={e =>
            handleTouchStart(e, message._id, messageRef.current)
          }
          onTouchEnd={handleTouchEnd}
        >
          <Text
            color={message.isDeleted ? '#9CAFAA' : 'black'}
            fontStyle={message.isDeleted ? 'italic' : ''}
            m={0}
            p={0}
          >
            {message.isDeleted ? 'This message was deleted' : message.content}
          </Text>
          <MessageReactions
            message={message}
            isSameLoggedUser={isSameLoggedUser}
            handleReactionClick={handleReactionClick}
          />
          <div
            style={{
              fontSize: '0.75rem',
              color: '#555',
              textAlign: 'right',
              marginTop: '2px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            {formatTime(message.createdAt)}
            {!message.isDeleted && (
              <span style={{ marginLeft: '4px' }}>
                <MessageStatus message={message} user={user} />
              </span>
            )}
          </div>
        </span>
      </Box>
    )
  },
)

const GroupedMessages = ({
  groupedMessages,
  handleContextMenu,
  handleTouchStart,
  handleTouchEnd,
  handleReactionClick,
  formatTime,
  MessageStatus,
  user,
  isScreenSmallerThan600px,
}) => {
  const navigate = useNavigate()

  const memoizedMessages = useMemo(() => {
    return Object.entries(groupedMessages).map(([date, msgs]) => (
      <React.Fragment key={date}>
        <div style={{ textAlign: 'center', margin: '40px 0', color: '#999' }}>
          {date}
        </div>
        {msgs.map((m, i) => {
          const senderId = safelyAccessProperty(m, 'sender._id')
          if (!senderId) {
            return null
          }
          const messageDeletedForUser = isMessageDeletedForUser(
            m,
            user._id.toString(),
          )
          const messageDeleted = m.isDeleted
          const isSameLoggedUser = senderId === user._id
          const isSameSenderValue = isSameSender(msgs, m, i, user._id)
          const isLastMessageValue = isLastMessage(msgs, i, user._id)
          const isSameSenderMarginValue = isSameSenderMargin(
            msgs,
            m,
            i,
            user._id,
          )

          let messageComponent

          if (m.type === 'system') {
            messageComponent = (
              <SystemMessage key={m._id} content={m.content} id={m._id} />
            )
          } else if (
            m.type === 'article_card' &&
            !(messageDeleted || messageDeletedForUser)
          ) {
            messageComponent = (
              <ArticleMessage
                key={m._id}
                message={m}
                isSameSender={isSameSenderValue}
                isLastMessage={isLastMessageValue}
                isSameSenderMarginValue={isSameSenderMarginValue}
                user={user}
                handleContextMenu={handleContextMenu}
                handleTouchStart={handleTouchStart}
                handleTouchEnd={handleTouchEnd}
                isScreenSmallerThan600px={isScreenSmallerThan600px}
                formatTime={formatTime}
                MessageStatus={MessageStatus}
                navigate={navigate}
                handleReactionClick={handleReactionClick}
                isSameLoggedUser={isSameLoggedUser}
              />
            )
          } else {
            messageComponent = (
              <TextMessage
                key={m._id}
                message={m}
                isSameSender={isSameSenderValue}
                isLastMessage={isLastMessageValue}
                user={user}
                handleContextMenu={handleContextMenu}
                handleTouchStart={handleTouchStart}
                handleTouchEnd={handleTouchEnd}
                isSameSenderMargin={isSameSenderMarginValue}
                formatTime={formatTime}
                MessageStatus={MessageStatus}
                handleReactionClick={handleReactionClick}
                isSameLoggedUser={isSameLoggedUser}
              />
            )
          }

          return messageComponent
        })}
      </React.Fragment>
    ))
  }, [
    groupedMessages,
    user._id,
    handleContextMenu,
    handleTouchStart,
    handleTouchEnd,
    handleReactionClick,
    formatTime,
    MessageStatus,
    isScreenSmallerThan600px,
    navigate,
  ])

  return <>{memoizedMessages}</>
}

export default GroupedMessages
