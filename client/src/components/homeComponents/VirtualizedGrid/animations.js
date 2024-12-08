import { keyframes } from '@emotion/react'

export const shimmer = keyframes`
  0% {
    background-position: -80% 0;
  }
  100% {
    background-position: 80% 0;
  }
`

export const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
`
