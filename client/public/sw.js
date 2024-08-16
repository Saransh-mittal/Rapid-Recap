const VERSION = 'v6' // Increment this version number
const RapidRecapLogo = './images/rrlogo.webp'
const RapidRecapBadge = './images/rrlogo_badge.png'

self.addEventListener('install', event => {
  console.log('Service Worker installing - Version', VERSION)
  event.waitUntil(self.skipWaiting()) // Activate worker immediately
})

self.addEventListener('activate', event => {
  console.log('Service Worker activating - Version', VERSION)
  event.waitUntil(clients.claim()) // Take control of all open pages
})

self.addEventListener('push', event => {
  const data = event.data.json()

  if (data.messageId && data.title === 'Message Deleted') {
    // This is a message deletion notification
    // Remove the previous notification for this message
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(notification => {
        if (
          notification.data &&
          notification.data.messageId === data.messageId
        ) {
          notification.close()
        }
      })
    })
  }
  const notificationOptions = {
    body: data.body,
    icon: data.icon || RapidRecapLogo,
    image: data.image || null,
    data: { url: data.url },
    badge: RapidRecapBadge,
    vibrate: [200, 100, 200],
    renotify: true,
  }

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions),
  )
})

self.addEventListener('notificationclick', function (event) {
  const notificationData = event.notification.data

  if (notificationData && notificationData.url) {
    event.waitUntil(clients.openWindow(notificationData.url))
  }
  event.notification.close()
})
