// components/quickClashComponents/v2/SessionSignupPanel.jsx
// Slide-over panel for session player account creation via Google OAuth
// Converts session player to full user while preserving all stats

import React, { memo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import {
  X,
  Sparkles,
  Trophy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Swords,
  Shield,
  Users,
} from 'lucide-react'

// Redux
import { setUser, setLoginCheckStatus, verifyAdminStatus } from '../../../redux/authSlice'

// Utils
import { dailyStreakCheckerAndUpdater } from '../../../utils/quiz.utils'

// Audio and haptics
import { quizAudioService } from '../../../services/quizAudioService'
import { haptics } from '../../../utils/haptics'

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '492859619634-m81f6tnro73fg6sflkuj0nemm1g6aecb.apps.googleusercontent.com'

// Separate component for Google button to use the hook
const GoogleSignupButton = memo(({ onSuccess, onError, isLoading }) => {
  const login = useGoogleLogin({
    flow: 'auth-code', // Use authorization code flow instead of implicit
    onSuccess: async (codeResponse) => {
      try {
        // Send the authorization code to our backend
        // The backend will exchange it for tokens and get user info
        onSuccess({
          code: codeResponse.code,
        })
      } catch (error) {
        console.error('Failed to process auth code:', error)
        onError('Failed to process Google sign-in')
      }
    },
    onError: (error) => {
      console.error('Google login error:', error)
      onError('Google sign-in failed. Please try again.')
    },
  })

  return (
    <motion.button
      onClick={() => login()}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 text-white font-semibold disabled:opacity-50 cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #4285F4 0%, #34A853 50%, #EA4335 100%)',
        boxShadow: '0 4px 20px rgba(66, 133, 244, 0.4)',
        border: 'none',
      }}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Signing up...
        </>
      ) : (
        <>
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </>
      )}
    </motion.button>
  )
})
GoogleSignupButton.displayName = 'GoogleSignupButton'

const SessionSignupPanel = memo(({ isOpen, onClose, sessionPlayer }) => {
  const dispatch = useDispatch()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Reset state when panel opens
  useEffect(() => {
    if (isOpen) {
      setError('')
      setSuccess(false)
      setSuccessMessage('')
    }
  }, [isOpen])

  // Handle Google OAuth success - converts session to user
  const handleGoogleSuccess = useCallback(async (googleData) => {
    setIsLoading(true)
    setError('')

    try {
      const sessionId = localStorage.getItem('playSessionId')
      if (!sessionId) {
        setError('Session not found. Please refresh and try again.')
        setIsLoading(false)
        return
      }

      // Call our convert endpoint with Google auth code
      // The backend will exchange the code for tokens and get user info securely
      const response = await axios.post('/api/play/convert/google', {
        sessionId,
        code: googleData.code,
      })

      if (response.data.success) {
        // Store auth data in localStorage (matching normal Google login flow)
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('role', response.data.user.role)

        // Update Redux state
        dispatch(setUser(response.data.user))
        dispatch(setLoginCheckStatus('fulfilled'))
        dispatch(verifyAdminStatus())

        // Run daily streak checker
        dailyStreakCheckerAndUpdater(dispatch)

        // Clear session player localStorage
        localStorage.removeItem('playSessionId')
        localStorage.removeItem('playSessionToken')
        localStorage.removeItem('playSessionName')
        localStorage.removeItem('sparkUpgraded')

        // Store pending reward for modal display after reload
        if (response.data.rewardGranted && response.data.rewards) {
          localStorage.setItem('pendingReward', JSON.stringify({
            powerups: response.data.rewards.powerups
          }))
        }

        setSuccessMessage(response.data.isNewUser
          ? 'Account created successfully!'
          : 'Session linked to your account!'
        )
        setSuccess(true)
        haptics.success()
        quizAudioService.playCorrect()

        // Reload after success
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      console.error('Google signup error:', err)
      setError(err.response?.data?.error || 'Sign up failed. Please try again.')
      haptics.error()
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  const handleGoogleError = useCallback((errorMsg) => {
    setError(errorMsg)
    haptics.error()
  }, [])

  const handleClose = () => {
    if (!isLoading) {
      haptics.light()
      onClose()
    }
  }

  const benefits = [
    { icon: Trophy, text: 'Keep your trophies forever', color: 'text-yellow-400' },
    { icon: Swords, text: 'Access full battle history', color: 'text-cyan-400' },
    { icon: Users, text: 'Join permanent teams', color: 'text-purple-400' },
    { icon: Shield, text: 'Earn and use powerups', color: 'text-emerald-400' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[61] w-full max-w-md bg-slate-900 shadow-2xl overflow-y-auto"
            style={{
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Create Account</h2>
                  <p className="text-xs text-white/50">Keep your progress forever</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6">
              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{successMessage}</h3>
                  <p className="text-white/60">Your progress has been saved</p>
                </motion.div>
              ) : (
                <>
                  {/* Session Player Stats Preview */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Converting</p>
                        <p className="text-lg font-bold text-white">{sessionPlayer?.inGameName || 'Player'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-yellow-400 font-semibold">{sessionPlayer?.trophies ?? 1000} trophies</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefits List */}
                  <div className="space-y-3">
                    <p className="text-sm text-white/60 font-medium">What you'll get:</p>
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                        <span className="text-sm text-white/80">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-300">{error}</p>
                    </motion.div>
                  )}

                  {/* Google Sign-In Button - Full width, fully clickable */}
                  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <div className="pt-2">
                      <GoogleSignupButton
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        isLoading={isLoading}
                      />
                    </div>
                  </GoogleOAuthProvider>

                  {/* Footer Note */}
                  <p className="text-center text-xs text-white/30 pt-4">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

SessionSignupPanel.displayName = 'SessionSignupPanel'
export default SessionSignupPanel
