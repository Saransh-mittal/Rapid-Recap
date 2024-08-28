const asyncHandler = require('express-async-handler')
const FriendRequest = require('../model/friendRequestSchema')
const User = require('../model/userSchema')
const Chat = require('../model/chatSchema')
const { sendNotification } = require('../services/notificationService')
const { activityTypes, getXpForActivity } = require('../data/activityTypes')
const { logActivity } = require('../utils/activity.utils')

//@description     Send friend request
//@route           POST /api/friends/send-request
//@access          Protected
const sendRequest = asyncHandler(async (req, res) => {
  const { fromId, toId } = req.body

  try {
    if (fromId === toId)
      return res
        .status(400)
        .json({ message: "You can't send a friend request to yourself" })
    const newRequest = new FriendRequest({ from: fromId, to: toId })
    await newRequest.save()

    const sender = await User.findByIdAndUpdate(fromId, {
      $push: { sentRequests: newRequest._id },
    }).select('name pic role')
    const receiver = await User.findByIdAndUpdate(toId, {
      $push: { receivedRequests: newRequest._id },
    }).select('inGameName role')

    if (receiver.role === 'guest' || sender.role === 'guest') {
      return res
        .status(400)
        .json({ message: 'Guest users cannot send or receive friend requests' })
    }

    await sendNotification({
      title: `Friend request from ${sender.name}`,
      icon: sender.pic,
      // url: `/profile/${receiver.inGameName}/?requestId=${newRequest._id}`,
      url: `/home?wiseweb=true`,
      userId: toId.toString(),
    })

    res.status(200).json({ message: 'Friend request sent' })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     Accept friend request
//@route           POST /api/friends/accept-request
//@access          Protected
const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body

  try {
    const request = await FriendRequest.findById(requestId).populate('from to')
    if (!request) return res.status(404).json({ message: 'Request not found' })

    request.status = 'accepted'
    await request.save()

    const sender = await User.findByIdAndUpdate(request.from._id, {
      $push: { friends: request.to._id },
    }).select('inGameName _id role')
    const receiver = await User.findByIdAndUpdate(request.to._id, {
      $push: { friends: request.from._id },
    }).select('inGameName pic _id name role')

    if (receiver.role === 'guest' || sender.role === 'guest') {
      return res
        .status(400)
        .json({ message: 'Guest users cannot accept friend requests' })
    }

    let chat = await Chat.findOne({
      users: { $all: [sender._id, receiver._id] },
    })
    // console.log(friend);
    if (!chat) {
      //create chat
      chat = new Chat({
        chatName: 'sender',
        users: [sender._id, receiver._id],
        status: 'accepted',
      })
      await chat.save()
    }
    chat.status = 'accepted'
    await chat.save()
    const currentDate = new Date().toISOString().split('T')[0]
    logActivity({
      userInGameName: sender.inGameName,
      type: activityTypes.WISE_WEB_EXPANSION.type,
      date: currentDate,
    })
    const noteMessageForSender = new NoteMessage({
      userId: sender._id,
      title: 'Friend request accepted',
      content: `You are now friends with ${receiver.name}`,
      messageType: 'xpAward',
      xpAwarded: getXpForActivity({
        activityType: 'Wise Web expansion',
      }),
      xpSource: 'Wise Web expansion',
      actions: [{ actionType: 'VIEW_EXPERIENCE' }],
    })
    await noteMessageForSender.save()
    logActivity({
      userInGameName: receiver.inGameName,
      type: activityTypes.WISE_WEB_EXPANSION.type,
      date: currentDate,
    })
    const noteMessageForReceiver = new NoteMessage({
      userId: receiver._id,
      title: 'Friend request accepted',
      content: `You are now friends with ${sender.name}`,
      messageType: 'xpAward',
      xpAwarded: getXpForActivity({
        activityType: 'Wise Web expansion',
      }),
      xpSource: 'Wise Web expansion',
      actions: [{ actionType: 'VIEW_EXPERIENCE' }],
    })
    await noteMessageForReceiver.save()
    await sendNotification({
      title: `Friend request accepted by ${receiver.name}`,
      icon: receiver.pic,
      url: `/home?wiseweb=true`,
      userId: sender._id.toString(),
    })

    res.status(200).json({ message: 'Friend request accepted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     Reject friend request
//@route           POST /api/friends/reject-request
//@access          Protected
const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body

  try {
    const request = await FriendRequest.findById(requestId)
    if (!request) return res.status(404).json({ message: 'Request not found' })

    request.status = 'rejected'
    await request.save()

    res.status(200).json({ message: 'Friend request rejected' })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     get list of friend requests
//@route           GET /api/friends/get-requests
//@access          Protected
const getRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId).populate({
      path: 'receivedRequests',
      match: { status: 'pending' },
      populate: {
        path: 'from',
        select: 'name inGameName IQ_score pic',
      },
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.role === 'guest') {
      return res
        .status(400)
        .json({ message: 'Guest users cannot send or receive friend requests' })
    }
    const formattedRequests = user.receivedRequests.map(request => ({
      _id: request._id,
      from: {
        _id: request.from._id,
        name: request.from.name,
        inGameName: request.from.inGameName,
        IQ_score: request.from.IQ_score,
        pic: request.from.pic,
      },
      status: request.status,
      createdAt: request.createdAt,
    }))

    res.status(200).json(formattedRequests)
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     get list of friend
//@route           GET /api/friends/
//@access          Protected
const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId).populate({
      path: 'friends',
      select: 'name inGameName IQ_score pic isOnline',
    })
    let userFriends = []
    for (let friend of user.friends) {
      let chat = await Chat.findOne({
        users: { $all: [userId, friend._id] },
      }).select('_id')
      // console.log(friend);
      if (!chat) {
        //create chat
        chat = new Chat({
          chatName: 'sender',
          users: [userId, friend._id],
          status: 'accepted',
        })
        await chat.save()
      }

      userFriends.push({ ...friend._doc, chatId: chat._id.toString() })
    }
    // console.log(userFriends);
    res.status(200).json(userFriends)
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     check request status and clean up old rejected requests
//@route           POST /api/friends/check-request-status
//@access          Protected
const checkRequestStatus = asyncHandler(async (req, res) => {
  const { fromId, toId } = req.body

  try {
    // Find the most recent request between these users
    const request = await FriendRequest.findOne({
      from: fromId,
      to: toId,
    }).sort({ createdAt: -1 })

    if (request) {
      if (request.status === 'pending' || request.status === 'accepted') {
        return res.status(200).json({
          message: 'Request already sent',
          status: request.status,
        })
      } else if (request.status === 'rejected') {
        const rejectionDate = new Date(request.createdAt)
        const currentDate = new Date()
        const diffDays = Math.floor(
          (currentDate - rejectionDate) / (1000 * 60 * 60 * 24),
        )

        if (diffDays >= 10) {
          // Delete the rejected request if it's older than 10 days
          await FriendRequest.findByIdAndDelete(request._id)

          // Remove references from users
          await User.updateMany(
            {
              $or: [
                { sentRequests: request._id },
                { receivedRequests: request._id },
              ],
            },
            {
              $pull: {
                sentRequests: request._id,
                receivedRequests: request._id,
              },
            },
          )

          return res
            .status(200)
            .json({ message: 'No request found', status: 'none' })
        } else {
          return res.status(200).json({
            message: 'Request was rejected recently',
            status: 'rejected',
            daysUntilNewRequest: 10 - diffDays,
          })
        }
      }
    }

    res.status(200).json({ message: 'No request found', status: 'none' })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})
//@description     check if user can send request
//@route           POST /api/friends/can-send-request
//@access          Protected
const canSendRequest = asyncHandler(async (req, res) => {
  const { fromId, toId } = req.body

  try {
    const request = await FriendRequest.findOne({
      from: fromId,
      to: toId,
    }).sort({ createdAt: -1 })

    if (!request) {
      return res.status(200).json({ message: 'Can send request' })
    }

    if (request.status === 'rejected') {
      const rejectionDate = new Date(request.createdAt)
      const currentDate = new Date()
      const diffDays = Math.floor(
        (currentDate - rejectionDate) / (1000 * 60 * 60 * 24),
      )

      if (diffDays >= 10) {
        // Delete the rejected request if it's 10 days old or older
        await FriendRequest.findByIdAndDelete(request._id)

        // Remove references from users
        await User.updateMany(
          {
            $or: [
              { sentRequests: request._id },
              { receivedRequests: request._id },
            ],
          },
          {
            $pull: { sentRequests: request._id, receivedRequests: request._id },
          },
        )

        return res.status(200).json({ message: 'Can send request' })
      } else {
        return res.status(201).json({
          message: 'Cannot send another request within 10 days of rejection',
          daysUntilNewRequest: 10 - diffDays,
        })
      }
    } else if (request.status === 'pending') {
      return res.status(201).json({ message: 'Request already sent' })
    } else if (request.status === 'accepted') {
      // check if they are already friends or not
      const user1 = await User.findById(fromId).select('friends')
      const user2 = await User.findById(toId).select('friends')

      const areFriends =
        user1.friends.includes(toId) && user2.friends.includes(fromId)

      if (!areFriends) await FriendRequest.findByIdAndDelete(request._id)

      return res.status(201).json({
        message: 'Already friends',
        friend: areFriends,
        allowed: true,
      })
    }

    res.status(200).json({ message: 'Can send request' })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     Sever ties (unfriend) with a user
//@route           POST /api/friends/sever-ties
//@access          Protected
const severTies = asyncHandler(async (req, res) => {
  const { friendId } = req.body
  const userId = req.user._id

  try {
    // Remove friend from user's friends list
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    })

    // Remove user from friend's friends list
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    })

    // Find and remove the chat between the two users
    await Chat.findOneAndDelete({
      users: { $all: [userId, friendId] },
    })

    res.status(200).json({ message: 'Ties severed successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

// @description     Get count of unread friend requests
// @route           GET /api/friend/unread-requests-count
// @access          Protected
const getUnreadRequestsCount = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const count = await FriendRequest.countDocuments({
      to: userId,
      status: 'pending',
      unread: true,
    })

    res.status(200).json({ unreadCount: count })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

// @description     Mark all friend requests as read
// @route           POST /api/friend/request-mark-as-read
// @access          Protected
const markRequestsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const result = await FriendRequest.updateMany(
      { to: userId, status: 'pending', unread: true },
      { $set: { unread: false } },
    )

    res.status(200).json({
      message: 'Friend requests marked as read',
      modifiedCount: result.nModified,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})
module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getRequests,
  getFriends,
  checkRequestStatus,
  canSendRequest,
  severTies,
  getUnreadRequestsCount,
  markRequestsAsRead,
}
