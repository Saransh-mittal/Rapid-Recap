import React from 'react'
import { Container, VStack, Box, Heading, Text } from '@chakra-ui/react'
import ActiveChallenges from '../components/quickClashComponents/ActiveChallenges'

const QuickClash = () => {
  return (
    <Container maxW="container.xl" py={8} mt={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="xl" color="whiteAlpha.900">
            Quick Clash
          </Heading>
          <Text color="whiteAlpha.700" mt={2}>
            Challenge other players to rapid-fire reading and quiz battles!
          </Text>
        </Box>

        <Box
          bg="rgba(14, 12, 22, 0.97)"
          borderRadius="xl"
          p={6}
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <ActiveChallenges />
        </Box>
      </VStack>
    </Container>
  )
}

export default QuickClash
