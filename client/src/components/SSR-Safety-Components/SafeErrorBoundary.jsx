import React from 'react'
import { Box, Text } from '@chakra-ui/react'

class SafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Client-side feature error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={4} role="alert" bg="transparent">
          {this.props.fallback || this.props.children}
        </Box>
      )
    }

    return this.props.children
  }
}

export default SafeErrorBoundary
