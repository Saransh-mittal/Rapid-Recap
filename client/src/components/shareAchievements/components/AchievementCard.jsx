// src/components/shareAchievements/components/AchievementCard.jsx

import React from 'react'
import { VStack, Text, Box, Icon, Flex, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Star, Trophy, Brain, Crown } from 'lucide-react'

const AchievementCard = ({ stats, type }) => {
  const getIcon = label => {
    switch (label.toLowerCase()) {
      case 'level':
        return Star
      case 'global rank':
        return Crown
      case 'iq score':
        return Brain
      case 'quizzes solved':
        return Trophy
      default:
        return Trophy
    }
  }

  return (
    <Box
      borderRadius="3xl"
      bg="#1a1527"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      border="1px solid rgba(255,255,255,0.1)"
      overflow="hidden"
      position="relative"
      p={0}
      className="achievement-card"
    >
      {/* Header Background Gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="110px"
        bg="linear-gradient(to right, #805AD5, #D53F8C)"
        opacity={0.1}
      />

      <VStack spacing={4} align="stretch" p={6} h="full">
        {/* Header */}
        <VStack spacing={1}>
          {/* Using two text elements with different colors */}
          <Text
            fontSize="2xl"
            fontWeight="bold"
            textAlign="center"
            color="#D6BCFA" // Light purple color
            textShadow="0 0 10px rgba(214,188,250,0.3)"
            mb={0}
          >
            My Rapid Recap
          </Text>
          <Text
            fontSize="2xl"
            fontWeight="bold"
            textAlign="center"
            color="#E9D8FD" // Slightly lighter purple
            textShadow="0 0 10px rgba(233,216,253,0.3)"
            mt={0}
          >
            Journey
          </Text>
          <Text
            fontSize="md"
            color="whiteAlpha.700"
            textAlign="center"
            opacity={0.8}
          >
            {type}
          </Text>
        </VStack>

        {/* Stats */}
        <VStack spacing={4} flex={1} justify="center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ width: '100%' }}
            >
              <Box
                bg="rgba(255,255,255,0.03)"
                borderRadius="2xl"
                p={3}
                border="1px solid rgba(255,255,255,0.05)"
                _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                transition="all 0.2s"
              >
                <Flex justify="space-between" align="center">
                  <Flex align="center" gap={3}>
                    <Icon
                      as={getIcon(stat.label)}
                      color={stat.color}
                      w={5}
                      h={5}
                    />
                    <Text color="gray.300" fontSize={{ base: 'md', md: 'lg' }}>
                      {stat.label}
                    </Text>
                  </Flex>
                  <Text
                    fontWeight="bold"
                    color={stat.color}
                    fontSize={{ base: 'lg', md: 'xl' }}
                    textShadow="0 0 10px rgba(255,255,255,0.2)"
                  >
                    {stat.value}
                  </Text>
                </Flex>
              </Box>
            </motion.div>
          ))}
        </VStack>

        {/* Watermark */}
        <Flex
          justify="center"
          align="center"
          gap={2}
          mt="auto"
          opacity={0.7}
          backdropFilter="blur(4px)"
        >
          <Icon as={Brain} color="purple.400" w={4} h={4} />
          <Text color="whiteAlpha.900" fontSize="sm">
            rapidrecap.ai
          </Text>
        </Flex>
      </VStack>
    </Box>
  )
}

export default AchievementCard
