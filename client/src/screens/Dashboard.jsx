import React, { Suspense } from 'react'
import {
  Box,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
  useMediaQuery,
  useColorModeValue,
} from '@chakra-ui/react'
import { DashboardTabs } from './DashboardTabs'

const Dashboard = () => {
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)')
  const textColor = useColorModeValue('gray.200', 'gray.200')

  return (
    <Box minHeight="100vh" mt={'4.5rem'} px={isLargerThan768 ? '2rem' : '0rem'}>
      <Container maxW="container.xl" py={8}>
        <Flex direction="column" align="center" mb={8}>
          <Heading
            as="h1"
            size={isLargerThan768 ? '2xl' : 'lg'}
            mb={2}
            p={2}
            borderRadius="md"
            color={textColor}
            textAlign="center"
          >
            Dashboard
          </Heading>
          <Text fontSize={isLargerThan768 ? 'lg' : 'md'} color="gray.500">
            Manage and analyze your application data
          </Text>
        </Flex>

        <Suspense fallback={<Spinner />}>
          <DashboardTabs />
        </Suspense>
      </Container>
    </Box>
  )
}

export default React.memo(Dashboard)
