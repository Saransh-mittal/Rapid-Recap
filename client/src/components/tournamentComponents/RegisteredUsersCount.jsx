import React from 'react'
import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

const MotionBox = motion(Box)

const RegisteredUsersCount = ({ count }) => {
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.08)',
    'rgba(0, 0, 0, 0.3)',
  )
  const borderColor = useColorModeValue('pink.200', 'pink.700')

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        p={6}
        borderWidth={2}
        borderColor={borderColor}
        boxShadow="xl"
      >
        <Stat>
          <StatLabel
            fontSize="lg"
            fontWeight="semibold"
            color="pink.300"
            display="flex"
            alignItems="center"
          >
            <Users size={20} style={{ marginRight: '0.5rem' }} />
            Registered Participants
          </StatLabel>
          <StatNumber fontSize="4xl" fontWeight="bold" color="white">
            {count}
          </StatNumber>
          <StatHelpText color="gray.400">
            Join the epic quest for knowledge!
          </StatHelpText>
        </Stat>
      </Box>
    </MotionBox>
  )
}

export default RegisteredUsersCount
