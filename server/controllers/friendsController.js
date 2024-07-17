const asyncHandler = require("express-async-handler");
const FriendRequest = require("../model/friendRequestSchema");
const User = require("../model/userSchema");

//@description     Send friend request
//@route           POST /api/friends/send-request
//@access          Protected
const sendRequest = asyncHandler(async (req, res) => {
  const { fromId, toId } = req.body;

  try {
    const newRequest = new FriendRequest({ from: fromId, to: toId });
    await newRequest.save();

    await User.findByIdAndUpdate(fromId, {
      $push: { sentRequests: newRequest._id },
    });
    await User.findByIdAndUpdate(toId, {
      $push: { receivedRequests: newRequest._id },
    });

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw new Error(error.message);
  }
});

//@description     Accept friend request
//@route           POST /api/friends/accept-request
//@access          Protected
const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await FriendRequest.findById(requestId).populate("from to");
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.from._id, {
      $push: { friends: request.to._id },
    });
    await User.findByIdAndUpdate(request.to._id, {
      $push: { friends: request.from._id },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw new Error(error.message);
  }
});

//@description     Reject friend request
//@route           POST /api/friends/reject-request
//@access          Protected
const rejectRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await FriendRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw new Error(error.message);
  }
});

//@description     get list of friend requests
//@route           GET /api/friends/get-requests
//@access          Protected
const getRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate({
      path: "receivedRequests",
      match: { status: "pending" },
      populate: {
        path: "from",
        select: "name inGameName IQ_score pic",
      },
    });

    const formattedRequests = user.receivedRequests.map((request) => ({
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
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw new Error(error.message);
  }
});

//@description     get list of friend
//@route           GET /api/friends/
//@access          Protected
const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate({
      path: "friends",
      select: "name inGameName IQ_score pic",
    });
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw new Error(error.message);
  }
});

//@description     check request status
//@route           POST /api/friends/check-request-status
//@access          Protected
const checkRequestStatus = asyncHandler(async (req, res) => {
  const { fromId, toId } = req.body;

  try {
    const request = await FriendRequest.findOne({
      from: fromId,
      to: toId,
      status: { $in: ["pending", "accepted"] },
    });

    if (request) {
      return res
        .status(200)
        .json({ message: "Request already sent", status: request.status });
    }

    res.status(200).json({ message: "No request found", status: "none" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw new Error(error.message);
  }
});

//@description     check if user can send request
//@route           POST /api/friends/can-send-request
//@access          Protected
const canSendRequest = asyncHandler(async (req, res) => {
  const { fromId, toId } = req.body;

  try {
    const request = await FriendRequest.findOne({
      from: fromId,
      to: toId,
    }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(200).json({ message: "Can send request" });
    }

    if (request.status === "rejected") {
      const rejectionDate = new Date(request.createdAt);
      const currentDate = new Date();
      const diffDays = Math.floor(
        (currentDate - rejectionDate) / (1000 * 60 * 60 * 24)
      );

      if (diffDays < 10) {
        return res.status(201).json({
          message: "Cannot send another request within 10 days of rejection",
        });
      }
    } else if (request.status === "pending") {
      return res.status(201).json({ message: "Request already sent" });
    } else if (request.status === "accepted") {
      return res.status(201).json({ message: "Already friends", friend: true });
    }

    res.status(200).json({ message: "Can send request" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    throw new Error(error.message);
  }
});
module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getRequests,
  getFriends,
  checkRequestStatus,
  canSendRequest,
};
