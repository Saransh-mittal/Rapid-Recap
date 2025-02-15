import { keyframes } from '@emotion/react'

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

export const slideIn = keyframes`
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

export const scaleIn = keyframes`
  from { transform: scale(0.9); }
  to { transform: scale(1); }
`

export const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(236, 72, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
`
