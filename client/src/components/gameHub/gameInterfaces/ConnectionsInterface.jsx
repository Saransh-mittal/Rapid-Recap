// components/gameHub/gameInterfaces/ConnectionsInterface.jsx - Fixed Infinite Loop Issues + Added Node Tooltips
import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react'
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
  Network,
  X,
  Moon,
  Lock,
  Crown,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MotionBox = motion(Box)

const ConnectionsInterface = memo(
  ({ gameData, onAnswer, selectedConnections = [] }) => {
    const [selectedNodes, setSelectedNodes] = useState([])
    const [userConnections, setUserConnections] = useState([])
    const { t } = useTranslation('GameHub')

    const isUpdatingRef = useRef(false)
    const debounceTimeoutRef = useRef(null)

    const isMobile = useBreakpointValue({ base: true, md: false })
    const containerSize = useBreakpointValue({
      base: 320,
      sm: 380,
      md: 440,
      lg: 480,
    })
    const nodeWidth = useBreakpointValue({ base: 85, sm: 90, md: 95, lg: 100 })
    const nodeHeight = useBreakpointValue({ base: 50, sm: 52, md: 55, lg: 58 })

    const { concepts } = gameData
    const conceptCount = concepts.length
    const MAX_CONNECTIONS = 4

    const connectedNodes = useMemo(() => {
      const connected = new Set()
      userConnections.forEach(conn => {
        if (conn?.from && conn?.to) {
          connected.add(conn.from)
          connected.add(conn.to)
        }
      })
      return connected
    }, [userConnections])

    const availableNodes = useMemo(
      () => concepts.filter(concept => !connectedNodes.has(concept)),
      [concepts, connectedNodes],
    )

    const debouncedOnAnswer = useCallback(
      connections => {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = setTimeout(() => {
          if (!isUpdatingRef.current) {
            isUpdatingRef.current = true
            onAnswer(connections)
            setTimeout(() => {
              isUpdatingRef.current = false
            }, 100)
          }
        }, 200)
      },
      [onAnswer],
    )

    useEffect(() => {
      debouncedOnAnswer(userConnections)
      return () => clearTimeout(debounceTimeoutRef.current)
    }, [userConnections, debouncedOnAnswer])

    useEffect(() => {
      if (
        Array.isArray(selectedConnections) &&
        selectedConnections.length > 0 &&
        userConnections.length === 0
      ) {
        const validConnections = selectedConnections
          .slice(0, MAX_CONNECTIONS)
          .filter(conn => conn?.from && conn?.to && conn.from !== conn.to)
        if (validConnections.length > 0) {
          setUserConnections(validConnections)
        }
      }
    }, [selectedConnections]) // Only run on initial prop change

    const nodePositions = useMemo(() => {
      const positions = {}
      if (conceptCount === 0) return positions
      const center = containerSize / 2
      const radius = center - Math.max(nodeWidth, nodeHeight) / 2 - 5
      for (let i = 0; i < conceptCount; i++) {
        const angle = (i * 2 * Math.PI) / conceptCount - Math.PI / 2
        positions[concepts[i]] = {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle),
        }
      }
      return positions
    }, [conceptCount, containerSize, nodeWidth, nodeHeight, concepts])

    const connectionPaths = useMemo(() => {
      return userConnections
        .map((conn, idx) => {
          const fromPos = nodePositions[conn.from]
          const toPos = nodePositions[conn.to]
          if (!fromPos || !toPos) return null
          const mx = (fromPos.x + toPos.x) / 2,
            my = (fromPos.y + toPos.y) / 2
          const vx = toPos.x - fromPos.x,
            vy = toPos.y - fromPos.y
          const px = -vy,
            py = vx
          const pLength = Math.sqrt(px * px + py * py)
          const nx = pLength === 0 ? 0 : px / pLength,
            ny = pLength === 0 ? 0 : py / pLength
          const cx = mx + nx * 25,
            cy = my + ny * 25
          const pathData = `M ${fromPos.x} ${fromPos.y} Q ${cx} ${cy} ${toPos.x} ${toPos.y}`
          const removeBtnPos = {
            x: 0.25 * fromPos.x + 0.5 * cx + 0.25 * toPos.x,
            y: 0.25 * fromPos.y + 0.5 * cy + 0.25 * toPos.y,
          }
          return {
            ...conn,
            pathData,
            removeBtnPos,
            fromPos,
            toPos,
            gradientId: `conn-${idx}`,
          }
        })
        .filter(Boolean)
    }, [userConnections, nodePositions])

    const hasReachedLimit = userConnections.length >= MAX_CONNECTIONS

    const handleNodeClick = useCallback(
      node => {
        if (
          isUpdatingRef.current ||
          !node ||
          connectedNodes.has(node) ||
          (hasReachedLimit && selectedNodes.length === 0)
        )
          return
        setSelectedNodes(prev => {
          if (prev.includes(node)) return prev.filter(n => n !== node)
          if (prev.length < 2) {
            const newSelected = [...prev, node]
            if (newSelected.length === 2) {
              const [from, to] = newSelected
              if (
                hasReachedLimit ||
                connectedNodes.has(from) ||
                connectedNodes.has(to)
              )
                return []
              const exists = userConnections.some(
                c =>
                  (c.from === from && c.to === to) ||
                  (c.from === to && c.to === from),
              )
              if (!exists) {
                setUserConnections(prevConns => [...prevConns, { from, to }])
              }
              return []
            }
            return newSelected
          }
          return prev
        })
      },
      [connectedNodes, hasReachedLimit, userConnections],
    )

    const removeConnection = useCallback((from, to) => {
      if (isUpdatingRef.current) return
      setUserConnections(prev =>
        prev.filter(
          c =>
            !(
              (c.from === from && c.to === to) ||
              (c.from === to && c.to === from)
            ),
        ),
      )
      setSelectedNodes([])
    }, [])

    const clearAllConnections = useCallback(() => {
      if (isUpdatingRef.current) return
      setUserConnections([])
      setSelectedNodes([])
    }, [])

    const getNodeStyle = useCallback(
      node => {
        const isSelected = selectedNodes.includes(node)
        const isConnected = connectedNodes.has(node)
        const isDisabled = isConnected || (hasReachedLimit && !isSelected)
        const baseStyle = {
          w: `${nodeWidth}px`,
          h: `${nodeHeight}px`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          fontSize: isMobile ? '9px' : '11px',
          fontWeight: '600',
          textAlign: 'center',
          p: '6px 8px',
          border: '2px solid',
          pos: 'absolute',
          transform: 'scale(1)',
          zIndex: 5,
          overflow: 'hidden',
          backdropFilter: 'blur(8px)',
        }
        if (isConnected)
          return {
            ...baseStyle,
            bg: 'linear-gradient(45deg, #3B82F6, #1E40AF)',
            borderColor: '#93C5FD',
            color: 'white',
            opacity: 0.9,
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
          }
        if (isSelected)
          return {
            ...baseStyle,
            bg: 'linear-gradient(45deg, #A855F7, #6D28D9)',
            borderColor: '#C4B5FD',
            color: 'white',
            boxShadow: '0 0 24px 6px rgba(168, 85, 247, 0.4)',
            transform: 'scale(1.05)',
            zIndex: 10,
          }
        if (isDisabled)
          return {
            ...baseStyle,
            bg: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(168, 85, 247, 0.3)',
            color: 'rgba(255, 255, 255, 0.5)',
            opacity: 0.6,
          }
        return {
          ...baseStyle,
          bg: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(168, 85, 247, 0.6)',
          color: 'white',
        }
      },
      [
        selectedNodes,
        connectedNodes,
        hasReachedLimit,
        nodeWidth,
        nodeHeight,
        isMobile,
      ],
    )

    const getTooltipContent = useCallback(
      (concept, isConnected, isSelected) => {
        let status = isConnected
          ? ` (${t('gameInterface.connected')})`
          : isSelected
          ? ` (${t('status.selected')})`
          : ''
        return `${concept}${status}`
      },
      [t],
    )

    const StatusIcon = hasReachedLimit
      ? Crown
      : userConnections.length > 0
      ? Network
      : Target
    const statusColor = hasReachedLimit
      ? '#10B981'
      : userConnections.length > 0
      ? '#F59E0B'
      : '#6B7280'

    return (
      <Container maxW="100%" px={isMobile ? 1 : 2} py={0}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          w="100%"
        >
          <VStack spacing={4} w="100%" align="center">
            <Text
              fontSize={isMobile ? 'sm' : 'md'}
              color="gray.300"
              textAlign="center"
              fontWeight="500"
              px={2}
              lineHeight="1.4"
            >
              {t('gameInterface.createConnections')} ({userConnections.length}/
              {MAX_CONNECTIONS})
            </Text>

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
                w={`${containerSize}px`}
                h={`${containerSize}px`}
                overflow="hidden"
                boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
                mx="auto"
              >
                <svg
                  width="100%"
                  height="100%"
                  style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                  viewBox={`0 0 ${containerSize} ${containerSize}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    {connectionPaths.map(p => (
                      <linearGradient
                        key={p.gradientId}
                        id={p.gradientId}
                        x1={p.fromPos.x}
                        y1={p.fromPos.y}
                        x2={p.toPos.x}
                        y2={p.toPos.y}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    ))}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="cBlur" />
                      <feMerge>
                        <feMergeNode in="cBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {connectionPaths.map(p => (
                    <motion.path
                      key={p.gradientId}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      d={p.pathData}
                      stroke={`url(#${p.gradientId})`}
                      strokeWidth={isMobile ? 3 : 4}
                      fill="none"
                      filter="url(#glow)"
                      strokeLinecap="round"
                    />
                  ))}
                  {connectionPaths.map(p => (
                    <g
                      key={`${p.gradientId}-btn`}
                      transform={`translate(${p.removeBtnPos.x}, ${p.removeBtnPos.y})`}
                    >
                      <circle
                        r={isMobile ? 14 : 16}
                        fill="rgba(239, 68, 68, 0.95)"
                        stroke="#fff"
                        strokeWidth="2"
                        cursor="pointer"
                        onClick={() => removeConnection(p.from, p.to)}
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#fff"
                        fontSize={isMobile ? 12 : 14}
                        fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
                      >
                        ×
                      </text>
                    </g>
                  ))}
                </svg>
                {concepts.map((concept, index) => {
                  const pos = nodePositions[concept]
                  if (!pos) return null
                  const isConnected = connectedNodes.has(concept)
                  const isSelected = selectedNodes.includes(concept)
                  return (
                    <Tooltip
                      key={concept}
                      label={getTooltipContent(
                        concept,
                        isConnected,
                        isSelected,
                      )}
                      placement="top"
                      hasArrow
                      bg="rgba(0,0,0,0.9)"
                      color="#fff"
                      fontSize="xs"
                      borderRadius="md"
                      openDelay={300}
                    >
                      <MotionBox
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                          type: 'spring',
                        }}
                        whileHover={{ scale: isConnected ? 1 : 1.08 }}
                        whileTap={{ scale: isConnected ? 1 : 0.92 }}
                        onClick={() => handleNodeClick(concept)}
                        left={`${pos.x - nodeWidth / 2}px`}
                        top={`${pos.y - nodeHeight / 2}px`}
                        style={getNodeStyle(concept)}
                      >
                        <Text isTruncated maxW="100%">
                          {concept}
                        </Text>
                        {isSelected && (
                          <MotionBox
                            pos="absolute"
                            top="5px"
                            right="5px"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Moon
                              size={isMobile ? 12 : 14}
                              color="#fff"
                              fill="#fff"
                            />
                          </MotionBox>
                        )}
                        {isConnected && (
                          <MotionBox
                            pos="absolute"
                            top="5px"
                            right="5px"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            <Lock
                              size={isMobile ? 10 : 12}
                              color="#fff"
                              fill="#fff"
                            />
                          </MotionBox>
                        )}
                      </MotionBox>
                    </Tooltip>
                  )
                })}
              </Box>
            </Box>
            {userConnections.length > 0 && (
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Trash2 size={12} />}
                onClick={clearAllConnections}
                color="red.400"
              >
                {t('actions.clearAll')}
              </Button>
            )}
            <Box
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="lg"
              p={4}
              w="100%"
              textAlign="center"
            >
              <VStack spacing={2}>
                <HStack justify="center" spacing={2}>
                  <StatusIcon size={18} color={statusColor} />
                  <Text color={statusColor} fontWeight="600" fontSize="sm">
                    {hasReachedLimit
                      ? t('gameInterface.perfectNetwork')
                      : userConnections.length > 0
                      ? t('gameInterface.greatProgress')
                      : isMobile
                      ? t('gameInterface.tapToConnect')
                      : t('gameInterface.clickToConnect')}
                  </Text>
                </HStack>
                <Text color="gray.400" fontSize="xs">
                  {hasReachedLimit
                    ? t('gameInterface.allNodesConnected')
                    : `${t('gameInterface.pairRemaining')} ${
                        availableNodes.length
                      } ${t('gameInterface.remainingNodes')}`}
                </Text>
              </VStack>
            </Box>
          </VStack>
        </MotionBox>
      </Container>
    )
  },
)
ConnectionsInterface.displayName = 'ConnectionsInterface'

export default ConnectionsInterface
