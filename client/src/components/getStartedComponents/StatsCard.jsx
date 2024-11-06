import React from 'react'
import {
  Box,
  VStack,
  Text,
  Stat,
  StatNumber,
  StatLabel,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'

// Enhanced StatsCard with animation and better visual hierarchy
const StatsCard = ({ icon: Icon, value, label, subtext, COLORS }) => (
  <Box
    as={motion.div}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    w="100%"
    bg={COLORS.darkBg}
    borderRadius="xl"
    p={3}
    border="1px solid"
    borderColor={COLORS.cardBorder}
    _hover={{
      transform: 'translateY(-5px)',
      borderColor: COLORS.accent,
      boxShadow: `0 0 20px ${COLORS.accent}33`,
    }}
  >
    <VStack spacing={2}>
      <Icon size={24} color={COLORS.accent} />
      <Stat textAlign="center">
        <StatNumber fontSize="2xl" fontWeight="bold" color="white">
          {value}
        </StatNumber>
        <StatLabel fontSize={'sm'} color="whiteAlpha.800">
          {label}
        </StatLabel>
      </Stat>
      {subtext && (
        <Text mt={-3} fontSize="xs" color="whiteAlpha.600">
          {subtext}
        </Text>
      )}
    </VStack>
  </Box>
)

export default StatsCard
