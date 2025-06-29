// components/gameHub/gameInterfaces/ConnectionsInterface.jsx - SECURE VERSION - No valid connections from backend
import React, { useState, useMemo, useEffect } from 'react'
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Link2, Trash2, RotateCcw, Target, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const ConnectionsInterface = ({
  gameData,
  onAnswer,
  selectedConnections = [],
}) => {
  const [selectedNodes, setSelectedNodes] = useState([])
  const [userConnections, setUserConnections] = useState(
    selectedConnections || [],
  )
  const { t } = useTranslation()

  // SECURE: Only get safe data from backend (no validConnections exposed)
  const { concepts } = gameData

  // Since we don't know the exact number of valid connections, we'll allow reasonable flexibility
  const recommendedMinConnections = Math.max(
    3,
    Math.floor(concepts.length * 0.6),
  ) // At least 60% of concepts should be connected
  const maxReasonableConnections = Math.floor(
    (concepts.length * (concepts.length - 1)) / 2,
  ) // All possible pairs

  console.log('Connections game data (SECURE):', {
    concepts,
    conceptCount: concepts.length,
    recommendedMin: recommendedMinConnections,
  })

  // Update parent when connections change
  useEffect(() => {
    onAnswer(userConnections)
  }, [userConnections, onAnswer])

  // Initialize with selected connections if provided
  useEffect(() => {
    if (
      selectedConnections &&
      Array.isArray(selectedConnections) &&
      selectedConnections.length > 0
    ) {
      setUserConnections(selectedConnections)
    }
  }, [selectedConnections])

  // Create positions for nodes in a circular pattern
  const nodePositions = useMemo(() => {
    return concepts.reduce((acc, concept, index) => {
      const angle = (index * 2 * Math.PI) / concepts.length
      const radius = 120
      acc[concept] = {
        x: 250 + radius * Math.cos(angle),
        y: 180 + radius * Math.sin(angle),
      }
      return acc
    }, {})
  }, [concepts])

  const handleNodeClick = node => {
    if (selectedNodes.includes(node)) {
      setSelectedNodes(selectedNodes.filter(n => n !== node))
    } else if (selectedNodes.length < 2) {
      setSelectedNodes([...selectedNodes, node])
    }

    if (selectedNodes.length === 1 && !selectedNodes.includes(node)) {
      const from = selectedNodes[0]
      const to = node

      // Check if connection already exists
      const exists = userConnections.some(
        conn =>
          (conn.from === from && conn.to === to) ||
          (conn.from === to && conn.to === from),
      )

      if (!exists && userConnections.length < maxReasonableConnections) {
        const newConnections = [...userConnections, { from, to }]
        setUserConnections(newConnections)
      }

      setSelectedNodes([])
    }
  }

  const removeConnection = (from, to) => {
    const newConnections = userConnections.filter(
      conn =>
        !(conn.from === from && conn.to === to) &&
        !(conn.from === to && conn.to === from),
    )
    setUserConnections(newConnections)
  }

  const clearAllConnections = () => {
    setUserConnections([])
    setSelectedNodes([])
  }

  const getNodeStyle = node => {
    const baseStyle = {
      width: '90px',
      height: '50px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '12px',
      fontWeight: 'medium',
      textAlign: 'center',
      padding: '4px',
    }

    if (selectedNodes.includes(node)) {
      return {
        ...baseStyle,
        backgroundColor: '#7C3AED',
        borderColor: '#A855F7',
        color: 'white',
        transform: 'scale(1.1)',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
      }
    }

    if (selectedNodes.length === 1 && !selectedNodes.includes(node)) {
      return {
        ...baseStyle,
        backgroundColor: '#374151',
        borderColor: '#6B7280',
        color: 'white',
        border: '2px solid #A855F7',
      }
    }

    return {
      ...baseStyle,
      backgroundColor: '#1F2937',
      borderColor: '#4B5563',
      color: 'white',
      border: '2px solid #4B5563',
    }
  }

  const getProgressStatus = () => {
    if (userConnections.length === 0) {
      return {
        color: 'gray',
        label: 'Not Started',
        description: 'Start by clicking two concepts to connect them',
      }
    }

    if (userConnections.length < recommendedMinConnections) {
      return {
        color: 'red',
        label: 'Getting Started',
        description: `Try to find at least ${recommendedMinConnections} meaningful connections`,
      }
    }

    if (userConnections.length >= recommendedMinConnections) {
      return {
        color: 'green',
        label: 'Good Progress',
        description:
          'You have a good set of connections! You can submit or find more.',
      }
    }

    return {
      color: 'yellow',
      label: 'In Progress',
      description: 'Keep finding logical connections',
    }
  }

  const progressStatus = getProgressStatus()
  const canSubmit = userConnections.length > 0

  return (
    <VStack spacing={6} w="100%">
      {/* Header */}
      <Box textAlign="center">
        <HStack justify="center" spacing={4} mb={4}>
          <Badge colorScheme="violet" fontSize="md" px={3} py={1}>
            Connect Concepts
          </Badge>
          <Badge colorScheme={progressStatus.color} fontSize="sm" px={2} py={1}>
            {progressStatus.label}
          </Badge>
        </HStack>
        <Text fontSize="lg" fontWeight="bold" color="violet.200" mb={2}>
          Find Logical Relationships
        </Text>
        <Text fontSize="sm" color="gray.400" mb={2}>
          Click two concepts to create a connection based on the article
          content.
        </Text>
        <Text fontSize="xs" color="gray.500">
          {progressStatus.description}
        </Text>

        {/* Progress Display */}
        <HStack justify="center" spacing={4} mt={4}>
          <HStack spacing={2}>
            <Target size={16} color="#8B5CF6" />
            <Text fontSize="md" color="violet.400" fontWeight="semibold">
              Connections: {userConnections.length}
            </Text>
          </HStack>
          {userConnections.length > 0 && (
            <Button
              size="xs"
              variant="ghost"
              colorScheme="red"
              leftIcon={<Trash2 size={12} />}
              onClick={clearAllConnections}
            >
              Clear All
            </Button>
          )}
        </HStack>
      </Box>

      {/* Game Board */}
      <Box
        bg="gray.800"
        borderRadius="2xl"
        p={6}
        border="1px solid"
        borderColor="gray.700"
        position="relative"
        overflow="hidden"
        height="400px"
        width="500px"
        mx="auto"
      >
        {/* SVG for connections */}
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {userConnections.map((conn, idx) => {
            const fromPos = nodePositions[conn.from]
            const toPos = nodePositions[conn.to]

            return (
              <g key={idx}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  opacity={0.8}
                />
                <circle
                  cx={(fromPos.x + toPos.x) / 2}
                  cy={(fromPos.y + toPos.y) / 2}
                  r="12"
                  fill="#EF4444"
                  stroke="#FCA5A5"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => removeConnection(conn.from, conn.to)}
                />
                <text
                  x={(fromPos.x + toPos.x) / 2}
                  y={(fromPos.y + toPos.y) / 2 + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  ×
                </text>
              </g>
            )
          })}
        </svg>

        {/* Concept nodes */}
        {concepts.map(concept => {
          const pos = nodePositions[concept]
          return (
            <MotionBox
              key={concept}
              onClick={() => handleNodeClick(concept)}
              position="absolute"
              left={`${pos.x}px`}
              top={`${pos.y}px`}
              transform="translate(-50%, -50%)"
              style={getNodeStyle(concept)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Text>{concept}</Text>
            </MotionBox>
          )
        })}
      </Box>

      {/* Connection List */}
      {userConnections.length > 0 && (
        <Box
          bg="gray.800"
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.700"
          w="100%"
          maxW="500px"
        >
          <Text fontSize="sm" fontWeight="bold" color="violet.200" mb={3}>
            Your Connections ({userConnections.length}):
          </Text>
          <VStack spacing={2}>
            {userConnections.map((conn, idx) => (
              <HStack
                key={idx}
                justify="space-between"
                w="100%"
                p={3}
                bg="gray.900"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.600"
              >
                <HStack flex="1">
                  <Text fontSize="sm" color="white" fontWeight="medium">
                    {conn.from}
                  </Text>
                  <Link2 size={14} color="#8B5CF6" />
                  <Text fontSize="sm" color="white" fontWeight="medium">
                    {conn.to}
                  </Text>
                </HStack>
                <Button
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeConnection(conn.from, conn.to)}
                  p={1}
                >
                  <Trash2 size={12} />
                </Button>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Instructions and Tips */}
      <VStack spacing={3} w="100%" maxW="500px">
        <Box
          bg="blue.900"
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor="blue.700"
          w="100%"
        >
          <Text
            fontSize="sm"
            color="blue.200"
            textAlign="center"
            lineHeight="1.5"
          >
            💡 <strong>How to play:</strong> Click two concepts to create a
            connection. Look for relationships like cause-effect, categories, or
            thematic links based on the article content. Red X buttons remove
            connections.
          </Text>
        </Box>

        {/* Guidance for connections */}
        <Box
          bg="purple.900"
          p={3}
          borderRadius="lg"
          border="1px solid"
          borderColor="purple.700"
          w="100%"
        >
          <Text fontSize="xs" color="purple.200" textAlign="center">
            🔗 <strong>Look for:</strong> Cause-effect relationships, similar
            categories, related topics, or concepts that work together in the
            article's context.
          </Text>
        </Box>
      </VStack>

      {/* Progress feedback */}
      {userConnections.length >= recommendedMinConnections && (
        <Alert
          status="success"
          borderRadius="lg"
          bg="green.900"
          color="white"
          maxW="500px"
        >
          <AlertIcon />
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Great job!</Text>
            <Text fontSize="sm">
              You've found {userConnections.length} connections. You can submit
              now or continue exploring for more relationships.
            </Text>
          </VStack>
        </Alert>
      )}

      {userConnections.length > 0 &&
        userConnections.length < recommendedMinConnections && (
          <Box textAlign="center">
            <Text fontSize="sm" color="yellow.400" fontWeight="medium">
              🎯 Consider finding{' '}
              {recommendedMinConnections - userConnections.length} more
              connection
              {recommendedMinConnections - userConnections.length !== 1
                ? 's'
                : ''}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              You can submit with current connections or continue exploring
            </Text>
          </Box>
        )}

      {userConnections.length === 0 && (
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.400" fontStyle="italic">
            Start by clicking any two concepts that you think are related based
            on the article.
          </Text>
        </Box>
      )}
    </VStack>
  )
}

export default ConnectionsInterface
