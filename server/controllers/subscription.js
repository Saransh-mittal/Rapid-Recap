const Subscription = require('../model/subscriptionSchema')
const { sendNotification } = require('../services/notificationService')
const i18n = require('../i18n')
const User = require('../model/userSchema')

const subscribe = async (req, res) => {
  const userId = req.user._id

  try {
    const user = await User.findById(userId)
    i18n.changeLanguage(user.userLanguage)

    const { endpoint, keys } = req.body

    let subscription = await Subscription.findOne({ userId, endpoint })

    if (subscription) {
      subscription.endpoint = endpoint
      subscription.keys = keys
    } else {
      subscription = new Subscription({
        userId,
        endpoint,
        keys,
      })
    }

    await subscription.save()
    res.status(201).json({ message: i18n.t('savedSuccess') })
  } catch (error) {
    console.error('Subscription save error:', error)
    res.status(500).json({ error: i18n.t('saveFailed') })
  }
}

const sendNotify = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    i18n.changeLanguage(user.userLanguage)

    const title = i18n.t('newContentAlert')
    const body = i18n.t('exploreArticles')
    const url = 'http://localhost:5173/'

    sendNotification({ title, body, url })
    res.status(200).json({ message: i18n.t('notifSentSuccess') })
  } catch (error) {
    res.status(500).json({ message: i18n.t('notifSendFailed') })
    console.error(error)
  }
}

const checkSubscription = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    i18n.changeLanguage(user.userLanguage)

    const { endpoint } = req.body
    if (!endpoint) {
      return res.status(400).json({ error: i18n.t('endpointRequired') })
    }

    const subscription = await Subscription.findOne({ userId, endpoint })
    if (subscription) {
      res.json({ isSubscribed: true })
    } else {
      const anySubscription = await Subscription.findOne({ userId })
      if (anySubscription) {
        res.json({ isSubscribed: false, hasOtherSubscription: true })
      } else {
        res.json({ isSubscribed: false, hasOtherSubscription: false })
      }
    }
  } catch (error) {
    console.error('Subscription check error:', error)
    res.status(500).json({ error: i18n.t('checkFailed') })
  }
}

const deleteSubscription = async (req, res) => {
  try {
    const { endpoint } = req.body
    const user = await User.findById(req.user._id)
    i18n.changeLanguage(user.userLanguage)

    if (!endpoint) {
      return res.status(400).json({ error: i18n.t('endpointRequired') })
    }

    const deletedSubscription = await Subscription.findOneAndDelete({
      endpoint,
    })

    if (!deletedSubscription) {
      return res.status(404).json({ error: i18n.t('notFound') })
    }

    res.status(200).json({ message: i18n.t('deleteSuccess') })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    res.status(500).json({ error: i18n.t('deleteFailed') })
  }
}

module.exports = {
  subscribe,
  sendNotify,
  checkSubscription,
  deleteSubscription,
}
