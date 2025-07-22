// components/DebugBackButtonTest.jsx - Temporary test component to debug back button
import React, { useEffect, useState } from 'react'
import { Box, Text, VStack, Button } from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'

const DebugBackButtonTest = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])

  const addEvent = (eventType, data = {}) => {
    const timestamp = new Date().toLocaleTimeString()
    setEvents(prev => [...prev, { timestamp, eventType, data }])
    console.log(`[${timestamp}] ${eventType}:`, data)
  }

  useEffect(() => {
    addEvent('Component mounted', { articleId })

    // Test back button handling
    const handlePopState = event => {
      addEvent('Popstate event', {
        state: event.state,
        pathname: window.location.pathname,
      })

      // Prevent default and navigate to article
      event.preventDefault()
      event.stopPropagation()

      addEvent('Navigating to article', { articleId })
      navigate(`/article/${articleId}`, { replace: true })

      return false
    }

    const handleBeforeUnload = event => {
      addEvent('Before unload event')
    }

    // Add listeners
    window.addEventListener('popstate', handlePopState, true)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Setup history
    addEvent('Setting up history', {
      currentLength: window.history.length,
      currentPath: window.location.pathname,
    })

    // Push article state
    window.history.pushState({ page: 'article' }, '', `/article/${articleId}`)
    addEvent('Pushed article state')

    // Push summary state
    window.history.pushState({ page: 'summary' }, '', window.location.pathname)
    addEvent('Pushed summary state')

    return () => {
      addEvent('Component unmounting')
      window.removeEventListener('popstate', handlePopState, true)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [articleId, navigate])

  return (
    <Box minH="100vh" bg="gray.900" color="white" p={4}>
      <VStack spacing={4} align="stretch" maxW="800px" mx="auto">
        <Text fontSize="2xl" fontWeight="bold">
          Back Button Debug Test
        </Text>

        <Text>Article ID: {articleId}</Text>

        <Button
          onClick={() => navigate(`/article/${articleId}`)}
          colorScheme="blue"
        >
          Navigate to Article (Manual)
        </Button>

        <Button onClick={() => window.history.back()} colorScheme="red">
          Test Browser Back Button
        </Button>

        <Box
          bg="gray.800"
          p={4}
          borderRadius="md"
          maxH="400px"
          overflowY="auto"
        >
          <Text fontWeight="bold" mb={2}>
            Event Log:
          </Text>
          {events.map((event, index) => (
            <Box key={index} mb={2} fontSize="sm">
              <Text color="gray.400">[{event.timestamp}]</Text>
              <Text color="yellow.300">{event.eventType}</Text>
              {Object.keys(event.data).length > 0 && (
                <Text color="gray.300" fontSize="xs" ml={4}>
                  {JSON.stringify(event.data, null, 2)}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      </VStack>
    </Box>
  )
}

export default DebugBackButtonTest
