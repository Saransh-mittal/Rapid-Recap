import React, { useState, useEffect } from 'react'
import { Box, Text, VStack, Grid } from '@chakra-ui/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
} from 'recharts'
import { fadeIn, glowPulse, scaleIn, slideIn } from './animations'

const IQJourneyGraph = ({ start, current, peak }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const generateData = () => {
    return [
      { name: 'Start', value: start },
      { name: 'Peak', value: peak },
      { name: 'Current', value: current },
    ]
  }

  return (
    <Box
      w="full"
      p={6}
      borderRadius="2xl"
      bg="rgba(255, 255, 255, 0.03)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      position="relative"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }}
      style={{
        animation: `${fadeIn} 0.6s ease-out forwards`,
      }}
    >
      <VStack spacing={6}>
        <Text
          color="white"
          fontSize="xl"
          fontWeight="semibold"
          style={{
            animation: `${slideIn} 0.4s ease-out forwards`,
          }}
        >
          IQ Journey
        </Text>

        <Box
          w="full"
          h="300px"
          opacity={isVisible ? 1 : 0}
          transform={isVisible ? 'scale(1)' : 'scale(0.95)'}
          transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <ResponsiveContainer>
            <LineChart
              data={generateData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.6)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'rgba(13, 16, 31, 0.95)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                itemStyle={{ color: '#EC4899' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#colorGradient)"
                fillOpacity={0.2}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#EC4899"
                strokeWidth={3}
                dot={{
                  r: 6,
                  fill: '#EC4899',
                  stroke: 'white',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: '#EC4899',
                  stroke: 'white',
                  strokeWidth: 2,
                  style: {
                    animation: `${glowPulse} 2s infinite`,
                  },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* IQ Stats Summary */}
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={4}
          w="full"
          opacity={isVisible ? 1 : 0}
          transform={isVisible ? 'translateY(0)' : 'translateY(20px)'}
          transition="all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          {[
            { label: 'Starting IQ', value: start, color: 'blue.400' },
            { label: 'Current IQ', value: current, color: 'pink.400' },
            { label: 'Peak IQ', value: peak, color: 'purple.400' },
          ].map((stat, index) => (
            <Box
              key={index}
              p={4}
              borderRadius="xl"
              bg="rgba(255, 255, 255, 0.05)"
              border="1px solid"
              borderColor={stat.color}
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: `0 0 20px ${stat.color}33`,
              }}
              style={{
                animation: `${fadeIn} 0.6s ease-out ${index * 0.2}s forwards`,
              }}
            >
              <VStack spacing={2}>
                <Text
                  color={stat.color}
                  fontSize="2xl"
                  fontWeight="bold"
                  style={{
                    animation: `${scaleIn} 0.4s ease-out ${
                      index * 0.2 + 0.2
                    }s forwards`,
                  }}
                >
                  {stat.value}
                </Text>
                <Text color="whiteAlpha.700" fontSize="sm">
                  {stat.label}
                </Text>
              </VStack>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Box>
  )
}
export default IQJourneyGraph
