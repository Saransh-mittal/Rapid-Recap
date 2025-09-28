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
  const batchId = Math.random().toString(36).substr(2, 9) // Random ID for this batch
  console.log(
    `🔍 [REDIS_BATCH_${batchId}] Starting Redis batch check for ${userIds.length} users`,
  )

  try {
    // Create Redis pipeline
    const pipelineStartTime = Date.now()
    const pipeline = redis.pipeline()

    // Add commands to pipeline
    userIds.forEach((id, index) => {
      pipeline.get(`user:${id}:lastHeartbeat`)
      if (index < 5) {
        // Log first 5 keys being checked
        console.log(
          `🔑 [REDIS_KEY] Checking: user:${id
            .toString()
            .substring(0, 8)}...:lastHeartbeat`,
        )
      } else if (index === 5 && userIds.length > 5) {
        console.log(`🔑 [REDIS_KEY] ... and ${userIds.length - 5} more keys`)
      }
    })

    console.log(
      `📤 [REDIS_PIPELINE_${batchId}] Executing pipeline with ${userIds.length} GET commands`,
    )

    // Execute pipeline
    const results = await pipeline.exec()
    const pipelineDuration = Date.now() - pipelineStartTime

    console.log(
      `📥 [REDIS_PIPELINE_${batchId}] Pipeline executed in ${pipelineDuration}ms, processing results...`,
    )

    if (!results) {
      console.error(
        `❌ [REDIS_PIPELINE_${batchId}] Pipeline returned null results`,
      )
      return []
    }

    const offlineUsers = []
    let validHeartbeats = 0
    let errorCount = 0

    // Process results
    results.forEach(([err, lastHeartbeat], index) => {
      const userId = userIds[index]

      if (err) {
        errorCount++
        console.error(
          `❌ [REDIS_ERROR_${batchId}] Error checking heartbeat for user ${userId
            .toString()
            .substring(0, 8)}...:`,
          err.message,
        )
        return
      }

      if (!lastHeartbeat) {
        offlineUsers.push(userId)
      } else {
        validHeartbeats++
        // Parse heartbeat timestamp to check staleness
        const heartbeatTime = parseInt(lastHeartbeat)
        const timeDiff = Date.now() - heartbeatTime

        if (index < 3) {
          // Log details for first 3 valid heartbeats
          console.log(
            `💓 [HEARTBEAT_${batchId}] User ${userId
              .toString()
              .substring(0, 8)}... last seen ${Math.floor(
              timeDiff / 1000,
            )}s ago`,
          )
        }
      }
    })

    console.log(
      `📋 [REDIS_RESULTS_${batchId}] Processed ${results.length} results:`,
    )
    console.log(`   ✅ Valid heartbeats: ${validHeartbeats}`)
    console.log(`   📴 Offline users: ${offlineUsers.length}`)
    console.log(`   ❌ Errors: ${errorCount}`)

    // Additional Redis health check
    if (errorCount > 0) {
      try {
        const redisInfo = await redis.info('server')
        const uptime = redisInfo.match(/uptime_in_seconds:(\d+)/)?.[1]
        console.log(
          `ℹ️  [REDIS_HEALTH_${batchId}] Redis uptime: ${
            uptime ? Math.floor(uptime / 3600) + ' hours' : 'unknown'
          }`,
        )
      } catch (healthError) {
        console.error(
          `❌ [REDIS_HEALTH_${batchId}] Could not get Redis health info:`,
          healthError.message,
        )
      }
    }

    return offlineUsers
  } catch (error) {
    console.error(
      `❌ [REDIS_BATCH_${batchId}] Critical error in Redis batch operation:`,
      {
        message: error.message,
        userCount: userIds.length,
        redisReady: redis.status,
        timestamp: new Date().toISOString(),
      },
    )

    // Return empty array on error to avoid breaking the heartbeat check
    return []
  }
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

function formatRemainingTime(milliseconds) {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000))
  const hours = Math.floor(
    (milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
  )
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000))

  let timeString = ''
  if (days > 0) timeString += `${days} day `
  if (hours > 0) timeString += `${hours} hrs `
  if (minutes > 0) timeString += `${minutes} min`

  return timeString.trim()
}

function convertISTtoUTCCron(hour, minute, daysOfWeek) {
  // Create a moment object for the current date at the specified IST time
  const istTime = moment.tz({ hour, minute }, 'Asia/Kolkata')

  // Convert to UTC
  const utcTime = istTime.clone().tz('UTC')

  // Extract UTC hour and minute
  const utcHour = utcTime.hour()
  const utcMinute = utcTime.minute()

  // Create the cron pattern
  console.log(`${utcMinute} ${utcHour} * * ${daysOfWeek}`)
  return `${utcMinute} ${utcHour} * * ${daysOfWeek}`
}

const getFormattedImage = imgURL => {
  if (!imgURL) return null
  if (Array.isArray(imgURL)) {
    return imgURL.length > 0 ? imgURL[0] : null
  }
  return imgURL
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
  formatRemainingTime,
  convertISTtoUTCCron,
  getFormattedImage,
}
