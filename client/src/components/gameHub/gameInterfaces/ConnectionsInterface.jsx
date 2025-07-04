// components/gameHub/gameInterfaces/ConnectionsInterface.jsx - Fixed Infinite Loop Issues + Added Node Tooltips
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Badge,
  useBreakpointValue,
  Container,
  Alert,
  AlertIcon,
  AlertDescription,
  Tooltip,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Link2,
  Trash2,
  Target,
  CheckCircle,
  Network,
  X,
  Moon,
  AlertTriangle,
  Crown,
  Lock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const ConnectionsInterface = ({
  gameData,
  onAnswer,
  selectedConnections = [],
}) => {
  const [selectedNodes, setSelectedNodes] = useState([])
  const [userConnections, setUserConnections] = useState([])
  const { t } = useTranslation('GameHub')

  // NEW: Refs to prevent infinite loops
  const isUpdatingRef = useRef(false)
  const lastConnectionsRef = useRef([])
  const debounceTimeoutRef = useRef(null)

  const isMobile = useBreakpointValue({ base: true, md: false })
  const containerSize = useBreakpointValue({
    base: 320,
    sm: 380,
    md: 440,
    lg: 480,
  })
  const nodeWidth = useBreakpointValue({
    base: 85,
    sm: 90,
    md: 95,
    lg: 100,
  })
  const nodeHeight = useBreakpointValue({
    base: 50,
    sm: 52,
    md: 55,
    lg: 58,
  })

  const { concepts } = gameData
  const conceptCount = concepts.length
  const MAX_CONNECTIONS = 4

  // NEW: Stable memoized calculations with proper dependencies
  const connectedNodes = useMemo(() => {
    const connected = new Set()
    userConnections.forEach(connection => {
      if (connection?.from && connection?.to) {
        connected.add(connection.from)
        connected.add(connection.to)
      }
    })
    return connected
  }, [userConnections]) // Only depend on userConnections

  const availableNodes = useMemo(() => {
    return concepts.filter(concept => !connectedNodes.has(concept))
  }, [concepts, connectedNodes])

  // NEW: Debounced onAnswer to prevent rapid calls
  const debouncedOnAnswer = useCallback(
    connections => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (!isUpdatingRef.current) {
          isUpdatingRef.current = true
          onAnswer(connections)
          setTimeout(() => {
            isUpdatingRef.current = false
          }, 100)
        }
      }, 150)
    },
    [onAnswer],
  )

  // NEW: Effect with proper dependency management and loop prevention
  useEffect(() => {
    // Prevent calling onAnswer during initial setup or if already updating
    if (isUpdatingRef.current) return

    // Compare connections to prevent unnecessary calls
    const currentConnectionsStr = JSON.stringify(userConnections)
    const lastConnectionsStr = JSON.stringify(lastConnectionsRef.current)

    if (currentConnectionsStr !== lastConnectionsStr) {
      lastConnectionsRef.current = [...userConnections]
      debouncedOnAnswer(userConnections)
    }
  }, [userConnections, debouncedOnAnswer])

  // NEW: Stable initialization effect
  useEffect(() => {
    if (
      selectedConnections &&
      Array.isArray(selectedConnections) &&
      selectedConnections.length > 0 &&
      userConnections.length === 0 // Only initialize if empty
    ) {
      const validConnections = selectedConnections
        .slice(0, MAX_CONNECTIONS)
        .filter(conn => conn?.from && conn?.to && conn.from !== conn.to)

      if (validConnections.length > 0) {
        setUserConnections(validConnections)
      }
    }
  }, [selectedConnections]) // Remove userConnections from deps to prevent loop

  // NEW: Stable node positions with fixed dependencies
  const nodePositions = useMemo(() => {
    const positions = {}
    if (conceptCount === 0) return positions

    const center = containerSize / 2
    const nodePadding = Math.max(nodeWidth, nodeHeight) / 2
    const edgePadding = 5
    const maxRadius = center - nodePadding - edgePadding

    if (conceptCount === 1) {
      positions[concepts[0]] = { x: center, y: center }
    } else if (conceptCount === 2) {
      const spacing = maxRadius
      positions[concepts[0]] = { x: center - spacing, y: center }
      positions[concepts[1]] = { x: center + spacing, y: center }
    } else if (conceptCount === 3) {
      const radius = maxRadius
      positions[concepts[0]] = { x: center, y: center - radius }
      positions[concepts[1]] = {
        x: center - radius * Math.cos(Math.PI / 6),
        y: center + radius * Math.sin(Math.PI / 6),
      }
      positions[concepts[2]] = {
        x: center + radius * Math.cos(Math.PI / 6),
        y: center + radius * Math.sin(Math.PI / 6),
      }
    } else if (conceptCount === 4) {
      const spacing = maxRadius / Math.sqrt(2)
      positions[concepts[0]] = { x: center - spacing, y: center - spacing }
      positions[concepts[1]] = { x: center + spacing, y: center - spacing }
      positions[concepts[2]] = { x: center - spacing, y: center + spacing }
      positions[concepts[3]] = { x: center + spacing, y: center + spacing }
    } else {
      const radius = maxRadius
      for (let i = 0; i < conceptCount; i++) {
        const angle = (i * 2 * Math.PI) / conceptCount - Math.PI / 2
        positions[concepts[i]] = {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle),
        }
      }
    }

    // Ensure positions are within bounds
    Object.keys(positions).forEach(concept => {
      const pos = positions[concept]
      const minCoord = nodePadding + edgePadding
      const maxCoord = containerSize - nodePadding - edgePadding
      pos.x = Math.max(minCoord, Math.min(maxCoord, pos.x))
      pos.y = Math.max(minCoord, Math.min(maxCoord, pos.y))
    })

    return positions
  }, [concepts, conceptCount, containerSize, nodeWidth, nodeHeight]) // Stable deps only

  const connectionPaths = useMemo(() => {
    return userConnections
      .filter(conn => conn?.from && conn?.to) // Filter out invalid connections
      .map((conn, idx) => {
        const fromPos = nodePositions[conn.from]
        const toPos = nodePositions[conn.to]
        if (!fromPos || !toPos) return null

        const mx = (fromPos.x + toPos.x) / 2
        const my = (fromPos.y + toPos.y) / 2
        const vx = toPos.x - fromPos.x
        const vy = toPos.y - fromPos.y
        const px = -vy
        const py = vx
        const pLength = Math.sqrt(px * px + py * py)
        const nx = pLength === 0 ? 0 : px / pLength
        const ny = pLength === 0 ? 0 : py / pLength
        const curvatureAmount = 25
        const cx = mx + nx * curvatureAmount
        const cy = my + ny * curvatureAmount
        const pathData = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`
        const removeBtnPos = {
          x: 0.25 * fromPos.x + 0.5 * cx + 0.25 * toPos.x,
          y: 0.25 * fromPos.y + 0.5 * cy + 0.25 * toPos.y,
        }

        return {
          ...conn,
          fromPos,
          toPos,
          pathData,
          removeBtnPos,
          gradientId: `connectionGradient-${idx}`,
        }
      })
      .filter(Boolean)
  }, [userConnections, nodePositions])

  const hasReachedLimit = userConnections.length >= MAX_CONNECTIONS

  // NEW: Stable event handlers with useCallback
  const handleNodeClick = useCallback(
    node => {
      // Prevent rapid clicks and invalid operations
      if (isUpdatingRef.current || !node) return

      // Prevent clicking on locked (already connected) nodes
      if (connectedNodes.has(node)) {
        return
      }

      // Prevent node selection if limit reached and no available nodes can be selected
      if (hasReachedLimit && selectedNodes.length === 0) {
        return
      }

      setSelectedNodes(prevSelected => {
        if (prevSelected.includes(node)) {
          return prevSelected.filter(n => n !== node)
        } else if (prevSelected.length < 2) {
          const newSelected = [...prevSelected, node]

          // If we now have 2 nodes selected, create connection
          if (newSelected.length === 2) {
            const [from, to] = newSelected

            // Check if we can add more connections
            if (hasReachedLimit) {
              return [] // Clear selection
            }

            // Additional check - both nodes must be available (not connected)
            if (connectedNodes.has(from) || connectedNodes.has(to)) {
              return [] // Clear selection
            }

            // Check if connection already exists
            const exists = userConnections.some(
              conn =>
                (conn.from === from && conn.to === to) ||
                (conn.from === to && conn.to === from),
            )

            if (!exists) {
              // Use setTimeout to prevent rapid state updates
              setTimeout(() => {
                setUserConnections(prevConnections => {
                  const newConnection = { from, to }
                  const isDuplicate = prevConnections.some(
                    conn =>
                      (conn.from === from && conn.to === to) ||
                      (conn.from === to && conn.to === from),
                  )

                  if (!isDuplicate) {
                    return [...prevConnections, newConnection]
                  }
                  return prevConnections
                })
              }, 50)
            }

            return [] // Clear selection after creating connection
          }

          return newSelected
        }
        return prevSelected
      })
    },
    [connectedNodes, hasReachedLimit, selectedNodes.length, userConnections],
  )

  const removeConnection = useCallback((from, to) => {
    if (isUpdatingRef.current) return

    setUserConnections(prevConnections =>
      prevConnections.filter(
        conn =>
          !(conn.from === from && conn.to === to) &&
          !(conn.from === to && conn.to === from),
      ),
    )

    // Clear selected nodes when removing connections to prevent invalid states
    setSelectedNodes([])
  }, [])

  const clearAllConnections = useCallback(() => {
    if (isUpdatingRef.current) return

    setUserConnections([])
    setSelectedNodes([])
  }, [])

  // NEW: Stable node style function
  const getNodeStyle = useCallback(
    node => {
      const isSelected = selectedNodes.includes(node)
      const isConnected = connectedNodes.has(node)
      const isHighlighted =
        selectedNodes.length === 1 &&
        !selectedNodes.includes(node) &&
        !isConnected

      const isDisabled =
        isConnected || (hasReachedLimit && selectedNodes.length === 0)

      const baseStyle = {
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        fontSize: useBreakpointValue({
          base: '9px',
          sm: '10px',
          md: '11px',
          lg: '12px',
        }),
        fontWeight: '600',
        textAlign: 'center',
        padding: '6px 8px',
        border: '2px solid',
        position: 'absolute',
        transform: 'scale(1)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 5,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
      }

      if (isConnected) {
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #DC2626, #991B1B)',
          borderColor: '#FCA5A5',
          color: 'white',
          opacity: 0.9,
          cursor: 'not-allowed',
          boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)',
        }
      }

      if (isSelected) {
        return {
          ...baseStyle,
          background: 'linear-gradient(45deg, #A855F7, #6D28D9)',
          borderColor: '#C4B5FD',
          color: 'white',
          boxShadow: '0 0 24px 6px rgba(168, 85, 247, 0.4)',
          transform: 'scale(1.05)',
          zIndex: 10,
        }
      }

      if (isHighlighted) {
        return {
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.05)',
          borderColor: '#C4B5FD',
          color: 'white',
          boxShadow: '0 0 10px 2px rgba(168, 85, 247, 0.3)',
        }
      }

      if (isDisabled) {
        return {
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.02)',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          color: 'rgba(255, 255, 255, 0.5)',
          opacity: 0.6,
        }
      }

      return {
        ...baseStyle,
        background: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(168, 85, 247, 0.6)',
        color: 'white',
      }
    },
    [selectedNodes, connectedNodes, hasReachedLimit, nodeWidth, nodeHeight],
  )

  const getProgressStatus = useCallback(() => {
    if (userConnections.length === 0) {
      return {
        color: '#6B7280',
        label: `${t('gameInterface.readyToConnect')} (${
          availableNodes.length
        } ${t('gameInterface.nodesAvailable')})`,
        icon: Target,
      }
    }
    if (userConnections.length === MAX_CONNECTIONS) {
      return {
        color: '#10B981',
        label: t('gameInterface.perfectNetworkStatus'),
        icon: Crown,
      }
    }
    return {
      color: '#F59E0B',
      label: `${t('gameInterface.buildingNetwork')} (${
        availableNodes.length
      } ${t('gameInterface.nodesAvailable')})`,
      icon: Network,
    }
  }, [userConnections.length, availableNodes.length, t])

  const progressStatus = getProgressStatus()
  const StatusIcon = progressStatus.icon

  // NEW: Helper function to get tooltip content based on node state
  const getTooltipContent = useCallback(
    (concept, isConnected, isSelected) => {
      let status = ''
      if (isConnected) {
        status = ` (${t('gameInterface.connected')})`
      } else if (isSelected) {
        status = ` (${t('status.selected')})`
      }
      return `${concept}${status}`
    },
    [t],
  )

  // NEW: Cleanup effect
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Container maxW="100%" px={isMobile ? 1 : 2} py={0}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        w="100%"
      >
        <VStack spacing={4} w="100%" align="center">
          {/* Header with connection counter */}
          <VStack spacing={3} w="100%">
            <VStack spacing={2} w="100%">
              <HStack
                justify="space-between"
                w="100%"
                wrap="wrap"
                spacing={2}
                flexDir={isMobile ? 'column' : 'row'}
                align="center"
              >
                <Badge
                  bg="rgba(245, 158, 11, 0.1)"
                  color="yellow.400"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  🔗 {t('gameTypes.connections').toUpperCase()}
                </Badge>

                <Badge
                  bg={`${progressStatus.color}20`}
                  color={progressStatus.color}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {progressStatus.label.toUpperCase()}
                </Badge>

                <HStack spacing={2}>
                  <Link2 size={14} color="#F59E0B" />
                  <Text fontSize="xs" color="yellow.400" fontWeight="bold">
                    {userConnections.length}/{MAX_CONNECTIONS}{' '}
                    {t('stats.connections')}
                  </Text>
                </HStack>
              </HStack>

              <Text
                fontSize={isMobile ? 'sm' : 'md'}
                color="gray.300"
                textAlign="center"
                fontWeight="500"
                px={2}
                lineHeight="1.4"
              >
                {t('gameInterface.createConnections')} •{' '}
                {t('gameInterface.pairAllNodes')} •{' '}
                {t('gameInterface.eachNodeOnce')}
              </Text>

              {/* Node availability status */}
              {userConnections.length > 0 &&
                userConnections.length < MAX_CONNECTIONS && (
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    w="100%"
                  >
                    <Alert
                      status="info"
                      size="sm"
                      borderRadius="lg"
                      bg="rgba(59, 130, 246, 0.1)"
                      border="1px solid"
                      borderColor="rgba(59, 130, 246, 0.3)"
                    >
                      <AlertIcon size={14} />
                      <AlertDescription fontSize="xs" color="white">
                        {t('alerts.nodeStatus', {
                          available: availableNodes.length,
                          connected: connectedNodes.size,
                        })}
                      </AlertDescription>
                    </Alert>
                  </MotionBox>
                )}

              {/* Limit warning when approaching or at limit */}
              {userConnections.length >= MAX_CONNECTIONS - 1 && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  w="100%"
                >
                  <Alert
                    status={
                      userConnections.length === MAX_CONNECTIONS
                        ? 'success'
                        : 'warning'
                    }
                    size="sm"
                    borderRadius="lg"
                    bg={
                      userConnections.length === MAX_CONNECTIONS
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)'
                    }
                    border="1px solid"
                    borderColor={
                      userConnections.length === MAX_CONNECTIONS
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(245, 158, 11, 0.3)'
                    }
                  >
                    <AlertIcon size={14} />
                    <AlertDescription fontSize="xs" color="white">
                      {userConnections.length === MAX_CONNECTIONS
                        ? t('alerts.perfectConnections')
                        : t(
                            `alerts.connectionsNeeded${
                              MAX_CONNECTIONS - userConnections.length > 1
                                ? 'Plural'
                                : ''
                            }`,
                            {
                              count: MAX_CONNECTIONS - userConnections.length,
                              available: availableNodes.length,
                            },
                          )}
                    </AlertDescription>
                  </Alert>
                </MotionBox>
              )}
            </VStack>
          </VStack>

          {/* Game Board */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            w="100%"
          >
            <Box
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="xl"
              position="relative"
              width={`${containerSize}px`}
              height={`${containerSize}px`}
              overflow="hidden"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
              mx="auto"
            >
              {/* SVG for connections */}
              <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                viewBox={`0 0 ${containerSize} ${containerSize}`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {connectionPaths.map(pathInfo => (
                    <linearGradient
                      key={pathInfo.gradientId}
                      id={pathInfo.gradientId}
                      x1={pathInfo.fromPos.x}
                      y1={pathInfo.fromPos.y}
                      x2={pathInfo.toPos.x}
                      y2={pathInfo.toPos.y}
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#8B5CF6"
                        stopOpacity={0.9}
                      />
                    </linearGradient>
                  ))}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="shadow">
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="4"
                      floodColor="rgba(0,0,0,0.3)"
                    />
                  </filter>
                </defs>

                {/* Render all paths first */}
                {connectionPaths.map(pathInfo => (
                  <motion.path
                    key={`${pathInfo.gradientId}-path`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    d={pathInfo.pathData}
                    stroke={`url(#${pathInfo.gradientId})`}
                    strokeWidth={isMobile ? '3' : '4'}
                    fill="none"
                    filter="url(#glow)"
                    strokeLinecap="round"
                  />
                ))}

                {/* Render all buttons on top of paths */}
                {connectionPaths.map(pathInfo => (
                  <g
                    key={`${pathInfo.gradientId}-button`}
                    transform={`translate(${pathInfo.removeBtnPos.x}, ${pathInfo.removeBtnPos.y})`}
                  >
                    <circle
                      r={isMobile ? '14' : '16'}
                      fill="rgba(239, 68, 68, 0.95)"
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        removeConnection(pathInfo.from, pathInfo.to)
                      }
                      filter="url(#shadow)"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="white"
                      fontSize={isMobile ? '12' : '14'}
                      fontWeight="bold"
                      style={{ pointerEvents: 'none' }}
                    >
                      ×
                    </text>
                  </g>
                ))}
              </svg>

              {/* Concept nodes with tooltips */}
              {concepts.map((concept, index) => {
                const pos = nodePositions[concept]
                if (!pos) return null
                const isSelected = selectedNodes.includes(concept)
                const isConnected = connectedNodes.has(concept)

                return (
                  <Tooltip
                    key={concept}
                    label={getTooltipContent(concept, isConnected, isSelected)}
                    placement="top"
                    hasArrow
                    bg="rgba(0, 0, 0, 0.9)"
                    color="white"
                    fontSize="xs"
                    borderRadius="md"
                    px={2}
                    py={1}
                    openDelay={300}
                    closeDelay={100}
                  >
                    <MotionBox
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: 'spring',
                        stiffness: 200,
                        damping: 20,
                      }}
                      whileHover={{
                        scale: isConnected ? 1 : 1.08,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{
                        scale: isConnected ? 1 : 0.92,
                      }}
                      onClick={() => handleNodeClick(concept)}
                      left={`${pos.x - nodeWidth / 2}px`}
                      top={`${pos.y - nodeHeight / 2}px`}
                      style={getNodeStyle(concept)}
                    >
                      <Text
                        lineHeight="1.3"
                        fontSize={useBreakpointValue({
                          base: '9px',
                          sm: '10px',
                          md: '11px',
                          lg: '12px',
                        })}
                        isTruncated
                        maxW="100%"
                        fontWeight="600"
                      >
                        {concept}
                      </Text>

                      {/* Icon indicators */}
                      {isSelected && (
                        <MotionBox
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                          position="absolute"
                          top={isMobile ? '4px' : '5px'}
                          right={isMobile ? '4px' : '5px'}
                        >
                          <Moon
                            size={isMobile ? 12 : 14}
                            color="rgba(255, 255, 255, 0.9)"
                            fill="rgba(255, 255, 255, 0.9)"
                          />
                        </MotionBox>
                      )}

                      {/* Lock icon for connected nodes */}
                      {isConnected && (
                        <MotionBox
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          position="absolute"
                          top={isMobile ? '4px' : '5px'}
                          right={isMobile ? '4px' : '5px'}
                        >
                          <Lock
                            size={isMobile ? 10 : 12}
                            color="rgba(255, 255, 255, 0.9)"
                            fill="rgba(255, 255, 255, 0.9)"
                          />
                        </MotionBox>
                      )}
                    </MotionBox>
                  </Tooltip>
                )
              })}
            </Box>
          </Box>

          {/* Connection List */}
          {userConnections.length > 0 && (
            <Box
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="lg"
              p={3}
              w="100%"
              backdropFilter="blur(10px)"
            >
              <HStack spacing={2} mb={3} justify="space-between" wrap="wrap">
                <HStack spacing={2}>
                  <Network size={16} color="#F59E0B" />
                  <Text fontSize="sm" fontWeight="bold" color="yellow.300">
                    {t('stats.connections')} ({userConnections.length}/
                    {MAX_CONNECTIONS})
                  </Text>
                </HStack>

                <Button
                  size="xs"
                  variant="ghost"
                  leftIcon={<Trash2 size={12} />}
                  onClick={clearAllConnections}
                  color="red.400"
                  fontSize="xs"
                  borderRadius="full"
                  px={3}
                  _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }}
                >
                  {t('actions.clearAll')}
                </Button>
              </HStack>

              <VStack spacing={2} maxH="120px" overflowY="auto">
                <AnimatePresence>
                  {userConnections.map((conn, idx) => (
                    <MotionBox
                      key={`${conn.from}-${conn.to}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      w="100%"
                    >
                      <Box
                        w="100%"
                        p={3}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderRadius="lg"
                        fontSize="xs"
                        border="1px solid rgba(255, 255, 255, 0.1)"
                      >
                        <HStack justify="space-between" align="center">
                          <HStack flex="1" spacing={3} align="center">
                            <Badge
                              bg="rgba(59, 130, 246, 0.2)"
                              color="blue.300"
                              px={2}
                              py={1}
                              borderRadius="md"
                              fontSize="2xs"
                              fontWeight="bold"
                            >
                              {idx + 1}
                            </Badge>
                            <Tooltip label={conn.from} placement="top" hasArrow>
                              <Text
                                color="white"
                                fontWeight="500"
                                fontSize="xs"
                                isTruncated
                                maxW={isMobile ? '70px' : 'auto'}
                              >
                                {conn.from}
                              </Text>
                            </Tooltip>
                            <Link2 size={12} color="#F59E0B" />
                            <Tooltip label={conn.to} placement="top" hasArrow>
                              <Text
                                color="white"
                                fontWeight="500"
                                fontSize="xs"
                                isTruncated
                                maxW={isMobile ? '70px' : 'auto'}
                              >
                                {conn.to}
                              </Text>
                            </Tooltip>
                            <Lock size={10} color="#DC2626" />
                          </HStack>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeConnection(conn.from, conn.to)}
                            p={1}
                            minW="auto"
                            borderRadius="full"
                            w="28px"
                            h="28px"
                            _hover={{ bg: 'rgba(239, 68, 68, 0.2)' }}
                          >
                            <X size={10} />
                          </Button>
                        </HStack>
                      </Box>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </VStack>
            </Box>
          )}

          {/* Enhanced Status */}
          <Box
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            borderRadius="lg"
            p={4}
            w="100%"
            textAlign="center"
            backdropFilter="blur(10px)"
          >
            {userConnections.length === MAX_CONNECTIONS ? (
              <VStack spacing={2}>
                <HStack justify="center" spacing={2}>
                  <Crown size={18} color="#FFD700" />
                  <Text color="yellow.400" fontWeight="600" fontSize="sm">
                    {t('gameInterface.perfectNetwork')}
                  </Text>
                </HStack>
                <Text color="gray.400" fontSize="xs">
                  {t('gameInterface.allNodesConnected')}
                </Text>
              </VStack>
            ) : userConnections.length > 0 ? (
              <VStack spacing={2}>
                <HStack justify="center" spacing={2}>
                  <StatusIcon size={18} color={progressStatus.color} />
                  <Text
                    color={progressStatus.color}
                    fontWeight="600"
                    fontSize="sm"
                  >
                    {t('gameInterface.greatProgress')}
                  </Text>
                </HStack>
                <Text color="gray.400" fontSize="xs">
                  {t(
                    `gameInterface.moreConnectionsNeeded${
                      MAX_CONNECTIONS - userConnections.length > 1
                        ? 'Plural'
                        : ''
                    }`,
                    {
                      count: MAX_CONNECTIONS - userConnections.length,
                    },
                  )}{' '}
                  • {t('gameInterface.pairRemaining')} {availableNodes.length}{' '}
                  {t('gameInterface.remainingNodes')}
                </Text>
              </VStack>
            ) : (
              <VStack spacing={2}>
                <HStack justify="center" spacing={2}>
                  <Target size={18} color="#6B7280" />
                  <Text color="gray.400" fontSize="sm">
                    {isMobile
                      ? t('gameInterface.tapToConnect')
                      : t('gameInterface.clickToConnect')}
                  </Text>
                </HStack>
                <Text color="gray.500" fontSize="xs">
                  {t('gameInterface.eachNodeOnce')} • {availableNodes.length}{' '}
                  {t('gameInterface.nodesAvailable')}
                </Text>
              </VStack>
            )}
          </Box>
        </VStack>
      </MotionBox>
    </Container>
  )
}

export default ConnectionsInterface
