import axios from 'axios'
import React from 'react'

const GuestLogin = () => {
  const handleGuestLogin = async () => {
    const storedGuestId = localStorage.getItem('guestUserId')

    try {
      const response = await axios.post('/api/user/enhancedGuestLogin', {
        storedGuestId,
      })

      const data = await response.json()

      if (response.ok) {
        // Store the guest user ID
        localStorage.setItem('guestUserId', data.user._id)

        // Handle successful login (e.g., update app state, redirect, etc.)
        console.log('Logged in as guest:', data.user.inGameName)
      } else {
        // Handle errors
        console.error('Guest login failed:', data.error)
      }
    } catch (error) {
      console.error('Error during guest login:', error)
    }
  }
  return <div></div>
}

export default GuestLogin
