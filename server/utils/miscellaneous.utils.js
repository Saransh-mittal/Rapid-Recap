const { redis } = require('../redis')
const CryptoJS = require('crypto-js')
const moment = require('moment')
const User = require('../model/userSchema')

function binarySearch(arr, target) {
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) {
      return mid
    } else if (arr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return -1 // Target not found
}

function binarySearchForLeftRange(arr, lowerbound) {
  if (arr[arr.length - 1] < lowerbound) return -1
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] >= lowerbound) {
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  return left // Target not found
}

function binarySearchForRightRange(arr, upperbound) {
  if (arr[0] > upperbound) return -1
  let left = 0
  let right = arr.length - 1

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] <= upperbound) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  return right // Target not found
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

function formatDate(datetime) {
  // Extract the date part
  const datePattern = /^\d{4}-\d{2}-\d{2}/
  const match = datetime.match(datePattern)
  if (!match) return null

  // Parse the extracted date part
  const [year, month, day] = match[0].split('-')

  // Define month abbreviations
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Format the date into 'dd mmm yyyy'
  const formattedDate = `${day} ${months[parseInt(month, 10) - 1]} ${year}`
  return formattedDate
}

function averageReadTime(text) {
  // Remove the article if it has no text
  if (!text || text.length === 0 || text === '') {
    return null
  }

  // Calculate reading time in minutes
  const wordsPerMinute = 100
  const plainText = text.replace(/<[^>]+>/g, '') // Remove HTML tags
  const wordCount = plainText.split(/\s+/).length
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute)
  return readingTimeMinutes
}

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const checkUserOnlineStatus = async userId => {
  const lastHeartbeat = await redis.get(`user:${userId}:lastHeartbeat`)
  const isOnline = !!lastHeartbeat

  return isOnline
}

async function checkUserBatch(userIds) {
  const pipeline = redis.pipeline()
  userIds.forEach(id => pipeline.get(`user:${id}:lastHeartbeat`))
  const results = await pipeline.exec()

  const offlineUsers = []

  results.forEach(([err, lastHeartbeat], index) => {
    if (err) {
      console.error(`Error checking heartbeat for user ${userIds[index]}:`, err)
      return
    }
    if (!lastHeartbeat) {
      offlineUsers.push(userIds[index])
    }
  })

  return offlineUsers
}

const isEncrypted = str => {
  try {
    return CryptoJS.AES.decrypt(str, process.env.ENCRYPTION_KEY).toString(
      CryptoJS.enc.Utf8,
    )
  } catch (e) {
    return false
  }
}

// Function to format date, with an option to include time, adjust days, and accept a date instance
function formatDateTimeAccordindToDB(
  dateInstance = new Date(),
  includeTime = true,
  daysBack = 0,
) {
  const date = moment(dateInstance).subtract(daysBack, 'days') // Use the provided date or current date

  if (includeTime) {
    return date.format('YYYY-MM-DD HH:mm:ss')
  } else {
    return date.format('YYYY-MM-DD')
  }
}
function toISOString(formattedDateTime) {
  // Parse the formatted date-time string using Moment.js
  const date = moment(formattedDateTime, 'YYYY-MM-DD HH:mm:ss')

  // Return the ISO string
  return date.toISOString()
}

async function isGuestUser(userId) {
  const user = await User.findById(userId).select('role')
  return user.role === 'guest'
}

module.exports = {
  binarySearch,
  binarySearchForLeftRange,
  binarySearchForRightRange,
  isValidEmail,
  formatDate,
  averageReadTime,
  shuffleArray,
  checkUserOnlineStatus,
  checkUserBatch,
  isEncrypted,
  formatDateTimeAccordindToDB,
  toISOString,
  isGuestUser,
}
