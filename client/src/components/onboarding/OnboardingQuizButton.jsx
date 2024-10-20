import React from 'react'
import { Box, Button, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const OnboardingQuizButton = ({ onClick }) => {
  const { t } = useTranslation('OnboardingQuizButton')

  return (
    <Box m={4} width="100%">
      <Button
        onClick={onClick}
        width="100%"
        height="auto"
        py={3}
        px={6}
        borderRadius="full"
        bgGradient="linear(to-r, rgba(253, 226, 243, 1), rgba(229, 190, 236, 1))"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.3s ease"
      >
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="rgba(42, 47, 79, 1)"
          textAlign="center"
          width="100%"
          m={0}
          py={2}
          fontFamily="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        >
          {t('takeQuiz')}
        </Text>
      </Button>
    </Box>
  )
}

export default OnboardingQuizButton
