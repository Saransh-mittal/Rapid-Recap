const asyncHandler = require('express-async-handler')
const FriendRequest = require('../model/friendRequestSchema')
const User = require('../model/userSchema')
const { sendNotification } = require('../services/notificationService')
const { activityTypes, getXpForActivity } = require('../data/activityTypes')
const { logActivity } = require('../utils/activity.utils')
const i18n = require('i18next')
const globalEmitter = require('../eventEmitter')

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
    }).select('name pic role inGameName')
    const receiver = await User.findByIdAndUpdate(toId, {
      $push: { receivedRequests: newRequest._id },
    }).select('inGameName role userLanguage name pic')

    if (receiver.role === 'guest' || sender.role === 'guest') {
      return res
        .status(400)
        .json({ message: 'Guest users cannot send or receive friend requests' })
    }

    // Emit socket event for real-time friend request notification
    globalEmitter.emit('friends:requestSent', {
      fromUser: {
        _id: fromId,
        name: sender.name,
        inGameName: sender.inGameName,
        pic: sender.pic,
      },
      toUser: {
        _id: toId,
        name: receiver.name,
        inGameName: receiver.inGameName,
        pic: receiver.pic,
      },
      requestId: newRequest._id,
    })

    const localizedI18n = i18n.cloneInstance({ initImmediate: false })
    await localizedI18n.changeLanguage(receiver.userLanguage)
    const t = (key, options) =>
      localizedI18n.t(key, { ns: 'friendsController', ...options })

    await sendNotification({
      title: t('requestFrom', { name: sender.name }),
      icon: sender.pic,
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

    // check if already friends
    const user1 = await User.findById(request.from._id).select('friends')
    const user = await User.findById(request.to._id).select('friends')

    const areFriends = user1.friends.includes(request.to._id)
    if (areFriends) {
      return res.status(200).json({ message: 'Already friends' })
    }

    const sender = await User.findByIdAndUpdate(request.from._id, {
      $push: { friends: request.to._id },
    }).select('inGameName _id role userLanguage name pic isOnline')
    const receiver = await User.findByIdAndUpdate(request.to._id, {
      $push: { friends: request.from._id },
    }).select('inGameName pic _id name role userLanguage isOnline')

    if (receiver.role === 'guest' || sender.role === 'guest') {
      return res
        .status(400)
        .json({ message: 'Guest users cannot accept friend requests' })
    }

    // Emit socket event for real-time friend request acceptance
    globalEmitter.emit('friends:requestAccepted', {
      fromUser: {
        _id: sender._id,
        name: sender.name,
        inGameName: sender.inGameName,
        pic: sender.pic,
        isOnline: sender.isOnline,
      },
      toUser: {
        _id: receiver._id,
        name: receiver.name,
        inGameName: receiver.inGameName,
        pic: receiver.pic,
        isOnline: receiver.isOnline,
      },
      requestId: request._id,
    })

    const currentDate = new Date().toISOString().split('T')[0]
    logActivity({
      userInGameName: sender.inGameName,
      type: activityTypes.WISE_WEB_EXPANSION.type,
      date: currentDate,
    })
    const localizedI18n1 = i18n.cloneInstance({ initImmediate: false })
    await localizedI18n1.changeLanguage(receiver.userLanguage)
    let t = (key, options) =>
      localizedI18n1.t(key, { ns: 'friendsController', ...options })
    logActivity({
      userInGameName: receiver.inGameName,
      type: activityTypes.WISE_WEB_EXPANSION.type,
      date: currentDate,
    })
    const localizedI18n2 = i18n.cloneInstance({ initImmediate: false })
    await localizedI18n2.changeLanguage(sender.userLanguage)
    t = (key, options) =>
      localizedI18n2.t(key, { ns: 'friendsController', ...options })
    const localizedI18n3 = i18n.cloneInstance({ initImmediate: false })
    await localizedI18n3.changeLanguage(receiver.userLanguage)
    t = (key, options) =>
      localizedI18n2.t(key, { ns: 'friendsController', ...options })
    await sendNotification({
      title: t('requestAcceptedBy', { name: receiver.name }),
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
    const request = await FriendRequest.findById(requestId).populate('from to')
    if (!request) return res.status(404).json({ message: 'Request not found' })

    request.status = 'rejected'
    await request.save()

    // Emit socket event for real-time friend request rejection
    globalEmitter.emit('friends:requestRejected', {
      fromUser: {
        _id: request.from._id,
        name: request.from.name,
        inGameName: request.from.inGameName,
        pic: request.from.pic,
      },
      toUser: {
        _id: request.to._id,
        name: request.to.name,
        inGameName: request.to.inGameName,
        pic: request.to.pic,
      },
      requestId: request._id,
    })

    res.status(200).json({ message: 'Friend request rejected' })
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     get list of friend requests with QuickClash stats
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
        select:
          'name inGameName pic quickClashTrophies quickClashStats level isOnline lastLogin createdAt',
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
        pic: request.from.pic,
        quickClashTrophies: request.from.quickClashTrophies || 1000,
        quickClashStats: {
          currentWinStreak: request.from.quickClashStats?.currentWinStreak || 0,
          streakProtectionAvailable:
            request.from.quickClashStats?.streakProtectionAvailable || false,
          peakTrophies:
            request.from.quickClashStats?.peakTrophies ||
            request.from.quickClashTrophies ||
            1000,
        },
        level: request.from.level || 1,
        isOnline: request.from.isOnline || false,
        lastLogin: request.from.lastLogin,
        createdAt: request.from.createdAt,
      },
      status: request.status,
      createdAt: request.createdAt,
      unread: request.unread,
    }))

    res.status(200).json(formattedRequests)
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     get user's friends list with QuickClash stats
//@route           GET /api/friends/
//@access          Protected
const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId).populate({
      path: 'friends',
      select:
        'name inGameName pic quickClashTrophies quickClashStats level isOnline lastLogin createdAt',
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'guest') {
      return res
        .status(400)
        .json({ message: 'Guest users cannot have friends' })
    }

    // Format friends data with QuickClash information
    const formattedFriends = user.friends.map(friend => ({
      _id: friend._id,
      name: friend.name,
      inGameName: friend.inGameName,
      pic: friend.pic,
      quickClashTrophies: friend.quickClashTrophies || 1000,
      quickClashStats: {
        currentWinStreak: friend.quickClashStats?.currentWinStreak || 0,
        streakProtectionAvailable:
          friend.quickClashStats?.streakProtectionAvailable || false,
        peakTrophies:
          friend.quickClashStats?.peakTrophies ||
          friend.quickClashTrophies ||
          1000,
      },
      level: friend.level || 1,
      isOnline: friend.isOnline || false,
      lastLogin: friend.lastLogin,
      createdAt: friend.createdAt,
      relationshipStatus: 'friend', // All these users are confirmed friends
    }))

    // Sort friends: online first, then by trophy count
    formattedFriends.sort((a, b) => {
      // Online friends first
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1

      // Then sort by trophy count (highest first)
      return (b.quickClashTrophies || 1000) - (a.quickClashTrophies || 1000)
    })

    res.status(200).json(formattedFriends)
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
    const removedFriend = await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    }).select('name inGameName pic')

    // Emit socket event for real-time friend removal
    globalEmitter.emit('friends:friendRemoved', {
      userId: userId.toString(),
      removedFriendId: friendId.toString(),
      removedFriend: {
        _id: friendId,
        name: removedFriend.name,
        inGameName: removedFriend.inGameName,
        pic: removedFriend.pic,
      },
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

//@description     search users with QuickClash stats
//@route           GET /api/friends/search?q=searchTerm
//@access          Protected
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query
  const userId = req.user._id

  if (!q || q.trim().length < 2) {
    return res
      .status(400)
      .json({ message: 'Search query must be at least 2 characters long' })
  }

  try {
    // Check if user is guest
    const currentUser = await User.findById(userId)
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (currentUser.role === 'guest') {
      return res
        .status(400)
        .json({ message: 'Guest users cannot search for friends' })
    }

    const searchRegex = new RegExp(q.trim(), 'i')

    // Find users matching search criteria (excluding current user)
    const users = await User.find({
      _id: { $ne: userId },
      role: { $ne: 'guest' }, // Exclude guest users
      $or: [{ name: searchRegex }, { inGameName: searchRegex }],
    })
      .select(
        'name inGameName pic quickClashTrophies quickClashStats level isOnline lastLogin createdAt',
      )
      .limit(20) // Limit results for performance

    // Get current user's friends and pending requests
    const userWithRelations = await User.findById(userId)
      .populate('friends', '_id')
      .populate('sentRequests', 'to status')
      .populate('receivedRequests', 'from status')

    const friendIds = new Set(
      userWithRelations.friends.map(friend => friend._id.toString()),
    )
    const sentRequestUserIds = new Set(
      userWithRelations.sentRequests
        .filter(req => req.status === 'pending')
        .map(req => req.to.toString()),
    )
    const receivedRequestUserIds = new Set(
      userWithRelations.receivedRequests
        .filter(req => req.status === 'pending')
        .map(req => req.from.toString()),
    )

    // Format results with relationship status and QuickClash data
    const formattedUsers = users.map(user => {
      let relationshipStatus = 'none'

      if (friendIds.has(user._id.toString())) {
        relationshipStatus = 'friend'
      } else if (sentRequestUserIds.has(user._id.toString())) {
        relationshipStatus = 'pending_sent'
      } else if (receivedRequestUserIds.has(user._id.toString())) {
        relationshipStatus = 'pending_received'
      }

      return {
        _id: user._id,
        name: user.name,
        inGameName: user.inGameName,
        pic: user.pic,
        quickClashTrophies: user.quickClashTrophies || 1000,
        quickClashStats: {
          currentWinStreak: user.quickClashStats?.currentWinStreak || 0,
          streakProtectionAvailable:
            user.quickClashStats?.streakProtectionAvailable || false,
          peakTrophies:
            user.quickClashStats?.peakTrophies ||
            user.quickClashTrophies ||
            1000,
        },
        level: user.level || 1,
        isOnline: user.isOnline || false,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        relationshipStatus,
      }
    })

    // Sort by relevance: online users first, then by trophy count
    formattedUsers.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1
      if (!a.isOnline && b.isOnline) return 1
      return (b.quickClashTrophies || 1000) - (a.quickClashTrophies || 1000)
    })

    res.status(200).json(formattedUsers)
  } catch (error) {
    res.status(500).json({ error: error.message })
    throw new Error(error.message)
  }
})

//@description     Get enhanced friends list with online status and trophies
//@route           GET /api/friends/enhanced
//@access          Protected
const getEnhancedFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId).populate({
      path: 'friends',
      select:
        'name inGameName IQ_score pic isOnline lastLogin quickClashTrophies',
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role === 'guest') {
      return res.status(400).json({
        message: 'Guest users cannot access friends list',
      })
    }

    // Enhanced friends data with additional info
    const enhancedFriends = user.friends.map(friend => ({
      _id: friend._id,
      name: friend.name,
      inGameName: friend.inGameName,
      IQ_score: friend.IQ_score,
      pic: friend.pic,
      isOnline: friend.isOnline,
      lastLogin: friend.lastLogin,
      quickClashTrophies: friend.quickClashTrophies || 1000,
      // Calculate relative activity
      lastSeen: friend.isOnline
        ? 'Online'
        : new Date() - new Date(friend.lastLogin) < 24 * 60 * 60 * 1000
        ? 'Recently'
        : 'Offline',
    }))

    res.status(200).json(enhancedFriends)
  } catch (error) {
    console.error('Get enhanced friends error:', error)
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
  searchUsers,
  getEnhancedFriends,
}
