// components/quickClashComponents/QuickClashError.jsx
import React from 'react'
import {
  Container,
  Center,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  Box,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { XCircle, ArrowLeft } from 'lucide-react'

const MotionBox = motion(Box)

const QuickClashError = ({ error, onBackClick }) => {
  const { t } = useTranslation('QuickClash')

  return (
    <Container maxW="container.lg" py={10}>
      <Center h="60vh">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          maxW="600px"
        >
          <VStack
            spacing={6}
            p={8}
            borderRadius="xl"
            bg="rgba(26, 32, 44, 0.5)"
            borderWidth="1px"
            borderColor="red.500"
          >
            <Icon as={XCircle} boxSize={12} color="red.400" />
            <Heading size="md" color="white">
              {t('Error')}
            </Heading>
            <Text color="whiteAlpha.800" textAlign="center">
              {error}
            </Text>
            <Button
              leftIcon={<ArrowLeft />}
              onClick={onBackClick}
              bgGradient="linear(to-r, purple.500, purple.700)"
              _hover={{ bgGradient: 'linear(to-r, purple.600, purple.800)' }}
            >
              {t('Back to Challenges')}
            </Button>
          </VStack>
        </MotionBox>
      </Center>
    </Container>
  )
}

export default QuickClashError
