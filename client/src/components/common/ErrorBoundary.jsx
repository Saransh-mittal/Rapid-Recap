// components/common/ErrorBoundary.jsx
import React from 'react'
import {
  Box,
  Center,
  VStack,
  Text,
  Button,
  Icon,
  Heading,
} from '@chakra-ui/react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" bg="gray.900" position="relative">
          <Center minH="100vh" p={4}>
            <VStack spacing={6} maxW="md" textAlign="center">
              <MotionBox
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  p={4}
                  borderRadius="full"
                  bg="rgba(239, 68, 68, 0.1)"
                  border="2px solid"
                  borderColor="red.500"
                >
                  <Icon as={AlertTriangle} color="red.400" boxSize={8} />
                </Box>
              </MotionBox>

              <VStack spacing={3}>
                <Heading size="lg" color="red.400">
                  {this.props.title || 'Something went wrong'}
                </Heading>
                <Text color="whiteAlpha.800" fontSize="md">
                  {this.props.fallbackText ||
                    'An unexpected error occurred while loading the battle analysis.'}
                </Text>
              </VStack>

              <VStack spacing={3} w="full">
                <Button
                  leftIcon={<RefreshCw size={16} />}
                  colorScheme="red"
                  size="lg"
                  onClick={this.handleReload}
                  w="full"
                  maxW="200px"
                >
                  Reload Page
                </Button>
                {this.props.onReset && (
                  <Button
                    variant="ghost"
                    color="whiteAlpha.700"
                    size="md"
                    onClick={this.props.onReset || this.handleReset}
                  >
                    Try Again
                  </Button>
                )}
              </VStack>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  mt={4}
                  p={3}
                  bg="red.900"
                  borderRadius="md"
                  fontSize="xs"
                  color="red.100"
                  textAlign="left"
                  w="full"
                  maxH="200px"
                  overflow="auto"
                >
                  <Text fontWeight="bold" mb={2}>
                    Error Details:
                  </Text>
                  <Text>{this.state.error.toString()}</Text>
                  {this.state.errorInfo.componentStack && (
                    <>
                      <Text fontWeight="bold" mt={2} mb={1}>
                        Component Stack:
                      </Text>
                      <Text fontSize="2xs">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </>
                  )}
                </Box>
              )}
            </VStack>
          </Center>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
