import React, { useState, useEffect } from 'react'
import ServiceScreen from '../screens/ServiceScreen'
import axios from 'axios'
import FixedBackground from '../components/miscellaneous/FixedBackground'
import moment from 'moment-timezone'
import { useToast } from '@chakra-ui/react'

const MaintenanceHandler = ({ children }) => {
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false)
  const [maintenanceDetails, setMaintenanceDetails] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (isUnderMaintenance) {
      const methods = ['success', 'error', 'warning', 'info', 'custom']
      const noopFn = () => null

      methods.forEach(method => {
        window.__chakraToast = window.__chakraToast || {}
        window.__chakraToast[method] = toast[method]
        toast[method] = noopFn
      })

      const originalToastFn = toast
      Object.defineProperty(window, 'toast', {
        get: () => noopFn,
        configurable: true,
      })

      return () => {
        methods.forEach(method => {
          if (window.__chakraToast && window.__chakraToast[method]) {
            toast[method] = window.__chakraToast[method]
          }
        })
        Object.defineProperty(window, 'toast', {
          get: () => originalToastFn,
          configurable: true,
        })
      }
    }
  }, [isUnderMaintenance, toast])

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (
          error.response?.status === 503 &&
          error.response?.data?.maintenance
        ) {
          setIsUnderMaintenance(true)
          setMaintenanceDetails(error.response.data.maintenance)
        }
        return Promise.reject(error)
      },
    )

    const checkMaintenanceStatus = async () => {
      try {
        await axios.get('/api/user/maintenance-status')
        setIsUnderMaintenance(false)
      } catch (error) {
        if (
          error.response?.status === 503 &&
          error.response?.data?.maintenance
        ) {
          setIsUnderMaintenance(true)
          setMaintenanceDetails(error.response.data.maintenance)
        }
      }
    }

    checkMaintenanceStatus()

    return () => {
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  const formatMaintenanceTime = timeString => {
    if (!timeString) return 'TBD'
    const userTimezone = moment.tz.guess()
    return moment(timeString)
      .tz(userTimezone)
      .format('MMMM Do YYYY, h:mm:ss a z')
  }

  if (isUnderMaintenance) {
    const formattedEndTime = formatMaintenanceTime(maintenanceDetails?.endTime)
    const formattedStartTime = formatMaintenanceTime(
      maintenanceDetails?.startTime,
    )

    const description = `We're currently performing system maintenance to improve your experience.
      ${maintenanceDetails?.reason || ''}
      \nMaintenance started: ${formattedStartTime}
      \nExpected completion: ${formattedEndTime}`

    return (
      <>
        <ServiceScreen
          title="System Maintenance"
          description={description}
          quote="Thank you for your patience while we make Rapid Recap even better!"
          quoteAuthor="The Rapid Recap Team"
          titleColor="blue.400"
          descriptionColor="gray.200"
        />
        <FixedBackground />
      </>
    )
  }

  return children
}

export default MaintenanceHandler
