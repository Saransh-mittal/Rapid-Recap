// src/hooks/useNotification.js
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  checkNotificationStatus,
  enableNotifications,
  isSubscribedChecker,
  resetStatus,
} from '../redux/notificationSlice'

const useNotification = () => {
  const dispatch = useDispatch()
  const { supported, loading, error, showInstructions, isSubscribed } =
    useSelector(state => state.notifications)

  const showWindowsAndroidInstructions = () => {
    alert(
      'It looks like notifications are currently blocked. To enable notifications, please follow these steps:\n\n' +
        "1. Open this URL in Google Chrome, as it's best supported for notifications.\n" +
        '2. Click on the padlock icon located on the left of the address bar.\n' +
        "3. In the dropdown menu, click on 'Site settings.'\n" +
        "4. Find 'Notifications' and set it to 'Allow.'\n" +
        "5. On Android, ensure that browser notifications are also enabled in your device's application settings:\n" +
        "   - Go to your phone's Settings -> Apps -> Chrome -> Notifications -> Make sure 'Show notifications' is enabled.",
    )
  }

  const showMacIOSInstructions = () => {
    alert(
      'It looks like notifications are currently blocked. To enable notifications, please follow these steps:\n\n' +
        "1. Open this URL in Google Chrome, as it's best supported for notifications.\n" +
        '2. Click on the padlock icon located on the left of the address bar.\n' +
        "3. Click on 'Site settings' in the dropdown menu.\n" +
        "4. Find 'Notifications' and set it to 'Allow.'\n" +
        "5. On iOS/macOS, also ensure that notifications are enabled in your device's settings:\n" +
        "   - Go to System Preferences -> Notifications -> Chrome (or your browser) -> Make sure 'Allow Notifications' is enabled.",
    )
  }

  const detectOSAndShowInstructions = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera

    if (/windows phone/i.test(userAgent) || /android/i.test(userAgent)) {
      showWindowsAndroidInstructions()
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      showMacIOSInstructions() // iOS devices
    } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
      showMacIOSInstructions() // macOS devices
    } else if (/win/i.test(userAgent)) {
      showWindowsAndroidInstructions() // Windows devices
    } else {
      alert(
        'Your device or browser is not recognized. Please manually enable notifications in your browser settings.',
      )
    }
  }

  useEffect(() => {
    dispatch(isSubscribedChecker())
    dispatch(checkNotificationStatus())
  }, [dispatch])

  useEffect(() => {
    if (showInstructions) detectOSAndShowInstructions()
  }, [showInstructions])

  const handleEnableNotifications = async () => {
    console.log('handleEnableNotifications')
    await dispatch(enableNotifications())
  }

  const resetNotificationStatus = () => {
    dispatch(resetStatus())
  }

  return {
    supported,
    loading,
    error,
    handleEnableNotifications,
    resetNotificationStatus,
    isSubscribed,
  }
}

export default useNotification
