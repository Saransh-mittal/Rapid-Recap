// components/quickClashComponents/QuickClashLoader.jsx
import React from 'react'
import { Container, Center, VStack, Spinner, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const MotionText = motion(Text)

const QuickClashLoader = () => {
  const { t } = useTranslation('QuickClash')

  return (
    <Container maxW="container.lg" py={10}>
      <Center h="60vh">
        <VStack spacing={6}>
          <Spinner
            size="xl"
            thickness="4px"
            color="purple.500"
            emptyColor="whiteAlpha.200"
            speed="0.8s"
          />
          <MotionText
            color="whiteAlpha.800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {t('Preparing your challenge...')}
          </MotionText>
        </VStack>
      </Center>
    </Container>
  )
}

export default QuickClashLoader
