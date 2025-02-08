// src/hooks/usePWAInstallation.js

import { useState, useEffect } from 'react'
import { isPWA, listenForInstall } from '../utils/pwaDetection'

const usePWAInstallation = () => {
  const [installationStatus, setInstallationStatus] = useState({
    isInstalled: false,
    browser: 'other',
    isSupported: false,
  })

  useEffect(() => {
    const checkAndUpdateStatus = async () => {
      const status = isPWA()
      setInstallationStatus(status)
    }

    checkAndUpdateStatus()

    // Listen for installation events
    listenForInstall(async status => {
      setInstallationStatus(prev => ({
        ...prev,
        isInstalled: status === 'installed',
      }))
    })
  }, [])

  return installationStatus
}

export default usePWAInstallation
