const Subscription = require('../model/subscriptionSchema')
const { sendNotification } = require('../services/notificationService')

const subscribe = async (req, res) => {
  const userId = req.user._id

  try {
    const { endpoint, keys } = req.body

    // Check if subscription already exists
    let subscription = await Subscription.findOne({ userId, endpoint })

    if (subscription) {
      // Update existing subscription
      subscription.endpoint = endpoint
      subscription.keys = keys
    } else {
      // Create new subscription
      subscription = new Subscription({
        userId,
        endpoint,
        keys,
      })
    }

    await subscription.save()
    res.status(201).json({ message: 'Subscription saved successfully' })
  } catch (error) {
    console.error('Subscription save error:', error)
    res.status(500).json({ error: 'Failed to save subscription' })
  }
}

const sendNotify = async (req, res) => {
  try {
    const title = '📢 New Content Alert! 📰'
    const body =
      'Exciting news just in! Explore our latest articles and breaking news updates to stay ahead of the curve. Tap to discover now!'
    const url = 'http://localhost:5173/'
    sendNotification({ title, body, url })
    res.status(200).json({ message: 'Notifications sent successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notifications' })
    console.error(error)
  }
}

const checkSubscription = async (req, res) => {
  try {
    const userId = req.user._id
    const { endpoint } = req.body // Assuming the client sends the current endpoint
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' })
    }

    const subscription = await Subscription.findOne({ userId, endpoint })
    if (subscription) {
      res.json({ isSubscribed: true })
    } else {
      // Check if user has any subscription, but with a different endpoint
      const anySubscription = await Subscription.findOne({ userId })
      if (anySubscription) {
        // User has a subscription, but for a different endpoint
        res.json({ isSubscribed: false, hasOtherSubscription: true })
      } else {
        // User has no subscription at all
        res.json({ isSubscribed: false, hasOtherSubscription: false })
      }
    }
  } catch (error) {
    console.error('Subscription check error:', error)
    res.status(500).json({ error: 'Failed to check subscription' })
  }
}

const deleteSubscription = async (req, res) => {
  try {
    const { endpoint } = req.body

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' })
    }

    // Assuming you have a Subscription model
    const deletedSubscription = await Subscription.findOneAndDelete({
      endpoint,
    })

    if (!deletedSubscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    res.status(200).json({ message: 'Subscription deleted successfully' })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
module.exports = {
  subscribe,
  sendNotify,
  checkSubscription,
  deleteSubscription,
}
