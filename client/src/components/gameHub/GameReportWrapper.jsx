// components/gameHub/GameReportWrapper.jsx - Simple version since history is already clean
import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Text,
  Spinner,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Container,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { ChevronLeft, AlertTriangle, FileText } from 'lucide-react'
import axios from 'axios'
import SubmittedQuizInterface from '../quizComponents/SubmittedQuizInterface'

const MotionBox = motion(Box)

const LoadingState = () => (
  <Box
    minH="100vh"
    bgGradient="linear(to-br, blue.900, purple.900, violet.900)"
    display="flex"
    alignItems="center"
    justifyContent="center"
    color="white"
  >
    <VStack spacing={4}>
      <Spinner size="xl" color="blue.400" thickness="4px" />
      <Text fontSize="lg" fontWeight="medium">
        Loading your game report...
      </Text>
      <Text fontSize="sm" color="gray.300">
        Fetching your latest performance data
      </Text>
    </VStack>
  </Box>
)

const ErrorState = ({ error, onRetry, onGoBack }) => (
  <Box
    minH="100vh"
    bgGradient="linear(to-br, blue.900, purple.900, violet.900)"
    display="flex"
    alignItems="center"
    justifyContent="center"
    color="white"
    p={4}
  >
    <Container maxW="md">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={6} textAlign="center">
          {/* Error Icon */}
          <Box
            p={4}
            bg="rgba(239, 68, 68, 0.1)"
            borderRadius="full"
            border="2px solid"
            borderColor="red.400"
          >
            <AlertTriangle size={48} color="#EF4444" />
          </Box>

          {/* Error Message */}
          <VStack spacing={3}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              Unable to Load Report
            </Text>
            <Alert
              status="error"
              bg="rgba(239, 68, 68, 0.1)"
              border="1px solid"
              borderColor="red.400"
              borderRadius="lg"
              color="white"
            >
              <AlertIcon color="red.400" />
              <AlertDescription fontSize="sm">
                {error || 'Failed to fetch your game report. Please try again.'}
              </AlertDescription>
            </Alert>
          </VStack>

          {/* Action Buttons */}
          <VStack spacing={3} w="100%">
            <Button
              onClick={onRetry}
              colorScheme="blue"
              size="lg"
              width="100%"
              borderRadius="full"
              fontWeight="medium"
            >
              Try Again
            </Button>
            <Button
              onClick={onGoBack}
              variant="outline"
              size="md"
              width="100%"
              borderRadius="full"
              borderColor="gray.400"
              color="gray.300"
              _hover={{
                borderColor: 'gray.300',
                color: 'white',
              }}
              leftIcon={<FileText size={18} />}
            >
              Back to Article
            </Button>
          </VStack>

          {/* Help Text */}
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Make sure you have completed at least one game for this article.
          </Text>
        </VStack>
      </MotionBox>
    </Container>
  </Box>
)

const GameReportWrapper = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchGameReport()
    console.log(
      'GameReportWrapper loaded - history should be clean (Article → Report)',
    )
  }, [articleId])

  const fetchGameReport = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(`/api/gamehub/report/${articleId}`)
      setReportData(response.data.report)
    } catch (err) {
      console.error('Error fetching game report:', err)
      const errorMessage =
        err.response?.data?.error || 'Failed to fetch game report'
      setError(errorMessage)

      // Show user-friendly toast for specific errors
      if (err.response?.status === 404) {
        toast({
          title: 'No Game Found',
          description: "You haven't completed any games for this article yet.",
          status: 'info',
          duration: 4000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Error Loading Report',
          description: errorMessage,
          status: 'error',
          duration: 4000,
          isClosable: true,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchGameReport()
  }

  // Simple navigation back to article (history is already clean)
  const handleGoBack = () => {
    console.log(
      'Going back to article - using browser back since history is clean',
    )
    navigate(-1) // This should go to article since game routes were removed
  }

  // Normal navigation to summary
  const handleViewReport = () => {
    if (reportData?.sessionId) {
      navigate(`/gamehub/${articleId}/summary/${reportData.sessionId}`)
    } else {
      toast({
        title: 'Summary Unavailable',
        description: 'Detailed summary is not available for this report.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Show loading state
  if (loading) {
    return <LoadingState />
  }

  // Show error state
  if (error || !reportData) {
    return (
      <ErrorState error={error} onRetry={handleRetry} onGoBack={handleGoBack} />
    )
  }

  // Render the SubmittedQuizInterface with normal navigation
  return (
    <SubmittedQuizInterface
      submitLoad={false}
      result={reportData}
      onViewReport={handleViewReport}
      isTournament={false}
      openedFromQuickClash={false}
      technicalError={null}
    />
  )
}

export default GameReportWrapper
