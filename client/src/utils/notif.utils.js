export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function sendSubscriptionToBackend(subscription) {
  try {
    const response = await fetch('/api/subs/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })

    if (!response.ok) {
      throw new Error('Failed to send subscription to backend')
    }
    return response.json()
  } catch (error) {
    console.error('Backend subscription error:', error)
  }
}

export const isSupported =
  'Notification' in window &&
  'serviceWorker' in navigator &&
  'PushManager' in window
